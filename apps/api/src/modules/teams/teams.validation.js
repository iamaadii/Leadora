import { z } from 'zod';
import { ALLOWED_TEAM_SORT_FIELDS, ALLOWED_TEAM_SORT_ORDERS } from './teams.constants.js';

export const createTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required' })
    .trim()
    .min(1, 'Team name cannot be empty')
    .max(100, 'Team name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  managerId: z.string().uuid('Manager ID must be a valid UUID').optional().nullable(),
  manager_id: z.string().uuid('Manager ID must be a valid UUID').optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Team name cannot be empty')
    .max(100, 'Team name must not exceed 100 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  managerId: z.string().uuid('Manager ID must be a valid UUID').optional().nullable(),
  manager_id: z.string().uuid('Manager ID must be a valid UUID').optional().nullable(),
});

export const addTeamMemberSchema = z
  .object({
    employeeId: z.string().uuid('Employee ID must be a valid UUID').optional(),
    employee_id: z.string().uuid('Employee ID must be a valid UUID').optional(),
  })
  .refine((data) => data.employeeId || data.employee_id, {
    message: 'Employee ID is required',
    path: ['employeeId'],
  });

export const queryTeamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  isActive: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === true || val === 'true' || val === '1';
    }),
  sortBy: z
    .string()
    .optional()
    .default('created_at')
    .refine((val) => ALLOWED_TEAM_SORT_FIELDS.includes(val), {
      message: `sortBy must be one of: ${ALLOWED_TEAM_SORT_FIELDS.join(', ')}`,
    }),
  sortOrder: z
    .string()
    .optional()
    .default('DESC')
    .transform((val) => val.toUpperCase())
    .refine((val) => ALLOWED_TEAM_SORT_ORDERS.includes(val), {
      message: 'sortOrder must be ASC or DESC',
    }),
});

export function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}
