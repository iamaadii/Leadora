import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

/**
 * Creates an in-memory rate limiting middleware for sensitive endpoints.
 * @param {object} [options]
 * @param {number} [options.windowMs] - Time window in milliseconds
 * @param {number} [options.max] - Maximum requests allowed per window
 * @param {string} [options.message]
 */
export function rateLimiter({
  windowMs = env?.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max = env?.RATE_LIMIT_AUTH_MAX || 10,
  message = 'Too many requests from this IP, please try again later.',
} = {}) {
  const requests = new Map();

  // Periodically clean up expired IP records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests.entries()) {
      if (now - entry.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = req.ip || (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now - record.startTime > windowMs) {
      requests.set(ip, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Retry-After', retryAfterSeconds);
      }
      return next(
        new AppError(message, 429, 'RATE_LIMIT_EXCEEDED', {
          retryAfterSeconds,
        }),
      );
    }

    next();
  };
}

