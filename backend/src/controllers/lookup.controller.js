import Registration from '../models/Registration.model.js';
import { success } from '../utils/apiResponse.js';
import { shapeRegistration } from '../utils/shapeRegistration.js';

export async function findRegistration(req, res) {
  const { phone, dob } = req.validated;
  const doc = await Registration.findOne({ phone, dob: new Date(dob) });

  if (!doc) {
    return success(res, null);
  }

  const familyQuery = doc.familyGroupId
    ? { familyGroupId: doc.familyGroupId }
    : { phone: doc.phone, city: doc.city };

  const familyDocs = await Registration.find(familyQuery).sort({
    isPrimaryRegistrant: -1,
    createdAt: 1,
  });

  return success(res, {
    familyGroupId: doc.familyGroupId ?? null,
    registrations: familyDocs.map(shapeRegistration),
  });
}
