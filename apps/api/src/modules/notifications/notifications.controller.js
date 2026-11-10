// notifications.controller.js
// Phase 10: In-App Notification Controller

import { notificationsService } from './notifications.service.js';
import { sseRegistry } from './sse.registry.js';
import {
  queryNotificationsSchema,
  notificationIdParamSchema,
} from './notifications.validation.js';

export const notificationsController = {
  /**
   * GET /api/v1/notifications/stream
   * Real-time Server-Sent Events stream for in-app notifications
   */
  streamNotifications(req, res) {
    if (req.user.role === 'SUPER_ADMIN' || !req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Platform Super Admins cannot access tenant notification stream.',
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.user.id })}\n\n`);

    const cleanup = sseRegistry.addClient(req.user.id, req.user.organizationId, res);

    req.on('close', () => {
      cleanup();
    });

    res.on('finish', () => {
      cleanup();
    });
  },

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
