import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generates a short-lived signed JWT access token
 * @param {object} user - User payload
 * @returns {string} Signed JWT
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      organizationId: user.organization_id || null,
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    },
  );
}

/**
 * Verifies and decodes an access token JWT
 * @param {string} token
 * @returns {object} Decoded token payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Generates an opaque, cryptographically secure random refresh token
 * @returns {string} Hex-encoded random string (80 characters)
 */
export function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Computes the SHA-256 hash of a raw refresh token for safe database persistence
 * @param {string} rawToken
 * @returns {string} SHA-256 hex digest
 */
export function hashRefreshToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Calculates a future expiration timestamp based on an expiry string like '7d' or '24h'
 * @param {string} expiresIn - Expiration string
 * @returns {Date} Expiration date
 */
export function calculateExpiryDate(expiresIn = env.REFRESH_TOKEN_EXPIRES_IN) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  const now = Date.now();

  if (!match) {
    // Default to 7 days
    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }

  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);

  const unitMultipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const ms = value * (unitMultipliers[unit] || unitMultipliers.d);
  return new Date(now + ms);
}

