// notifications.controller.js
// Phase 10: In-App Notification Controller

import { notificationsService } from './notifications.service.js';
import {
  queryNotificationsSchema,
  notificationIdParamSchema,
} from './notifications.validation.js';

export const notificationsController = {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const validatedQuery = queryNotificationsSchema.parse(req.query);
      const result = await notificationsService.getNotifications(req.user, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result.notifications,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationsService.getUnreadCount(req.user);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const result = await notificationsService.markAsRead(req.user, id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationsService.markAllAsRead(req.user);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
