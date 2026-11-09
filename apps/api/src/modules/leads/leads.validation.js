import { z } from 'zod';
import {
  LEAD_STATUSES,
  ALLOWED_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
} from './leads.constants.js';

export const createLeadSchema = z.object({
  name: z
    .string({ required_error: 'Lead name is required' })
    .trim()
    .min(1, 'Lead name cannot be empty')
    .max(255, 'Lead name must not exceed 255 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(50, 'Phone number must not exceed 50 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  company: z
    .string()
    .trim()
    .max(255, 'Company name must not exceed 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  source: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default('WEBSITE'),
  status: z
    .enum(LEAD_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
      }),
    })
    .optional()
    .default('NEW'),
  assigned_to_id: z
    .string()
    .uuid('Assigned user ID must be a valid UUID')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const updateLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Lead name cannot be empty')
    .max(255)
    .optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .or(z.literal('')),
  company: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  source: z
    .string()
    .trim()
    .max(50)
    .optional(),
  status: z
    .enum(LEAD_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
      }),
    })
    .optional(),
  assigned_to_id: z
    .string()
    .uuid('Assigned user ID must be a valid UUID')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const queryLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.string().trim().optional(),
  assigned_to_id: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .string()
    .optional()
    .default('created_at')
    .refine((val) => ALLOWED_SORT_FIELDS.includes(val), {
      message: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`,
    }),
  sortOrder: z
    .string()
    .optional()
    .default('DESC')
    .transform((val) => val.toUpperCase())
    .refine((val) => ALLOWED_SORT_ORDERS.includes(val), {
      message: 'sortOrder must be ASC or DESC',
    }),
  isArchived: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => val === true || val === 'true' || val === '1')
    .default(false),
});

/**
 * Express middleware to validate request body
 * @param {z.ZodSchema} schema
 */
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

/**
 * Express middleware to validate request query parameters
 * @param {z.ZodSchema} schema
 */
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
