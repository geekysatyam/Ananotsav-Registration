import mongoose from 'mongoose';
import Registration from '../models/Registration.model.js';
import { success, error } from '../utils/apiResponse.js';
import { shapeRegistration } from '../utils/shapeRegistration.js';

export async function getRegistrationById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return error(res, 'NOT_FOUND', 'Registration not found', 404);
  }
  const doc = await Registration.findById(req.params.id);
  if (!doc) {
    return error(res, 'NOT_FOUND', 'Registration not found', 404);
  }
  return success(res, shapeRegistration(doc));
}

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
