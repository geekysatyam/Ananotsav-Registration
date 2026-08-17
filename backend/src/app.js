import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

// Only trust X-Forwarded-* when behind a reverse proxy (production).
// Locally, trusting proxy lets clients spoof IPs and bypass rate limits.
if (config.nodeEnv === 'production' || config.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // In development, allow any localhost port (Vite may use 5173, 8082, etc.)
      if (config.nodeEnv === 'development' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '64kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;
