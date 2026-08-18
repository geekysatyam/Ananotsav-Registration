import Counter from '../models/Counter.model.js';
import config from '../config/env.js';

function formatEntryCode(seq) {
  const padded = String(seq).padStart(5, '0');
  return `JN${config.eventYear}-${padded}`;
}

/**
 * Atomically reserve `count` sequential entry numbers.
 * One $inc per registration (not per family member) to cut write conflicts.
 */
export async function generateEntryCodes(count, session) {
  const n = Math.max(1, count);
  const opts = session ? { session } : undefined;
  const counter = await Counter.findOneAndUpdate(
    { _id: 'entryCode' },
    { $inc: { seq: n } },
    { new: true, upsert: true, ...opts },
  );
  const end = counter.seq;
  const start = end - n + 1;
  return Array.from({ length: n }, (_, i) => formatEntryCode(start + i));
}

export async function generateEntryCode(session) {
  const [code] = await generateEntryCodes(1, session);
  return code;
}
