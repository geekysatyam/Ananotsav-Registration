/** Strip to digits only */
export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/**
 * Normalize Indian mobile to 10 digits.
 * Accepts +91 / 91 / 0 prefixes.
 */
export function normalizeIndianPhone(value) {
  let d = digitsOnly(value);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Valid Indian mobile: 10 digits starting with 6–9 */
export function isValidIndianPhone(value) {
  const d = normalizeIndianPhone(value);
  return /^[6-9]\d{9}$/.test(d);
}

export function phoneValidationMessage(value) {
  if (!value?.trim()) return "Phone number is required";
  const d = normalizeIndianPhone(value);
  if (d.length < 10) return "Enter a 10-digit mobile number";
  if (d.length > 10) return "Phone number looks too long";
  if (!/^[6-9]/.test(d)) return "Indian mobile numbers start with 6, 7, 8 or 9";
  if (!isValidIndianPhone(value)) return "Enter a valid 10-digit mobile number";
  return null;
}

/** Optional phone: empty OK, otherwise must be valid */
export function optionalPhoneValidationMessage(value) {
  if (!value?.trim()) return null;
  return phoneValidationMessage(value);
}

const DOB_MIN_YEAR = 1920;

/** Parse YYYY-MM-DD as local date parts */
export function parseIsoDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function toIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * @param {string} iso YYYY-MM-DD
 * @param {{ required?: boolean, label?: string, maxAgeYears?: number, minAgeYears?: number }} opts
 */
export function dobValidationMessage(iso, opts = {}) {
  const { required = true, label = "Date of birth", maxAgeYears = 120, minAgeYears = 0 } = opts;
  if (!iso?.trim()) return required ? `${label} is required` : null;

  const date = parseIsoDate(iso);
  if (!date) return `Enter a valid ${label.toLowerCase()}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return `${label} cannot be in the future`;

  if (date.getFullYear() < DOB_MIN_YEAR) return `${label} year looks too early`;

  const ageMs = today - date;
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears > maxAgeYears) return `Please check ${label.toLowerCase()}`;
  if (ageYears < minAgeYears) return `${label} does not meet the minimum age`;

  return null;
}

export { DOB_MIN_YEAR };
