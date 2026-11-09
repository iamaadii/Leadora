// users.validation.js
// Phase 10: User Profile Validation

import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').max(100).optional(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').max(100).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
});
