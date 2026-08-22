/**
 * Normalize Indian mobile to WhatsApp digits (country code 91 + 10 digits).
 * Accepts 10-digit, 0-prefixed, or already-international forms.
 */
export function normalizeWhatsAppDigits(phone) {
  let d = String(phone ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return d;
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && /^[6-9]\d{9}$/.test(d)) return `91${d}`;
  if (d.length === 13 && d.startsWith('091')) return `91${d.slice(3)}`;
  return null;
}

export function toWhatsAppJid(phone) {
  const digits = normalizeWhatsAppDigits(phone);
  if (!digits) return null;
  return `${digits}@s.whatsapp.net`;
}

/** Mask for logs — never log full numbers */
export function maskPhone(phone) {
  const d = String(phone ?? '').replace(/\D/g, '');
  if (d.length < 4) return '****';
  return `******${d.slice(-4)}`;
}
