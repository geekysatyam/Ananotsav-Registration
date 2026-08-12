import mongoose from 'mongoose';

const referralUsageLogSchema = new mongoose.Schema({
  referralCode: { type: String, required: true, index: true },
  submissionId: { type: String, required: true },
  memberCount: { type: Number, required: true },
  ip: { type: String, default: null },
  flaggedForAbuse: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

const ReferralUsageLog = mongoose.model('ReferralUsageLog', referralUsageLogSchema, 'referral_usage_logs');

export default ReferralUsageLog;
