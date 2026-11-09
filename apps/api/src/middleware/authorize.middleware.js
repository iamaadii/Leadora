import { AppError } from '../errors/app-error.js';

/**
 * Creates middleware restricting endpoint access to specific roles.
 * Usage: authorizeRoles('ADMIN', 'SUPER_ADMIN')
 * @param  {...string} allowedRoles
 */
export function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED'));
    }

    // Demo access check:
    // If it's a demo session and a read-only GET/HEAD request to tenant resources,
    // grant read access to demo users across Leads, Employees, Teams, Follow-ups, Activities, Reports, Dashboard.
    // Strictly deny if the endpoint is strictly for SUPER_ADMIN platform administration.
    if (req.user.isDemo && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const isSuperAdminOnly = allowedRoles.length === 1 && allowedRoles[0] === 'SUPER_ADMIN';
      if (!isSuperAdminOnly) {
        return next();
      }
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Role "${req.user.role}" does not have permission to perform this action.`,
          'FORBIDDEN',
        ),
      );
    }

    next();
  };
}

