// ─────────────────────────────────────────────────────────────────────────────
// Express App — Middleware stack + route mounting
// ─────────────────────────────────────────────────────────────────────────────

import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { env } from './config/env';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';
import logger from './common/logger/logger';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './modules/auth/routes/auth.routes';

// ── Swagger ───────────────────────────────────────────────────────────────────
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';

const app: Application = express();

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: env.IS_PRODUCTION
    ? undefined
    : false, // Disable CSP in dev for easier debugging
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Cookie Parser ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Trust proxy (for accurate IP behind reverse proxy) ───────────────────────
app.set('trust proxy', 1);

// ── General Rate Limiter ──────────────────────────────────────────────────────
app.use(generalRateLimiter);

// ── Request logging ───────────────────────────────────────────────────────────
if (!env.IS_TEST) {
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100),
    });
    next();
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'InfluenceHub API is healthy',
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Swagger Docs ──────────────────────────────────────────────────────────────
if (!env.IS_PRODUCTION) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'InfluenceHub API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
}

// ── API Routes ─────────────────────────────────────────────────────────────────
const API_PREFIX = `/api/${env.API_VERSION}`;

app.use(`${API_PREFIX}/auth`, authRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
