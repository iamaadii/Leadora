import { AppError } from '../errors/app-error.js';

/**
 * Creates an in-memory rate limiting middleware for sensitive endpoints like login.
 * @param {object} options
 * @param {number} [options.windowMs=900000] - Time window in milliseconds (default 15 minutes)
 * @param {number} [options.max=10] - Maximum requests allowed per window
 * @param {string} [options.message='Too many attempts, please try again later']
 */
export function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = 'Too many requests from this IP, please try again after 15 minutes.',
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

  return (req, _res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
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
      return next(
        new AppError(message, 429, 'RATE_LIMIT_EXCEEDED', {
          retryAfterSeconds: Math.ceil((record.startTime + windowMs - now) / 1000),
        }),
      );
    }

    next();
  };
}
