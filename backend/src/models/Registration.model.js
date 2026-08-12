import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: function () {
      return this.isPrimaryRegistrant;
    },
    trim: true,
  },
  dob: { type: Date, required: true },
  city: { type: String, trim: true },
  familyGroupId: { type: String, default: null, index: true },
  isPrimaryRegistrant: { type: Boolean, required: true, default: true },
  entryCode: { type: String, required: true, unique: true, index: true },
  wantsReferral: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  referralCount: { type: Number, default: 0 },
  checkedIn: { type: Boolean, default: false },
  checkInTime: { type: Date, default: null },
  verifiedBySignature: { type: Boolean, default: null },
  freebieClaimed: { type: Boolean, default: false },
  freebieClaimTime: { type: Date, default: null },
  registrationSource: {
    type: String,
    enum: ['web', 'referral-link', 'desk-manual'],
    default: 'web',
  },
  createdAt: { type: Date, default: Date.now },
});

registrationSchema.index({ phone: 1, dob: 1 }, { unique: true, sparse: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
