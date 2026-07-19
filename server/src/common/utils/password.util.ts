// ─────────────────────────────────────────────────────────────────────────────
// Password Utility — bcrypt hashing & comparison
// NEVER store plain passwords. ALWAYS use these helpers.
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcrypt';
import { env } from '../../config/env';

// ── Hash password ─────────────────────────────────────────────────────────────
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);
};

// ── Compare password with hash ────────────────────────────────────────────────
// Uses bcrypt.compare which is constant-time to prevent timing attacks
export const comparePassword = async (
  plainPassword: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hash);
};

// ── Validate password strength ────────────────────────────────────────────────
export const isStrongPassword = (password: string): boolean => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/;
  return pattern.test(password);
};
