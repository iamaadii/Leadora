// notifications.routes.js
// Phase 10: In-App Notification Routes

import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const notificationsRouter = Router();

// In-app notifications require authentication and tenant roles
notificationsRouter.use(authenticate);
notificationsRouter.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

notificationsRouter.get('/', notificationsController.getNotifications);
notificationsRouter.get('/unread-count', notificationsController.getUnreadCount);
notificationsRouter.patch('/read-all', notificationsController.markAllAsRead);
notificationsRouter.patch('/:id/read', notificationsController.markAsRead);

export { notificationsRouter };
