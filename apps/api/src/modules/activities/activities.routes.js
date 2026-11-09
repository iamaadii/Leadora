// activities.routes.js
// Phase 10: Standalone Activities Feed REST Route

import { Router } from 'express';
import { reportsRepository } from '../reports/reports.repository.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';
import { AppError } from '../../errors/app-error.js';

const activitiesRouter = Router();

activitiesRouter.use(authenticate);
activitiesRouter.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

activitiesRouter.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN' || !req.user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access tenant activity feeds.',
        'FORBIDDEN',
      );
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await reportsRepository.getActivityReport({
      organizationId: req.user.organizationId,
      role: req.user.role,
      userId: req.user.id,
      filters,
      limit,
      offset,
      isExport: false,
    });

    const totalPages = Math.ceil(result.totalCount / limit) || 1;

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: {
        page,
        limit,
        total: result.totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

export { activitiesRouter };
