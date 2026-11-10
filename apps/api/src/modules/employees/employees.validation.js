import { z } from 'zod';
import {
  ALLOWED_EMPLOYEE_ROLES,
  ALLOWED_EMPLOYEE_SORT_FIELDS,
  ALLOWED_EMPLOYEE_SORT_ORDERS,
} from './employees.constants.js';

export const createEmployeeSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name must not exceed 100 characters')
      .optional(),
    first_name: z
      .string()
      .trim()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name must not exceed 100 characters')
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name must not exceed 100 characters')
      .optional(),
    last_name: z
      .string()
      .trim()
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name must not exceed 100 characters')
      .optional(),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address')
      .max(255),
    phone: z
      .string()
      .trim()
      .max(50, 'Phone must not exceed 50 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
    role: z.enum(ALLOWED_EMPLOYEE_ROLES, {
      errorMap: () => ({
        message: `Role must be one of: ${ALLOWED_EMPLOYEE_ROLES.join(', ')}`,
      }),
    }),
    temporaryPassword: z
      .string()
      .min(8, 'Temporary password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Temporary password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Temporary password must contain at least one number')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .optional(),
  })
  .refine((data) => data.firstName || data.first_name, {
    message: 'First name is required',
    path: ['firstName'],
  })
  .refine((data) => data.lastName || data.last_name, {
    message: 'Last name is required',
    path: ['lastName'],
  })
  .refine((data) => data.temporaryPassword || data.password, {
    message: 'Temporary password is required',
    path: ['temporaryPassword'],
  });

export const updateEmployeeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(100)
    .optional(),
  first_name: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(100)
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(100)
    .optional(),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(100)
    .optional(),
  phone: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const changeRoleSchema = z.object({
  role: z.enum(ALLOWED_EMPLOYEE_ROLES, {
    errorMap: () => ({
      message: `Role must be one of: ${ALLOWED_EMPLOYEE_ROLES.join(', ')}`,
    }),
  }),
});

export const deactivateEmployeeSchema = z.object({
  reassignLeadsToId: z.string().uuid('Invalid reassignLeadsToId UUID format').optional().nullable(),
  reassignFollowupsToId: z.string().uuid('Invalid reassignFollowupsToId UUID format').optional().nullable(),
  leaveUnassigned: z.boolean().optional().default(false),
});

export const queryEmployeesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(ALLOWED_EMPLOYEE_ROLES).optional(),
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
    .refine((val) => ALLOWED_EMPLOYEE_SORT_FIELDS.includes(val), {
      message: `sortBy must be one of: ${ALLOWED_EMPLOYEE_SORT_FIELDS.join(', ')}`,
    }),
  sortOrder: z
    .string()
    .optional()
    .default('DESC')
    .transform((val) => val.toUpperCase())
    .refine((val) => ALLOWED_EMPLOYEE_SORT_ORDERS.includes(val), {
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
