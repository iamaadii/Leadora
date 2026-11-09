// platform.validation.js
// Phase 10: Platform Super Admin Tenant Management Validation

import { z } from 'zod';
import { SUPPORTED_CURRENCIES, SUPPORTED_TIMEZONES } from '../organization/organization.constants.js';

export const createPlatformOrganizationSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(255),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  adminFirstName: z.string().trim().min(1, 'Admin first name is required').max(100),
  adminLastName: z.string().trim().min(1, 'Admin last name is required').max(100),
  adminEmail: z.string().trim().email('Valid admin email is required').max(255),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters long').max(100),
  currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
  timezone: z.enum(SUPPORTED_TIMEZONES).default('America/New_York'),
  phone: z.string().trim().max(50).optional(),
  website: z.string().trim().max(255).optional(),
  address: z.string().trim().max(1000).optional(),
});

export const updatePlatformOrganizationStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status boolean is required' }),
});

export const platformOrgIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Organization ID must be a valid UUID' }),
});

export const queryPlatformOrganizationsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  isActive: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
