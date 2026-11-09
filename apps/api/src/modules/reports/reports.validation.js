// reports.validation.js
// Phase 9: Reports & Data Export Request Validation

import { z } from 'zod';
import { REPORT_TYPES, PLATFORM_REPORT_TYPES, EXPORT_FORMATS } from './reports.constants.js';

export const reportQuerySchema = z.object({
  range: z.enum(['today', '7d', '30d', '90d', 'this_month', 'prev_month', 'custom']).optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
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

export const reportExportSchema = reportQuerySchema.extend({
  format: z.enum([EXPORT_FORMATS.CSV, EXPORT_FORMATS.EXCEL, EXPORT_FORMATS.PDF]).default(EXPORT_FORMATS.CSV),
});

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
