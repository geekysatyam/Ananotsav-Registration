import QRCode from 'qrcode';
import { buildSignedPayload } from '../hmac.service.js';

/**
 * PNG buffer for WhatsApp from the SAME signed payload used on the website.
 * Does not persist files — generate → send → discard.
 */
export async function generateEntryQrPng(entryCode) {
  const signedPayload = buildSignedPayload(entryCode);
  const buffer = await QRCode.toBuffer(signedPayload, {
    type: 'png',
    width: 800,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
  return { buffer, signedPayload };
}
