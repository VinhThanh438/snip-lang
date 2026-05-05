import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './core/config';
import { connectDatabase } from './core/database/connection';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoute from './modules/auth/auth.route';
import sentencesRoute from './modules/sentences/sentences.route';
import vocabularyRoute from './modules/vocabulary/vocabulary.route';
import translateRoute from './modules/translate/translate.route';

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Quá nhiều request, vui lòng thử lại sau' },
});

const allowedOrigins = [
  config.cors.frontendUrl,
  `chrome-extension://${config.cors.extensionId}`,
  'http://localhost:3000',
  'https://snip-lang.vercel.app',
  'https://snip-lang.com'
];

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // Log the rejected origin for debugging
    console.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Only use morgan in non-serverless environments to avoid noise
if (!config.isVercel) {
  app.use(morgan(config.isDev ? 'dev' : 'combined'));
}

// Ensure DB connection on every request (serverless-safe)
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoute);
app.use('/api/sentences', sentencesRoute);
app.use('/api/vocabulary', vocabularyRoute);
app.use('/api/translate', translateRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
