import mongoose from 'mongoose';

const STATUS = [
  'not_configured',
  'pairing',
  'connecting',
  'connected',
  'disconnected',
  'logged_out',
  'error',
];

const whatsAppConfigSchema = new mongoose.Schema(
  {
    /** Singleton key — only one config document */
    key: { type: String, required: true, unique: true, default: 'default' },
    enabled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: STATUS,
      default: 'not_configured',
    },
    phoneNumber: { type: String, default: null },
    displayName: { type: String, default: null },
    connectedAt: { type: Date, default: null },
    lastConnectedAt: { type: Date, default: null },
    lastDisconnectedAt: { type: Date, default: null },
    lastHeartbeatAt: { type: Date, default: null },
    lastMessageSentAt: { type: Date, default: null },
    lastMessageFailedAt: { type: Date, default: null },
    disconnectReason: { type: String, default: null },
    /** Prevent repeated logout alerts */
    lastLogoutNotifiedAt: { type: Date, default: null },
    /** Admin UI banner until acknowledged */
    adminAlert: {
      type: { type: String, default: null },
      message: { type: String, default: null },
      at: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

const WhatsAppConfig = mongoose.model('WhatsAppConfig', whatsAppConfigSchema);

export { STATUS as WHATSAPP_CONFIG_STATUSES };
export default WhatsAppConfig;
