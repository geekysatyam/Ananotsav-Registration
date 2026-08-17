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
    wantsVolunteer: doc.wantsVolunteer ?? false,
    wantsPanchamritAbhishek: doc.wantsPanchamritAbhishek ?? false,
    wantsFancyDress: doc.wantsFancyDress ?? false,
    fancyDressEntries: (doc.fancyDressEntries ?? []).map((e) => ({
      childName: e.childName,
      childDob: e.childDob,
      getupDetail: e.getupDetail ?? '',
    })),
    wantsLadduGopal: doc.wantsLadduGopal ?? false,
    ladduGopalSize: doc.ladduGopalSize ?? null,
  };
}
