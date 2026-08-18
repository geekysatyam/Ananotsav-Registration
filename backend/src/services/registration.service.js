import { nanoid } from 'nanoid';
import Registration from '../models/Registration.model.js';
// REFERRAL DISABLED
// import ReferralUsageLog from '../models/ReferralUsageLog.model.js';
// import { resolveReferral } from './fraudCheck.service.js';
import { generateEntryCodes } from './entryCode.service.js';
// import { generateReferralCode } from './referralCode.service.js';
import { shapeRegistration } from '../utils/shapeRegistration.js';
import { withOptionalTransaction, sessionOpts } from '../utils/withOptionalTransaction.js';
import { nameDobKey, findByNameDob } from '../utils/normalizeName.js';

function parseDob(dobString) {
  return new Date(dobString);
}

export async function createRegistrationBatch({
  primary,
  members = [],
  registrationSourceOverride = null,
  ip = null,
}) {
  const memberList = primary.wantsFancyDress ? [] : [...(members ?? [])];
  const familyGroupId = memberList.length > 0 ? nanoid(10) : null;
  // REFERRAL DISABLED
  // const submissionId = nanoid();
  // const memberCount = 1 + memberList.length;
  // const phones = [primary.phone, ...memberList.map((m) => m.phone)];
  //
  // const referralResolution = registrationSourceOverride === 'desk-manual'
  //   ? {
  //       finalReferredBy: primary.referredBy || null,
  //       finalRegistrationSource: 'desk-manual',
  //       shouldCredit: false,
  //       usageLog: null,
  //     }
  //   : await resolveReferral({
  //       submittedCode: primary.referredBy || null,
  //       phones,
  //       ip,
  //       memberCount,
  //       submissionId,
  //     });
  //
  // const source =
  //   registrationSourceOverride === 'desk-manual'
  //     ? 'desk-manual'
  //     : referralResolution.finalRegistrationSource;
  const source = registrationSourceOverride === 'desk-manual' ? 'desk-manual' : 'web';

  const { primaryDoc, memberDocs } = await withOptionalTransaction(async (session) => {
    const opts = sessionOpts(session);
    const duplicates = [];
    const batchMemberKeys = new Set();

    const primaryExisting = await Registration.findOne(
      { phone: primary.phone, dob: parseDob(primary.dob) },
      null,
      opts,
    );
    if (primaryExisting) {
      duplicates.push({
        name: primary.fullName,
        suggestion: 'use-find-my-registration',
        kind: 'primary',
      });
    }

    const primaryMemberKey = nameDobKey(primary.fullName, primary.dob);
    const flaggedMembers = new Set();

    for (const m of memberList) {
      const memberKey = nameDobKey(m.fullName, m.dob);
      if (flaggedMembers.has(memberKey)) continue;

      const flagMember = (name) => {
        flaggedMembers.add(memberKey);
        duplicates.push({
          name,
          suggestion: 'duplicate-member',
          kind: 'member',
        });
      };

      if (batchMemberKeys.has(memberKey)) {
        flagMember(m.fullName);
        continue;
      }
      batchMemberKeys.add(memberKey);

      if (memberKey === primaryMemberKey) {
        flagMember(m.fullName);
        continue;
      }

      const existing = await findByNameDob(Registration, m.fullName, parseDob(m.dob), opts);
      if (existing) {
        duplicates.push({
          name: m.fullName,
          suggestion: 'duplicate-member',
          kind: 'member',
        });
        flaggedMembers.add(memberKey);
        continue;
      }

      const phoneExisting = await Registration.findOne(
        { phone: m.phone, dob: parseDob(m.dob) },
        null,
        opts,
      );
      if (phoneExisting) {
        duplicates.push({
          name: m.fullName,
          suggestion: 'duplicate-member',
          kind: 'member',
        });
        flaggedMembers.add(memberKey);
      }
    }

    if (duplicates.length > 0) {
      const err = new Error('Duplicate user — already registered');
      err.code = 'DUPLICATE_REGISTRATION';
      err.statusCode = 409;
      err.duplicates = duplicates;
      throw err;
    }

    const [primaryEntryCode, ...memberEntryCodes] = await generateEntryCodes(
      1 + memberList.length,
      session,
    );

    // REFERRAL DISABLED
    // let primaryReferralCode = null;
    // if (primary.wantsReferral) {
    //   primaryReferralCode = await generateReferralCode(session);
    // }

    const isDesk = registrationSourceOverride === 'desk-manual';
    const deskNow = isDesk ? new Date() : null;
    const deskCheckInFields = isDesk
      ? {
          checkedIn: true,
          checkInTime: deskNow,
          freebieClaimed: true,
          freebieClaimTime: deskNow,
          verifiedBySignature: false,
        }
      : {};

    const primaryFields = {
      fullName: primary.fullName,
      phone: primary.phone,
      dob: parseDob(primary.dob),
      city: primary.city,
      familyGroupId,
      isPrimaryRegistrant: true,
      entryCode: primaryEntryCode,
      // REFERRAL DISABLED
      // wantsReferral: primary.wantsReferral,
      // referredBy: referralResolution.finalReferredBy,
      registrationSource: source,
      wantsVolunteer: Boolean(primary.wantsVolunteer),
      wantsPanchamritAbhishek: Boolean(primary.wantsPanchamritAbhishek),
      wantsFancyDress: Boolean(primary.wantsFancyDress),
      fancyDressParentPhone: primary.wantsFancyDress ? primary.phone : null,
      fancyDressGetup: primary.wantsFancyDress
        ? (primary.fancyDressGetup ?? '').trim()
        : '',
      fancyDressEntries: primary.wantsFancyDress
        ? [
            {
              childName: primary.fullName.trim(),
              childDob: parseDob(primary.dob),
              getupDetail: (primary.fancyDressGetup ?? '').trim(),
            },
          ]
        : [],
      wantsLadduGopal: Boolean(primary.wantsLadduGopal),
      ladduGopalSize: primary.wantsLadduGopal
        ? (primary.ladduGopalSize ?? '').trim() || null
        : null,
      ...deskCheckInFields,
    };
    // REFERRAL DISABLED
    // if (primaryReferralCode) {
    //   primaryFields.referralCode = primaryReferralCode;
    // }

    const primaryDoc = new Registration(primaryFields);
    await primaryDoc.save(opts);

    const memberDocs = [];
    for (let i = 0; i < memberList.length; i++) {
      const m = memberList[i];
      const doc = new Registration({
        fullName: m.fullName,
        phone: m.phone,
        dob: parseDob(m.dob),
        city: primary.city,
        familyGroupId,
        isPrimaryRegistrant: false,
        entryCode: memberEntryCodes[i],
        // REFERRAL DISABLED
        // wantsReferral: false,
        // referredBy: null,
        registrationSource: source,
        ...deskCheckInFields,
      });
      await doc.save(opts);
      memberDocs.push(doc);
    }

    // REFERRAL DISABLED
    // if (
    //   registrationSourceOverride !== 'desk-manual' &&
    //   referralResolution.shouldCredit &&
    //   referralResolution.finalReferredBy
    // ) {
    //   await Registration.updateOne(
    //     { referralCode: referralResolution.finalReferredBy },
    //     { $inc: { referralCount: memberCount } },
    //     opts,
    //   );
    //   if (referralResolution.usageLog) {
    //     await ReferralUsageLog.create([referralResolution.usageLog], opts);
    //   }
    // }

    return { primaryDoc, memberDocs };
  });

  const registrations = [primaryDoc, ...memberDocs].map(shapeRegistration);
  return { familyGroupId, registrations };
}
