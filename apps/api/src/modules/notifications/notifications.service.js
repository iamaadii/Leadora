// notifications.service.js
// Phase 10: In-App Notification Business Logic

import { notificationsRepository } from './notifications.repository.js';
import { sseRegistry } from './sse.registry.js';
import { AppError } from '../../errors/app-error.js';
import { NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from './notifications.constants.js';

export const notificationsService = {
  /**
   * Fetch paginated notifications for the authenticated user
   */
  async getNotifications(user, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access tenant in-app notification feeds.',
        'FORBIDDEN',
      );
    }

    // Idempotently generate pending reminders for today and overdue tasks
    await notificationsRepository.generatePendingReminders(user.id, user.organizationId);

    const result = await notificationsRepository.findManyByUser(
      user.id,
      user.organizationId,
      query,
    );

    return {
      notifications: result.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        notificationType: n.notification_type,
        notification_type: n.notification_type,
        entityType: n.entity_type,
        entity_type: n.entity_type,
        entityId: n.entity_id,
        entity_id: n.entity_id,
        metadata: n.metadata,
        isRead: n.is_read,
        is_read: n.is_read,
        readAt: n.read_at,
        read_at: n.read_at,
        createdAt: n.created_at,
        created_at: n.created_at,
      })),
      meta: result.meta,
    };
  },

  /**
   * Get unread notification count for badge rendering
   */
  async getUnreadCount(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      return { unreadCount: 0 };
    }

    // Idempotently generate reminders first
    await notificationsRepository.generatePendingReminders(user.id, user.organizationId);

    const unreadCount = await notificationsRepository.countUnread(user.id, user.organizationId);
    return { unreadCount };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(user, notificationId) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden('Forbidden', 'FORBIDDEN');
    }

    const updated = await notificationsRepository.markAsRead(
      notificationId,
      user.id,
      user.organizationId,
    );

    if (!updated) {
      throw AppError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }

    // Broadcast SSE event to user
    sseRegistry.broadcastToUser(user.id, user.organizationId, 'notification.read', {
      id: updated.id,
      readAt: updated.read_at,
    });

    return {
      id: updated.id,
      isRead: updated.is_read,
      readAt: updated.read_at,
    };
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden('Forbidden', 'FORBIDDEN');
    }

    const updatedCount = await notificationsRepository.markAllAsRead(
      user.id,
      user.organizationId,
    );

    // Broadcast SSE event to user
    sseRegistry.broadcastToUser(user.id, user.organizationId, 'notification.all_read', {
      updatedCount,
      timestamp: new Date().toISOString(),
    });

    return { updatedCount };
  },

  /**
   * Helper: Create Lead Assignment or Reassignment Notification (called from leads.service)
   */
  async notifyLeadAssignment({ lead, newAssigneeId, actorUser, isReassignment = false }, client) {
    // Never notify self if self-assigned
    if (!newAssigneeId || newAssigneeId === actorUser.id) {
      return null;
    }

    const actorName = `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || 'A team member';
    const type = isReassignment ? NOTIFICATION_TYPES.LEAD_REASSIGNED : NOTIFICATION_TYPES.LEAD_ASSIGNED;
    const title = isReassignment ? `Lead Reassigned: ${lead.name}` : `New Lead Assigned: ${lead.name}`;
    const message = isReassignment
      ? `${actorName} reassigned lead "${lead.name}" (${lead.company || 'Private'}) to you.`
      : `${actorName} assigned a new lead "${lead.name}" (${lead.company || 'Private'}) to you.`;

    const created = await notificationsRepository.createNotification(
      {
        organization_id: actorUser.organizationId,
        user_id: newAssigneeId,
        title,
        message,
        notification_type: type,
        entity_type: NOTIFICATION_ENTITY_TYPES.LEAD,
        entity_id: lead.id,
        metadata: {
          leadId: lead.id,
          leadName: lead.name,
          company: lead.company,
          assignedBy: actorUser.id,
        },
      },
      client,
    );

    if (created) {
      sseRegistry.broadcastToUser(
        newAssigneeId,
        actorUser.organizationId,
        'notification.created',
        created,
      );
    }

    return created;
  },
};
