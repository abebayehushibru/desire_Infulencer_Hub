import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import redisClient from './config/redis';
import { emailService } from './common/email/email.service';
import logger from './common/logger/logger';

import { Server as SocketIOServer } from 'socket.io';
import { initSocketIO } from './modules/chat/sockets/chat.socket';

const PORT = env.PORT;

const bootstrap = async (): Promise<void> => {
  try {
    // ── Validate environment ────────────────────────────────────────────────
    logger.info('Starting InfluenceHub API server...');
    logger.info(`Environment: ${env.NODE_ENV}`);

    // ── Test database connection ────────────────────────────────────────────
    await prisma.$connect();
    logger.info('Database: connected successfully');

    // ── Redis — connects lazily on first use ──────────────────────────────
    logger.info('Redis: client initialized (connects on first use)');
    logger.warn('Redis: if not running, token blacklisting will be disabled');

    // ── Verify SMTP (non-blocking) ──────────────────────────────────────────
    emailService.verifyConnection().then((ok) => {
      if (!ok) {
        logger.warn('SMTP: connection could not be verified — emails may fail');
      }
    });

    // ── Start HTTP server ───────────────────────────────────────────────────
    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API prefix: /api/${env.API_VERSION}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // ── Attach Socket.IO ───────────────────────────────────────────────────
    const io = new SocketIOServer(server, {
      cors: {
        origin: env.ALLOWED_ORIGINS,
        credentials: true,
      },
    });
    initSocketIO(io);
    logger.info('WebSocket (Socket.IO): server initialized');

    // ── Graceful shutdown ───────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — initiating graceful shutdown...`);

      server.close(async () => {
        try {
          await prisma.$disconnect();
          logger.info('Database: disconnected');

          await redisClient.quit();
          logger.info('Redis: disconnected');

          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: err });
          process.exit(1);
        }
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Graceful shutdown timeout — forcing exit');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ── Unhandled rejection safety net ────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection', { reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

bootstrap();
