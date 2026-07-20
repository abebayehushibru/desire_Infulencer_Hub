// ─────────────────────────────────────────────────────────────────────────────
// JWT Utility — Access & Refresh token management
// Access token: 15 min — stateless, signed with access secret
// Refresh token: 30 days — stored in DB, signed with refresh secret
// Each token has a unique jti (JWT ID) for blacklisting support
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import jwt, { SignOptions, JwtPayload as JWTLibPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { JwtPayload, TokenPair } from '../types';
import { ApiError } from '../errors/ApiError';

// Helper: env string → typed expiresIn (works around StringValue branded type)
const asExpiry = (val: string): SignOptions['expiresIn'] =>
  val as unknown as SignOptions['expiresIn'];

// ── Sign access token ─────────────────────────────────────────────────────────
export const signAccessToken = (payload: Omit<JwtPayload, 'jti' | 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: asExpiry(env.JWT_ACCESS_EXPIRES_IN),
    jwtid: uuidv4(),
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
    expiresIn: asExpiry(env.JWT_REFRESH_EXPIRES_IN),
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
  const accessToken  = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, email, role }, family);

  const accessDecoded  = decodeToken(accessToken);
  const refreshDecoded = decodeToken(refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt:  new Date((accessDecoded.exp  ?? 0) * 1000),
    refreshTokenExpiresAt: new Date((refreshDecoded.exp ?? 0) * 1000),
  };
};

// ── Verify access token ───────────────────────────────────────────────────────
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTLibPayload & JwtPayload;
    return {
      sub:   decoded.sub as string,
      email: decoded.email,
      role:  decoded.role,
      jti:   decoded.jti as string,
      iat:   decoded.iat,
      exp:   decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)   throw ApiError.unauthorized('Access token has expired');
    if (error instanceof jwt.JsonWebTokenError)   throw ApiError.unauthorized('Invalid access token');
    throw ApiError.unauthorized('Token verification failed');
  }
};

// ── Verify refresh token ──────────────────────────────────────────────────────
export const verifyRefreshToken = (token: string): JwtPayload & { family?: string } => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTLibPayload & JwtPayload & { family?: string };
    return {
      sub:    decoded.sub as string,
      email:  decoded.email,
      role:   decoded.role,
      jti:    decoded.jti as string,
      family: decoded.family,
      iat:    decoded.iat,
      exp:    decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)  throw ApiError.unauthorized('Refresh token has expired');
    if (error instanceof jwt.JsonWebTokenError)  throw ApiError.unauthorized('Invalid refresh token');
    throw ApiError.unauthorized('Token verification failed');
  }
};

// ── Decode without verification (extract jti for logout blacklisting) ─────────
export const decodeToken = (token: string): JWTLibPayload => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    throw ApiError.unauthorized('Invalid token');
  }
  return decoded;
};

// ── Extract Bearer token from Authorization header ────────────────────────────
export const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token?.length > 0 ? token : null;
};

// ── Hash refresh token for DB storage (SHA-256, not bcrypt — deterministic) ───
export const hashRefreshToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
