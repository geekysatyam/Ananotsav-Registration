import { buildSignedPayload } from '../services/hmac.service.js';

/** Child first names only — no DOB / getup on public responses. */
function shapeFancyDressPublic(entries) {
  return (entries ?? []).map((e) => ({
    childName: e.childName,
  }));
}

/**
 * Public shape after register / find-my-registration.
 * Includes QR signedPayload; redacts minors' DOB and getup detail.
 */
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
    wantsVolunteer: doc.wantsVolunteer ?? false,
    wantsPanchamritAbhishek: doc.wantsPanchamritAbhishek ?? false,
    wantsFancyDress: doc.wantsFancyDress ?? false,
    fancyDressEntries: shapeFancyDressPublic(doc.fancyDressEntries),
    wantsLadduGopal: doc.wantsLadduGopal ?? false,
    ladduGopalSize: doc.ladduGopalSize ?? null,
  };
}
