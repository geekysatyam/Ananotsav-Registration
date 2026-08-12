import { buildSignedPayload } from '../services/hmac.service.js';

export function shapeRegistration(doc) {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    isPrimaryRegistrant: doc.isPrimaryRegistrant,
    entryCode: doc.entryCode,
    signedPayload: buildSignedPayload(doc.entryCode),
    wantsReferral: doc.wantsReferral,
    referralCode: doc.referralCode ?? null,
    referredBy: doc.referredBy ?? null,
    familyGroupId: doc.familyGroupId ?? null,
    checkedIn: doc.checkedIn,
    checkInTime: doc.checkInTime ?? null,
    freebieClaimed: doc.freebieClaimed,
  };
}
