import { nanoid } from 'nanoid';
import Registration from '../models/Registration.model.js';
import ReferralUsageLog from '../models/ReferralUsageLog.model.js';
import { resolveReferral } from './fraudCheck.service.js';
import { generateEntryCode } from './entryCode.service.js';
import { generateReferralCode } from './referralCode.service.js';
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
  const memberList = members ?? [];
  const familyGroupId = memberList.length > 0 ? nanoid(10) : null;
  const submissionId = nanoid();
  const memberCount = 1 + memberList.length;
  const phones = [primary.phone, ...memberList.map((m) => m.phone || primary.phone)];

  const referralResolution = registrationSourceOverride === 'desk-manual'
    ? {
        finalReferredBy: primary.referredBy || null,
        finalRegistrationSource: 'desk-manual',
        shouldCredit: false,
        usageLog: null,
      }
    : await resolveReferral({
        submittedCode: primary.referredBy || null,
        phones,
        ip,
        memberCount,
        submissionId,
      });

  const source =
    registrationSourceOverride === 'desk-manual'
      ? 'desk-manual'
      : referralResolution.finalRegistrationSource;

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
        matchedRegistrationId: primaryExisting._id,
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
          matchedRegistrationId: existing._id,
          suggestion: 'duplicate-member',
          kind: 'member',
        });
        flaggedMembers.add(memberKey);
        continue;
      }

      if (m.phone) {
        const phoneExisting = await Registration.findOne(
          { phone: m.phone, dob: parseDob(m.dob) },
          null,
          opts,
        );
        if (phoneExisting) {
          duplicates.push({
            name: m.fullName,
            matchedRegistrationId: phoneExisting._id,
            suggestion: 'duplicate-member',
            kind: 'member',
          });
          flaggedMembers.add(memberKey);
        }
      }
    }

    if (duplicates.length > 0) {
      const err = new Error('Duplicate user — already registered');
      err.code = 'DUPLICATE_REGISTRATION';
      err.statusCode = 409;
      err.duplicates = duplicates;
      throw err;
    }

    const primaryEntryCode = await generateEntryCode(session);
    const memberEntryCodes = [];
    for (const _ of memberList) {
      memberEntryCodes.push(await generateEntryCode(session));
    }

    let primaryReferralCode = null;
    if (primary.wantsReferral) {
      primaryReferralCode = await generateReferralCode(session);
    }

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
      wantsReferral: primary.wantsReferral,
      referredBy: referralResolution.finalReferredBy,
      registrationSource: source,
      ...deskCheckInFields,
    };
    if (primaryReferralCode) {
      primaryFields.referralCode = primaryReferralCode;
    }

    const primaryDoc = new Registration(primaryFields);
    await primaryDoc.save(opts);

    const memberDocs = [];
    for (let i = 0; i < memberList.length; i++) {
      const m = memberList[i];
      const doc = new Registration({
        fullName: m.fullName,
        phone: m.phone || primary.phone,
        dob: parseDob(m.dob),
        city: primary.city,
        familyGroupId,
        isPrimaryRegistrant: false,
        entryCode: memberEntryCodes[i],
        wantsReferral: false,
        referredBy: null,
        registrationSource: source,
        ...deskCheckInFields,
      });
      await doc.save(opts);
      memberDocs.push(doc);
    }

    if (
      registrationSourceOverride !== 'desk-manual' &&
      referralResolution.shouldCredit &&
      referralResolution.finalReferredBy
    ) {
      await Registration.updateOne(
        { referralCode: referralResolution.finalReferredBy },
        { $inc: { referralCount: memberCount } },
        opts,
      );
      if (referralResolution.usageLog) {
        await ReferralUsageLog.create([referralResolution.usageLog], opts);
      }
    }

    return { primaryDoc, memberDocs };
  });

  const registrations = [primaryDoc, ...memberDocs].map(shapeRegistration);
  return { familyGroupId, registrations };
}
