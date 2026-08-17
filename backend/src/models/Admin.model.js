import mongoose from 'mongoose';
import { ADMIN_PAGES, ADMIN_ROLES } from '../constants/adminPages.js';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      required: true,
      default: 'desk',
    },
    /** Effective only when role === 'admin'. super_admin gets all; desk is fixed. */
    pages: {
      type: [{ type: String, enum: ADMIN_PAGES }],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    /** Bump to invalidate all existing JWTs for this user. */
    tokenVersion: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true },
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
