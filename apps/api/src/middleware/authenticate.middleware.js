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

    // Attach safe user object to request
    req.user = {
      id: user.id,
      organizationId: user.organization_id,
      organizationName: user.organization_name || null,
      organizationSlug: user.organization_slug || null,
      role: user.role,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    next();
  } catch (err) {
    next(err);
  }
}
