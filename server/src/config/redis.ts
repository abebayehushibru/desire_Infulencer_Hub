// ─────────────────────────────────────────────────────────────────────────────
// Redis Client — ioredis with connection management
// Used for: token blacklist, session management, rate limiting, OTP caching
// ─────────────────────────────────────────────────────────────────────────────

import Redis from 'ioredis';
import { env } from './env';
import logger from '../common/logger/logger';

const createRedisClient = (): Redis => {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error('Redis: max retry attempts reached, giving up');
        return null;
      }
      const delay = Math.min(times * 100, 3000);
      logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    enableOfflineQueue: true,
    lazyConnect: false,
  });

  client.on('connect', () => {
    logger.info('Redis: connected successfully');
  });

  client.on('ready', () => {
    logger.info('Redis: client ready');
  });

  client.on('error', (err: Error) => {
    logger.error('Redis: connection error', { error: err.message });
  });

  client.on('close', () => {
    logger.warn('Redis: connection closed');
  });

  client.on('reconnecting', () => {
    logger.info('Redis: reconnecting...');
  });

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
