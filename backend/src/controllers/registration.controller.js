import { createRegistrationBatch } from '../services/registration.service.js';
import { success, error } from '../utils/apiResponse.js';
import { queueRegistrationWhatsApp } from '../services/whatsapp/index.js';
import logger from '../utils/logger.js';

export async function register(req, res) {
  try {
    const { primary, members } = req.validated;
    const { familyGroupId, registrations } = await createRegistrationBatch({
      primary,
      members,
      ip: req.ip,
    });

    // Non-blocking: enqueue after DB success; never fail the HTTP response
    queueRegistrationWhatsApp({ familyGroupId, registrations }, { phone: primary.phone }).catch(
      (err) => logger.warn({ err: err?.message }, 'WhatsApp enqueue ignored'),
    );

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
