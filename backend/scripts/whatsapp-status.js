/**
 * Report WhatsApp enabled / session / connection status.
 * Usage: npm run whatsapp:status
 */
import { connectDB } from '../src/config/db.js';
import config from '../src/config/env.js';
import { getStatus, hasPersistedSession } from '../src/services/whatsapp/index.js';

async function main() {
  try {
    await connectDB();
  } catch {
    console.log('(MongoDB not connected — showing local config only)');
  }

  const status = await getStatus();
  console.log(
    JSON.stringify(
      {
        enabled: config.whatsapp.enabled,
        sessionDir: config.whatsapp.sessionDir,
        hasPersistedSession: hasPersistedSession(),
        ...status,
        note: status.enabled
          ? 'Start the API server to open a live Baileys connection; this script reports DB queue + session files.'
          : 'Set WHATSAPP_ENABLED=true to enable.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
