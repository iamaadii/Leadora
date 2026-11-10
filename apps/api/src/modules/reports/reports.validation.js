// reports.validation.js
// Phase 9: Reports & Data Export Request Validation

import { z } from 'zod';
import { REPORT_TYPES, PLATFORM_REPORT_TYPES, EXPORT_FORMATS } from './reports.constants.js';

const baseReportQuerySchema = z.object({
  range: z.enum(['today', '7d', '30d', '90d', 'this_month', 'prev_month', 'custom']).optional(),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate format' }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate format' }),
  status: z.string().max(50).optional(),
  stage: z.string().max(50).optional(),
  source: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  priority: z.string().max(50).optional(),
  teamId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

function refineDateRange(schema) {
  return schema
    .refine(
      (data) => {
        if (data.range === 'custom') {
          return Boolean(
            data.startDate &&
              data.endDate &&
              String(data.startDate).trim() !== '' &&
              String(data.endDate).trim() !== '',
          );
        }
        return true;
      },
      {
        message: 'startDate and endDate are required when range is set to custom',
        path: ['startDate'],
      },
    )
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          return start.getTime() <= end.getTime();
        }
        return true;
      },
      {
        message: 'startDate cannot be after endDate',
        path: ['startDate'],
      },
    );
}

export const reportQuerySchema = refineDateRange(baseReportQuerySchema);

export const reportExportSchema = refineDateRange(
  baseReportQuerySchema.extend({
    format: z.enum([EXPORT_FORMATS.CSV, EXPORT_FORMATS.EXCEL, EXPORT_FORMATS.PDF]).default(EXPORT_FORMATS.CSV),
  }),
);

export const reportTypeParamSchema = z.object({
  reportType: z.enum([
    REPORT_TYPES.LEADS,
    REPORT_TYPES.CONVERSIONS,
    REPORT_TYPES.LOST_LEADS,
    REPORT_TYPES.FOLLOWUPS,
    REPORT_TYPES.EMPLOYEES,
    REPORT_TYPES.TEAMS,
    REPORT_TYPES.ACTIVITIES,
  ]),
});

export const platformReportTypeParamSchema = z.object({
  reportType: z.enum([
    PLATFORM_REPORT_TYPES.ORGANIZATIONS,
    PLATFORM_REPORT_TYPES.USERS,
  ]),
});

