// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO Chat Gateway — Module 6 (FR32–FR37)
// Real-time WebSocket connection handling, rooms, messaging, typing indicators
// ─────────────────────────────────────────────────────────────────────────────

import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../../../common/utils/jwt.util';
import { chatService } from '../services/chat.service';
import logger from '../../../common/logger/logger';
import { JwtPayload } from '../../../common/types';

interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}

export function initSocketIO(io: SocketIOServer): void {

  // ── Authentication Middleware for Socket.IO ──────────────────────────────
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return next(new Error('Authentication required for WebSocket connection'));
      }

      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch (err) {
      logger.warn('Socket.IO authentication failed', { error: err instanceof Error ? err.message : String(err) });
      next(new Error('Unauthorized WebSocket connection'));
    }
  });

  // ── Connection Event ─────────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.data.user;

    logger.info(`WebSocket connected: ${user.sub} (${user.role}) [socket.id=${socket.id}]`);

    // Automatically join user's private room for direct messages & notifications
    socket.join(`user:${user.sub}`);

    // ── joinCommunity ──────────────────────────────────────────────────────
    socket.on('joinCommunity', async (data: { communityId: string }, callback?: Function) => {
      try {
        if (!data?.communityId) {
          if (callback) callback({ success: false, error: 'communityId is required' });
          return;
        }

        const roomName = `community:${data.communityId}`;
        socket.join(roomName);
        logger.info(`User ${user.sub} joined room ${roomName}`);

        if (callback) callback({ success: true, room: roomName });
      } catch (err: any) {
        logger.error('Error joining community socket room', { error: err.message });
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // ── leaveCommunity ─────────────────────────────────────────────────────
    socket.on('leaveCommunity', (data: { communityId: string }, callback?: Function) => {
      try {
        if (data?.communityId) {
          const roomName = `community:${data.communityId}`;
          socket.leave(roomName);
          logger.info(`User ${user.sub} left room ${roomName}`);
        }
        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // ── sendMessage ────────────────────────────────────────────────────────
    socket.on('sendMessage', async (data: {
      communityId?: string;
      recipientId?: string;
      content: string;
      messageType?: any;
    }, callback?: Function) => {
      try {
        const dummyCtx = { ip: socket.handshake.address || '127.0.0.1', userAgent: socket.handshake.headers['user-agent'] || 'socket.io' };

        if (data.communityId) {
          // Community message
          const message = await chatService.sendCommunityMessage(
            data.communityId,
            { content: data.content, messageType: data.messageType },
            user.sub,
            user.role,
            dummyCtx,
          );

          // Broadcast to community room
          io.to(`community:${data.communityId}`).emit('receiveMessage', message);

          if (callback) callback({ success: true, message });
        } else if (data.recipientId) {
          // Direct message
          const message = await chatService.startOrSendDirectMessage(
            { recipientId: data.recipientId, content: data.content },
            user.sub,
            user.role,
            dummyCtx,
          );

          // Emit to sender socket and recipient user room
          io.to(`user:${user.sub}`).to(`user:${data.recipientId}`).emit('receiveMessage', message);

          if (callback) callback({ success: true, message });
        } else {
          if (callback) callback({ success: false, error: 'Must provide communityId or recipientId' });
        }
      } catch (err: any) {
        logger.error('Error sending socket message', { error: err.message });
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // ── typing ─────────────────────────────────────────────────────────────
    socket.on('typing', (data: { communityId?: string; recipientId?: string; conversationId?: string }) => {
      const payload = { userId: user.sub, email: user.email };
      if (data.communityId) {
        socket.to(`community:${data.communityId}`).emit('typing', payload);
      } else if (data.recipientId) {
        socket.to(`user:${data.recipientId}`).emit('typing', payload);
      }
    });

    // ── stopTyping ─────────────────────────────────────────────────────────
    socket.on('stopTyping', (data: { communityId?: string; recipientId?: string; conversationId?: string }) => {
      const payload = { userId: user.sub, email: user.email };
      if (data.communityId) {
        socket.to(`community:${data.communityId}`).emit('stopTyping', payload);
      } else if (data.recipientId) {
        socket.to(`user:${data.recipientId}`).emit('stopTyping', payload);
      }
    });

    // ── messageRead ────────────────────────────────────────────────────────
    socket.on('messageRead', async (data: { messageId: string; communityId?: string; recipientId?: string }, callback?: Function) => {
      try {
        if (!data?.messageId) return;

        const result = await chatService.markMessageRead(data.messageId, user.sub);

        if (data.communityId) {
          io.to(`community:${data.communityId}`).emit('messageRead', result);
        } else if (data.recipientId) {
          io.to(`user:${data.recipientId}`).to(`user:${user.sub}`).emit('messageRead', result);
        }

        if (callback) callback({ success: true, result });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket disconnected: ${user.sub} [reason=${reason}]`);
    });
  });
}
