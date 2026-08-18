import mongoose from 'mongoose';

const fancyDressEntrySchema = new mongoose.Schema(
  {
    childName: { type: String, required: true, trim: true },
    childDob: { type: Date, required: true },
    getupDetail: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dob: { type: Date, required: true },
  city: { type: String, trim: true },
  familyGroupId: { type: String, default: null, index: true },
  isPrimaryRegistrant: { type: Boolean, required: true, default: true },
  entryCode: { type: String, required: true, unique: true, index: true },
  // REFERRAL DISABLED — do not store / issue referral codes
  // wantsReferral: { type: Boolean, default: false },
  // referralCode: { type: String, unique: true, sparse: true },
  // referredBy: { type: String, default: null },
  // referralCount: { type: Number, default: 0 },
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

  /** Optional seva / celebration opt-ins (primary registrant only) */
  wantsVolunteer: { type: Boolean, default: false },
  wantsPanchamritAbhishek: { type: Boolean, default: false },
  wantsFancyDress: { type: Boolean, default: false },
  fancyDressEntries: { type: [fancyDressEntrySchema], default: [] },
  fancyDressParentPhone: { type: String, trim: true, default: null },
  fancyDressGetup: { type: String, trim: true, default: '' },
  wantsLadduGopal: { type: Boolean, default: false },
  ladduGopalSize: { type: String, trim: true, default: null },

  createdAt: { type: Date, default: Date.now },
});

registrationSchema.index({ phone: 1, dob: 1 }, { unique: true, sparse: true });
registrationSchema.index({ wantsVolunteer: 1, createdAt: -1 });
registrationSchema.index({ wantsPanchamritAbhishek: 1, createdAt: -1 });
registrationSchema.index({ wantsFancyDress: 1, createdAt: -1 });
registrationSchema.index({ wantsLadduGopal: 1, createdAt: -1 });
// REFERRAL DISABLED
// registrationSchema.index({ wantsReferral: 1, referralCount: -1 });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
