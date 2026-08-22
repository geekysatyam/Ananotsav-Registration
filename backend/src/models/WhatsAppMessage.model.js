import mongoose from 'mongoose';

const whatsAppMessageSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    messageType: {
      type: String,
      enum: ['registration-qr'],
      required: true,
      default: 'registration-qr',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
      required: true,
      default: 'pending',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    messageId: { type: String, default: null },
    entryCode: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    totalPeople: { type: Number, required: true, min: 1, default: 1 },
    /** Idempotency: registrationId:registration-qr */
    uniqueKey: { type: String, required: true, unique: true },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    queuedAt: { type: Date, default: Date.now, index: true },
    processingAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

whatsAppMessageSchema.index({ createdAt: -1 });
whatsAppMessageSchema.index({ status: 1, createdAt: -1 });
/** FIFO claim: pending jobs by age, then retry schedule */
whatsAppMessageSchema.index({ status: 1, queuedAt: 1, nextAttemptAt: 1 });

const WhatsAppMessage = mongoose.model('WhatsAppMessage', whatsAppMessageSchema);

export default WhatsAppMessage;
