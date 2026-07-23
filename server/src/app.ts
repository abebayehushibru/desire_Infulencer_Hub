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
import authRoutes      from './modules/auth/routes/auth.routes';
import adminRoutes     from './modules/auth/routes/admin.routes';
import userRoutes      from './modules/users/routes/user-management.routes';
import communityRoutes from './modules/community/routes/community.routes';
import campaignRoutes  from './modules/campaign/routes/campaign.routes';

// ── Swagger ───────────────────────────────────────────────────────────────────
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';

const app: Application = express();

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: env.IS_PRODUCTION ? undefined : false,
  crossOriginEmbedderPolicy: false,
  hsts: env.IS_PRODUCTION ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Return null (blocked) — do NOT throw; throwing causes a 500 on OPTIONS preflight
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,   // some legacy browsers (IE11) choke on 204 → use 200 if needed
};

// Handle OPTIONS preflight first — before any other middleware or rate limiters
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Cookie Parser ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body Parsing ─────────────────────────────────────────────────────────────
// 50kb for auth endpoints, but user management allows slightly larger for profiles
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

app.use(`${API_PREFIX}/auth`,        authRoutes);
app.use(`${API_PREFIX}/admin`,       adminRoutes);
app.use(`${API_PREFIX}/users`,       userRoutes);
app.use(`${API_PREFIX}/communities`, communityRoutes);
app.use(`${API_PREFIX}/campaigns`,   campaignRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
