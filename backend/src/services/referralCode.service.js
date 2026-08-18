// REFERRAL DISABLED — not imported while referral is off
import Registration from '../models/Registration.model.js';
import { KRISHNA_NAMES } from '../utils/krishnaNames.js';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCandidate(useFourDigits) {
  const name = pickRandom(KRISHNA_NAMES);
  const number = useFourDigits ? randomInt(1000, 9999) : randomInt(100, 999);
  return `${name}${number}`;
}

export async function generateReferralCode(session) {
  const opts = session ? { session } : undefined;

  for (let i = 0; i < 5; i++) {
    const candidate = generateCandidate(false);
    if (!(await Registration.exists({ referralCode: candidate }, opts))) return candidate;
  }

  for (let i = 0; i < 3; i++) {
    const candidate = generateCandidate(true);
    if (!(await Registration.exists({ referralCode: candidate }, opts))) return candidate;
  }

  const err = new Error('Failed to generate unique referral code');
  err.code = 'REFERRAL_CODE_GENERATION_FAILED';
  err.statusCode = 500;
  throw err;
}
