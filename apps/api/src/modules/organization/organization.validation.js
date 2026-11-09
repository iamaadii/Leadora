// organization.validation.js
// Phase 10: Organization Settings Zod Validation

import { z } from 'zod';
import { SUPPORTED_CURRENCIES, SUPPORTED_TIMEZONES } from './organization.constants.js';

export const updateOrganizationSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(255).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  website: z.string().trim().max(255).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` }),
  }).optional(),
  timezone: z.enum(SUPPORTED_TIMEZONES, {
    errorMap: () => ({ message: `Timezone must be a supported identifier (e.g. UTC, America/New_York)` }),
  }).optional(),
});
