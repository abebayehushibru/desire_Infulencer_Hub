// ─────────────────────────────────────────────────────────────────────────────
// Prisma Client — Singleton with logging
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { env } from './env';
import logger from '../common/logger/logger';

// Prevent multiple instances in development (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log:
      env.IS_DEVELOPMENT
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [
            { emit: 'event', level: 'error' },
          ],
  });

  // Log slow queries in development
  if (env.IS_DEVELOPMENT) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client.$on as any)('query', (e: { query: string; duration: number }) => {
      if (e.duration > 1000) {
        logger.warn('Slow query detected', {
          query: e.query,
          duration: `${e.duration}ms`,
        });
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client.$on as any)('error', (e: { message: string }) => {
    logger.error('Prisma error', { message: e.message });
  });

  return client;
};

const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (!env.IS_PRODUCTION) {
  global.__prisma = prisma;
}

export default prisma;
