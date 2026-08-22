import WhatsAppMessage from '../../models/WhatsAppMessage.model.js';
import Registration from '../../models/Registration.model.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import { maskPhone } from './whatsapp.phone.js';

/**
 * Enqueue primary-registrant QR confirmation. Idempotent via uniqueKey.
 */
export async function enqueueRegistrationConfirmation({
  registrationId,
  phone,
  entryCode,
  fullName,
  totalPeople = 1,
}) {
  if (!config.whatsapp.enabled) return null;
  if (!config.whatsapp.sendRegistrationConfirmation || !config.whatsapp.sendRegistrationQr) {
    return null;
  }
  if (!registrationId || !phone || !entryCode || !fullName) return null;

  // Desk / admin register — never auto-send WhatsApp QR (entry already at venue)
  const reg = await Registration.findById(registrationId).select('registrationSource').lean();
  if (reg?.registrationSource === 'desk-manual') {
    logger.info(
      { registrationId, phone: maskPhone(phone) },
      'Skipping WhatsApp queue for desk-manual registration',
    );
    return null;
  }

  const uniqueKey = `${registrationId}:registration-qr`;
  const now = new Date();

  try {
    const doc = await WhatsAppMessage.findOneAndUpdate(
      { uniqueKey },
      {
        $setOnInsert: {
          registrationId,
          phone,
          messageType: 'registration-qr',
          status: 'pending',
          attempts: 0,
          lastError: null,
          messageId: null,
          entryCode,
          fullName,
          totalPeople,
          uniqueKey,
          nextAttemptAt: now,
          queuedAt: now,
          sentAt: null,
          failedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Snapshot on Registration for admin list (ignore errors)
    await Registration.updateOne(
      { _id: registrationId, 'whatsapp.status': { $ne: 'sent' } },
      {
        $set: {
          'whatsapp.status': 'pending',
          'whatsapp.sentAt': null,
          'whatsapp.lastError': null,
        },
      },
    ).catch(() => undefined);

    logger.info(
      { uniqueKey, phone: maskPhone(phone) },
      'Message queued',
    );
    return doc;
  } catch (err) {
    if (err?.code === 11000) {
      return WhatsAppMessage.findOne({ uniqueKey });
    }
    logger.error(
      { err: err?.message, phone: maskPhone(phone) },
      'Failed to enqueue WhatsApp confirmation',
    );
    return null;
  }
}

export function backoffMs(attempt) {
  const base = 15_000;
  return base * 4 ** Math.max(0, attempt - 1);
}
