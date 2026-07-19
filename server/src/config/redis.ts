// ─────────────────────────────────────────────────────────────────────────────
// Redis Client — ioredis with connection management
// Used for: token blacklist, session management, rate limiting, OTP caching
// ─────────────────────────────────────────────────────────────────────────────

import Redis from 'ioredis';
import { env } from './env';
import logger from '../common/logger/logger';

// Prevent log spam when Redis is simply not running
let redisErrorLogged = false;

const createRedisClient = (): Redis => {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    retryStrategy: (times: number) => {
      if (times > 3) {
        // Stop retrying — Redis not available, run in degraded mode
        return null;
      }
      return Math.min(times * 200, 600);
    },
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    connectTimeout: 3000,
    commandTimeout: 2000,
  });

  client.on('connect', () => {
    logger.info('Redis: connected');
  });

  client.on('ready', () => {
    logger.info('Redis: ready');
  });

  client.on('error', (err: Error) => {
    // Only log once — avoid spamming logs when Redis is simply not running
    if (!redisErrorLogged) {
      logger.warn('Redis: unavailable — running in degraded mode (no token blacklisting)', {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      });
      redisErrorLogged = true;
    }
  });

  client.on('close', () => { /* silent */ });
  client.on('reconnecting', () => { /* silent */ });

  return client;
};

// ── Singleton ─────────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

const redisClient: Redis = global.__redis ?? createRedisClient();

if (!env.IS_PRODUCTION) {
  global.__redis = redisClient;
}

export default redisClient;
