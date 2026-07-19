// ─────────────────────────────────────────────────────────────────────────────
// JWT Utility — Access & Refresh token management
// Access token: 15 min — stateless, signed with access secret
// Refresh token: 30 days — stored in DB, signed with refresh secret
// Each token has a unique jti (JWT ID) for blacklisting support
// ─────────────────────────────────────────────────────────────────────────────

import jwt, { SignOptions, JwtPayload as JWTLibPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { JwtPayload, TokenPair } from '../types';
import { ApiError } from '../errors/ApiError';

// ── Sign access token ─────────────────────────────────────────────────────────
export const signAccessToken = (payload: Omit<JwtPayload, 'jti' | 'iat' | 'exp'>): string => {
  const jti = uuidv4();
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
    jwtid: jti,
    algorithm: 'HS256',
  };

  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    env.JWT_ACCESS_SECRET,
    options
  );
};

// ── Sign refresh token ────────────────────────────────────────────────────────
export const signRefreshToken = (
  payload: Omit<JwtPayload, 'jti' | 'iat' | 'exp'>,
  family?: string
): string => {
  const jti = uuidv4();
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    jwtid: jti,
    algorithm: 'HS256',
  };

  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role, family: family || jti },
    env.JWT_REFRESH_SECRET,
    options
  );
};

// ── Generate token pair ───────────────────────────────────────────────────────
export const generateTokenPair = (
  userId: string,
  email: string,
  role: Role,
  family?: string
): TokenPair => {
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, email, role }, family);

  const accessDecoded = decodeToken(accessToken);
  const refreshDecoded = decodeToken(refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date((accessDecoded.exp ?? 0) * 1000),
    refreshTokenExpiresAt: new Date((refreshDecoded.exp ?? 0) * 1000),
  };
};

// ── Verify access token ───────────────────────────────────────────────────────
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTLibPayload & JwtPayload;
    return {
      sub: decoded.sub as string,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti as string,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid access token');
    }
    throw ApiError.unauthorized('Token verification failed');
  }
};

// ── Verify refresh token ──────────────────────────────────────────────────────
export const verifyRefreshToken = (token: string): JwtPayload & { family?: string } => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTLibPayload & JwtPayload & { family?: string };
    return {
      sub: decoded.sub as string,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti as string,
      family: decoded.family,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    throw ApiError.unauthorized('Token verification failed');
  }
};

// ── Decode token without verification (for extracting jti on logout) ──────────
export const decodeToken = (token: string): JWTLibPayload => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    throw ApiError.unauthorized('Invalid token');
  }
  return decoded;
};

// ── Extract token from Bearer header ─────────────────────────────────────────
export const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return token && token.length > 0 ? token : null;
};

// ── Hash refresh token for storage (SHA-256) ──────────────────────────────────
import crypto from 'crypto';

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
