import { success, error } from '../utils/apiResponse.js';
import { createRegistrationBatch } from '../services/registration.service.js';

export async function register(req, res) {
  try {
    const { primary, members } = req.validated;
    const { familyGroupId, registrations } = await createRegistrationBatch({
      primary,
      members,
      ip: req.ip,
    });
    return success(res, { familyGroupId, registrations }, 201);
  } catch (err) {
    if (err.code === 'DUPLICATE_REGISTRATION') {
      return error(res, 'DUPLICATE_REGISTRATION', err.message, 409, {
        data: { duplicates: err.duplicates },
      });
    }
    throw err;
  }
}
