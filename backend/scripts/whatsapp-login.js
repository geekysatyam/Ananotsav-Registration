/**
 * Pair WhatsApp Web once and persist session to WHATSAPP_SESSION_DIR.
 * Usage: npm run whatsapp:login
 */
import qrcodeTerminal from 'qrcode-terminal';
import { connectDB } from '../src/config/db.js';
import config from '../src/config/env.js';
import logger from '../src/utils/logger.js';
import {
  startWhatsAppClient,
  stopWhatsAppClient,
  getClientStatus,
} from '../src/services/whatsapp/index.js';

async function main() {
  if (!config.whatsapp.enabled) {
    console.log('Set WHATSAPP_ENABLED=true in backend/.env before pairing.');
    process.exit(1);
  }

  console.log('Connecting Baileys…');
  console.log(`Session dir: ${config.whatsapp.sessionDir}`);
  console.log('Scan the QR with WhatsApp → Linked devices.\n');

  await connectDB().catch(() => {
    // DB optional for pairing — session is file-based
  });

  await startWhatsAppClient({
    printQr: false,
    onQr: (qr) => {
      console.log('\n--- Scan this QR with WhatsApp ---\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('\nWaiting for scan…\n');
    },
  });

  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    const status = getClientStatus();
    if (status.connected && status.authenticated) {
      console.log('\nWhatsApp authenticated. Session saved.');
      console.log('You can start the API with npm run dev / npm start.\n');
      await stopWhatsAppClient();
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.error('Timed out waiting for WhatsApp pairing.');
  await stopWhatsAppClient();
  process.exit(1);
}

main().catch((err) => {
  logger.error(err?.message ?? err);
  process.exit(1);
});
