import Registration from '../models/Registration.model.js';
import ReferralUsageLog from '../models/ReferralUsageLog.model.js';

export async function resolveReferral({ submittedCode, phones, ip, memberCount, submissionId }) {
  const result = {
    finalReferredBy: null,
    finalRegistrationSource: 'web',
    shouldCredit: false,
    usageLog: null,
  };

  if (!submittedCode) return result;

  const referrer = await Registration.findOne({
    referralCode: submittedCode,
    wantsReferral: true,
  });

  if (!referrer) return result;

  const phoneSet = new Set(phones.filter(Boolean));
  if (referrer.phone && phoneSet.has(referrer.phone)) {
    return result;
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const [recentByCode, recentByIp] = await Promise.all([
    ReferralUsageLog.countDocuments({
      referralCode: submittedCode,
      createdAt: { $gte: tenMinutesAgo },
    }),
    ip
      ? ReferralUsageLog.countDocuments({
          ip,
          createdAt: { $gte: tenMinutesAgo },
        })
      : Promise.resolve(0),
  ]);

  const flaggedForAbuse = recentByCode >= 5 || recentByIp >= 3;

  // Block credit when abuse is detected — still log it for review
  result.finalReferredBy = submittedCode;
  result.finalRegistrationSource = flaggedForAbuse ? 'web' : 'referral-link';
  result.shouldCredit = !flaggedForAbuse;
  result.usageLog = {
    referralCode: submittedCode,
    submissionId,
    memberCount,
    ip,
    flaggedForAbuse,
  };

  return result;
}
