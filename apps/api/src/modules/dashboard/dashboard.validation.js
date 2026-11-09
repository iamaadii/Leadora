import { z } from 'zod';
import { ALLOWED_DATE_RANGES, ALLOWED_INTERVALS } from './dashboard.constants.js';

export const queryDashboardSchema = z
  .object({
    range: z
      .enum(ALLOWED_DATE_RANGES, {
        errorMap: () => ({
          message: `Range must be one of: ${ALLOWED_DATE_RANGES.join(', ')}`,
        }),
      })
      .default('30d'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    interval: z.enum(ALLOWED_INTERVALS).optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: 'Limit must be an integer between 1 and 100',
      }),
  })
  .refine(
    (data) => {
      if (data.range === 'custom') {
        if (!data.startDate || !data.endDate) return false;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
        if (start > end) return false;
        // Maximum 1 year range to prevent excessive resource utilization
        const oneYearMs = 366 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > oneYearMs) return false;
      }
      return true;
    },
    {
      message:
        'When range is "custom", valid startDate and endDate are required, with startDate <= endDate (max 1 year).',
      path: ['range'],
    },
  );

/**
 * Express middleware to validate query parameters
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || 'query';
      details[field] = issue.message;
    }
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters provided',
        details,
      },
    });
  }
  req.query = result.data;
  next();
};

