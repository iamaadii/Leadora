// activities.routes.js
// Phase 10: Standalone Activities Feed REST Route

import { Router } from 'express';
import { z } from 'zod';
import { reportsRepository } from '../reports/reports.repository.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';
import { AppError } from '../../errors/app-error.js';

const activitiesRouter = Router();

activitiesRouter.use(authenticate);
activitiesRouter.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

const activityFeedQuerySchema = z.object({
  type: z.string().max(50).optional(),
  actorId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

activitiesRouter.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN' || !req.user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access tenant activity feeds.',
        'FORBIDDEN',
      );
    }

    const query = activityFeedQuerySchema.parse(req.query);
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const filters = {
      type: query.type,
      actorId: query.actorId,
      startDate: query.startDate,
      endDate: query.endDate,
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
