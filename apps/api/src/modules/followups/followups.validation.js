import { z } from 'zod';
import {
  FOLLOWUP_STATUS,
  FOLLOWUP_TYPES,
  FOLLOWUP_PRIORITIES,
  ALLOWED_FOLLOWUP_SORT_FIELDS,
  ALLOWED_FOLLOWUP_SORT_ORDERS,
} from './followups.constants.js';

export const createFollowupSchema = z
  .object({
    leadId: z.string().uuid('Lead ID must be a valid UUID').optional(),
    lead_id: z.string().uuid('Lead ID must be a valid UUID').optional(),
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must not exceed 255 characters'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
    type: z.enum(FOLLOWUP_TYPES, {
      errorMap: () => ({
        message: `Type must be one of: ${FOLLOWUP_TYPES.join(', ')}`,
      }),
    }).default('CALL'),
    priority: z.enum(FOLLOWUP_PRIORITIES, {
      errorMap: () => ({
        message: `Priority must be one of: ${FOLLOWUP_PRIORITIES.join(', ')}`,
      }),
    }).default('MEDIUM'),
    dueAt: z.string().optional(),
    scheduledAt: z.string().optional(),
    due_at: z.string().optional(),
    assignedToId: z.string().uuid('Assigned To ID must be a valid UUID').optional().nullable(),
    assigned_to_id: z.string().uuid('Assigned To ID must be a valid UUID').optional().nullable(),
  })
  .refine((data) => data.leadId || data.lead_id, {
    message: 'Lead ID is required',
    path: ['leadId'],
  })
  .refine((data) => data.dueAt || data.scheduledAt || data.due_at, {
    message: 'Scheduled date and time (dueAt) is required',
    path: ['dueAt'],
  })
  .refine(
    (data) => {
      const rawDate = data.dueAt || data.scheduledAt || data.due_at;
      const parsed = new Date(rawDate);
      return !isNaN(parsed.getTime());
    },
    {
      message: 'Invalid scheduled date and time format',
      path: ['dueAt'],
    },
  );

export const updateFollowupSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255)
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .nullable()
      .or(z.literal('')),
    type: z.enum(FOLLOWUP_TYPES).optional(),
    priority: z.enum(FOLLOWUP_PRIORITIES).optional(),
    dueAt: z.string().optional(),
    scheduledAt: z.string().optional(),
    due_at: z.string().optional(),
    assignedToId: z.string().uuid('Assigned To ID must be a valid UUID').optional().nullable(),
    assigned_to_id: z.string().uuid('Assigned To ID must be a valid UUID').optional().nullable(),
  })
  .refine(
    (data) => {
      const rawDate = data.dueAt || data.scheduledAt || data.due_at;
      if (!rawDate) return true;
      const parsed = new Date(rawDate);
      return !isNaN(parsed.getTime());
    },
    {
      message: 'Invalid scheduled date and time format',
      path: ['dueAt'],
    },
  );

export const completeFollowupSchema = z.object({
  completionNotes: z.string().trim().max(2000).optional().nullable().or(z.literal('')),
  completion_notes: z.string().trim().max(2000).optional().nullable().or(z.literal('')),
});

const ALLOWED_QUERY_STATUSES = [...Object.values(FOLLOWUP_STATUS), 'OVERDUE'];

export const queryFollowupsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine((val) => !val || ALLOWED_QUERY_STATUSES.includes(val), {
      message: `status must be one of: ${ALLOWED_QUERY_STATUSES.join(', ')}`,
    }),
  type: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine((val) => !val || FOLLOWUP_TYPES.includes(val), {
      message: `type must be one of: ${FOLLOWUP_TYPES.join(', ')}`,
    }),
  priority: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine((val) => !val || FOLLOWUP_PRIORITIES.includes(val), {
      message: `priority must be one of: ${FOLLOWUP_PRIORITIES.join(', ')}`,
    }),
  assignedToId: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  isOverdue: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === true || val === 'true' || val === '1';
    }),
  isDueToday: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === true || val === 'true' || val === '1';
    }),
  myOnly: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === true || val === 'true' || val === '1';
    }),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'startDate must be a valid ISO date string',
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'endDate must be a valid ISO date string',
    }),
  sortBy: z
    .string()
    .optional()
    .default('due_at')
    .refine((val) => ALLOWED_FOLLOWUP_SORT_FIELDS.includes(val), {
      message: `sortBy must be one of: ${ALLOWED_FOLLOWUP_SORT_FIELDS.join(', ')}`,
    }),
  sortOrder: z
    .string()
    .optional()
    .default('ASC')
    .transform((val) => val.toUpperCase())
    .refine((val) => ALLOWED_FOLLOWUP_SORT_ORDERS.includes(val), {
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
