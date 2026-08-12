import Registration from '../models/Registration.model.js';
import { verify } from '../services/hmac.service.js';
import { success, error } from '../utils/apiResponse.js';

function checkinSuccessShape(doc) {
  return {
    fullName: doc.fullName,
    entryCode: doc.entryCode,
    checkedIn: doc.checkedIn,
    checkInTime: doc.checkInTime,
    freebieClaimed: doc.freebieClaimed,
    freebieClaimTime: doc.freebieClaimed ? doc.freebieClaimTime : null,
    verifiedBySignature: doc.verifiedBySignature,
  };
}

export async function scanCheckin(req, res) {
  const { signedPayload } = req.validated;
  const dotIndex = signedPayload.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === signedPayload.length - 1) {
    return error(res, 'MALFORMED_PAYLOAD', 'Malformed signed payload', 400);
  }

  const entryCode = signedPayload.slice(0, dotIndex);
  const signature = signedPayload.slice(dotIndex + 1);

  // Verify signature first — pure CPU, no DB needed
  if (!verify(entryCode, signature)) {
    // Still need to confirm the entryCode exists before returning SIGNATURE_MISMATCH
    const exists = await Registration.exists({ entryCode });
    if (!exists) return error(res, 'NOT_FOUND', 'Registration not found', 404);
    return error(res, 'SIGNATURE_MISMATCH', 'Signature verification failed', 409, {
      data: { requiresOverride: true, entryCode },
    });
  }

  // Single atomic DB call — fetches, checks, and updates in one round trip
  const now = new Date();
  const registration = await Registration.findOneAndUpdate(
    { entryCode, checkedIn: false },
    { $set: { checkedIn: true, checkInTime: now, freebieClaimed: true, freebieClaimTime: now, verifiedBySignature: true } },
    { new: true },
  );

  if (registration) {
    return success(res, checkinSuccessShape(registration));
  }

  // Update matched nothing — either not found or already checked in
  const existing = await Registration.findOne(
    { entryCode },
    { fullName: 1, checkedIn: 1, checkInTime: 1 },
  );
  if (!existing) return error(res, 'NOT_FOUND', 'Registration not found', 404);
  return error(res, 'ALREADY_CHECKED_IN', 'Already checked in', 409, {
    data: { checkInTime: existing.checkInTime, fullName: existing.fullName },
  });
}

export async function scanCheckinOverride(req, res) {
  const { entryCode } = req.validated;

  const now = new Date();
  const registration = await Registration.findOneAndUpdate(
    { entryCode, checkedIn: false },
    { $set: { checkedIn: true, checkInTime: now, freebieClaimed: true, freebieClaimTime: now, verifiedBySignature: false } },
    { new: true },
  );

  if (registration) {
    return success(res, checkinSuccessShape(registration));
  }

  const existing = await Registration.findOne(
    { entryCode },
    { fullName: 1, checkedIn: 1, checkInTime: 1 },
  );
  if (!existing) return error(res, 'NOT_FOUND', 'Registration not found', 404);
  return error(res, 'ALREADY_CHECKED_IN', 'Already checked in', 409, {
    data: { checkInTime: existing.checkInTime, fullName: existing.fullName },
  });
}
