/**
 * Create the first super_admin, or reset an existing super_admin password.
 *
 * Usage:
 *   npm run seed:super-admin -- <username> <password>
 *   npm run seed:super-admin -- <username> <password> --reset-password
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../src/models/Admin.model.js';

dotenv.config();

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const resetPassword = args.includes('--reset-password');
  const positional = args.filter((a) => a !== '--reset-password');
  const username = positional[0];
  const password = positional[1];

  if (!username || !password) {
    console.error('Usage: npm run seed:super-admin -- <username> <password> [--reset-password]');
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
  const normalized = username.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const existingSuper = await Admin.findOne({ role: 'super_admin' });

  if (existingSuper) {
    if (!resetPassword) {
      console.log(
        `Super admin already exists (username: ${existingSuper.username}). No changes made.`,
      );
      console.log(
        'To set a new password: npm run seed:super-admin -- <username> <password> --reset-password',
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    existingSuper.username = normalized;
    existingSuper.passwordHash = passwordHash;
    existingSuper.isActive = true;
    existingSuper.tokenVersion = (existingSuper.tokenVersion ?? 0) + 1;
    await existingSuper.save();

    console.log(`Updated super_admin password for: ${existingSuper.username}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const taken = await Admin.findOne({ username: normalized });
  if (taken) {
    console.error(`Username "${normalized}" is already taken by a non-super-admin account`);
    await mongoose.disconnect();
    process.exit(1);
  }

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
