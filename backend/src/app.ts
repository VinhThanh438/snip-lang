import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './core/config';
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

app.use(helmet());
app.use(cors({
  origin: [config.cors.frontendUrl, `chrome-extension://${config.cors.extensionId}`],
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan(config.isDev ? 'dev' : 'combined'));

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
