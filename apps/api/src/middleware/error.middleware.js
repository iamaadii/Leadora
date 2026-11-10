import { ZodError } from 'zod';

export function errorMiddleware(err, req, res, _next) {
  const timestamp = new Date().toISOString();
  const requestId = req.id || null;
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request data',
      error: {
        code: 'VALIDATION_ERROR',
        details: err.flatten().fieldErrors,
        requestId,
        timestamp,
      },
    });
  }

  // Handle PostgreSQL specific errors
  if (err.code && err.code.length === 5) {
    // 23505 = unique_violation
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A record with this unique value already exists',
        error: {
          code: 'CONFLICT',
          details: isProduction ? null : err.detail,
          requestId,
          timestamp,
        },
      });
    }

    // 23503 = foreign_key_violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referenced entity does not exist',
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          details: isProduction ? null : err.detail,
          requestId,
          timestamp,
        },
      });
    }
  }

  // Custom application errors with status code
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message =
    statusCode >= 500 && isProduction
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(`[ERROR] [${requestId || 'NO_REQ_ID'}] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details: isProduction && statusCode >= 500 ? null : (err.details || null),
      requestId,
      timestamp,
    },
  });
}
