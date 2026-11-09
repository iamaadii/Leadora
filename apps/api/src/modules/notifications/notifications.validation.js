// notifications.validation.js
// Phase 10: In-App Notification Request Validation

import { z } from 'zod';
import { NOTIFICATION_TYPES } from './notifications.constants.js';

export const queryNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  type: z.nativeEnum(NOTIFICATION_TYPES).optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Notification ID must be a valid UUID' }),
});
