export function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function nameDobKey(fullName, dobString) {
  return `${normalizeName(fullName)}|${dobString}`;
}

function nameToRegex(fullName) {
  const parts = normalizeName(fullName).split(' ').filter(Boolean);
  if (parts.length === 0) return null;
  const pattern = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
  return new RegExp(`^${pattern}$`, 'i');
}

export async function findByNameDob(Registration, fullName, dob, opts) {
  const regex = nameToRegex(fullName);
  if (!regex) return null;
  return Registration.findOne({ fullName: regex, dob }, null, opts);
}
