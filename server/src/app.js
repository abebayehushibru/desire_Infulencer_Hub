import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import influencerRoutes from './routes/influencerRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

const app = express();

// ── Security & Logging ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parsing ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: ENV.NODE_ENV });
});

// ── Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/communities', communityRoutes);

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────
app.use(errorHandler);

export default app;
