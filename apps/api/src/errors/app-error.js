export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST', details = null) {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', details = null) {
    return new AppError(message, 401, code, details);
  }

  static forbidden(message = 'Access denied', code = 'FORBIDDEN', details = null) {
    return new AppError(message, 403, code, details);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND', details = null) {
    return new AppError(message, 404, code, details);
  }

  static conflict(message = 'Resource conflict', code = 'CONFLICT', details = null) {
    return new AppError(message, 409, code, details);
  }

  static validation(message = 'Validation failed', details = null) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }
}
