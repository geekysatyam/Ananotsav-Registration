/**
 * One-time seed for the first super_admin.
 * Does nothing if any super_admin already exists.
 *
 * Usage:
 *   npm run seed:super-admin -- <username> <password>
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../src/models/Admin.model.js';

dotenv.config();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('Usage: npm run seed:super-admin -- <username> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existingSuper = await Admin.findOne({ role: 'super_admin' });
  if (existingSuper) {
    console.log(`Super admin already exists (username: ${existingSuper.username}). No changes made.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const normalized = username.trim().toLowerCase();
  const taken = await Admin.findOne({ username: normalized });
  if (taken) {
    console.error(`Username "${normalized}" is already taken`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await Admin.create({
    username: normalized,
    passwordHash,
    role: 'super_admin',
    pages: [],
    isActive: true,
  });

  console.log(`Created super_admin: ${doc.username} (id: ${doc._id})`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
