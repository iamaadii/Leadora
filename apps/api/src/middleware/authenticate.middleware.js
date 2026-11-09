import { verifyAccessToken } from '../utils/token.utils.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../errors/app-error.js';

/**
 * Middleware that authenticates incoming requests using Bearer JWT access tokens.
 * Always verifies active status against PostgreSQL to ensure immediate revocation.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token is missing', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid access token', 'TOKEN_INVALID');
    }

    // Load fresh user data from database rather than relying on stale JWT claims
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw AppError.unauthorized('User account no longer exists', 'USER_NOT_FOUND');
    }

    if (!user.is_active) {
      throw AppError.unauthorized('Your user account has been deactivated', 'USER_INACTIVE');
    }

    // For tenant accounts, ensure the organization is active
    if (user.role !== 'SUPER_ADMIN' && user.organization_id) {
      if (!user.organization_is_active) {
        throw AppError.unauthorized(
          'Your organization account has been suspended or deactivated',
          'ORGANIZATION_INACTIVE',
        );
      }
    }

    const isDemo = Boolean(decoded.isDemo || user.email === 'demo-viewer@leadora.example.com');

    // Attach safe user object to request
    req.user = {
      id: user.id,
      organizationId: user.organization_id,
      organizationName: user.organization_name || null,
      organizationSlug: user.organization_slug || null,
      role: isDemo ? 'DEMO' : user.role,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isDemo,
    };

    // Strict Backend Enforcement: Read-Only Demo Restrictions
    if (isDemo) {
      // 1. Any non-GET state mutation is strictly forbidden
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        throw AppError.forbidden(
          'Live Demo workspace is read-only. Creating, modifying, or deleting records is disabled in demo mode.',
          'DEMO_READ_ONLY',
        );
      }
      // 2. Exporting reports or customer data is strictly forbidden
      if (req.originalUrl && req.originalUrl.includes('/export')) {
        throw AppError.forbidden(
          'Exporting reports and customer data is disabled in demo mode.',
          'DEMO_EXPORT_DISABLED',
        );
      }
      // 3. Platform Administration is strictly forbidden
      if (req.originalUrl && req.originalUrl.includes('/platform')) {
        throw AppError.forbidden(
          'Platform administration is not accessible in demo mode.',
          'DEMO_FORBIDDEN',
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

