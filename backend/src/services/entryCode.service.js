import Counter from '../models/Counter.model.js';
import config from '../config/env.js';

export async function generateEntryCode(session) {
  const opts = session ? { session } : undefined;
  const counter = await Counter.findOneAndUpdate(
    { _id: 'entryCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, ...opts },
  );
  const padded = String(counter.seq).padStart(5, '0');
  return `JN${config.eventYear}-${padded}`;
}
