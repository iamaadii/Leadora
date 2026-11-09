// notifications.repository.js
// Phase 10: In-App Notification Data Access Layer

import { pool } from '../../config/database.js';
import { NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from './notifications.constants.js';

export const notificationsRepository = {
  /**
   * Find paginated notifications for a user within an organization
   */
  async findManyByUser(userId, organizationId, { isRead, type, page = 1, limit = 20 } = {}, db = pool) {
    const conditions = ['organization_id = $1', 'user_id = $2'];
    const values = [organizationId, userId];
    let paramIndex = 3;

    if (typeof isRead === 'boolean') {
      conditions.push(`is_read = $${paramIndex}`);
      values.push(isRead);
      paramIndex++;
    }

    if (type) {
      conditions.push(`notification_type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM notifications WHERE ${whereClause};`;

    const dataQuery = `
      SELECT 
        id,
        organization_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type,
        entity_id,
        metadata,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataValues = [...values, limit, offset];

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const total = countRes.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications: dataRes.rows,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Count unread notifications for a user
   */
  async countUnread(userId, organizationId, db = pool) {
    const query = `
      SELECT COUNT(*)::int AS unread_count
      FROM notifications
      WHERE organization_id = $1
        AND user_id = $2
        AND is_read = FALSE;
    `;
    const res = await db.query(query, [organizationId, userId]);
    return res.rows[0]?.unread_count || 0;
  },

  /**
   * Find single notification by ID and verify ownership
   */
  async findById(notificationId, userId, organizationId, db = pool) {
    const query = `
      SELECT 
        id,
        organization_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type,
        entity_id,
        metadata,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE id = $1 AND organization_id = $2 AND user_id = $3;
    `;
    const res = await db.query(query, [notificationId, organizationId, userId]);
    return res.rows[0] || null;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, userId, organizationId, db = pool) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = $1 AND organization_id = $2 AND user_id = $3
      RETURNING *;
    `;
    const res = await db.query(query, [notificationId, organizationId, userId]);
    return res.rows[0] || null;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId, organizationId, db = pool) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE organization_id = $1 AND user_id = $2 AND is_read = FALSE
      RETURNING id;
    `;
    const res = await db.query(query, [organizationId, userId]);
    return res.rowCount;
  },

  /**
   * Insert notification record
   */
  async createNotification(notification, db = pool) {
    const query = `
      INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type,
        entity_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      notification.organization_id,
      notification.user_id,
      notification.title,
      notification.message,
      notification.notification_type || NOTIFICATION_TYPES.LEAD_ASSIGNED,
      notification.entity_type || null,
      notification.entity_id || null,
      JSON.stringify(notification.metadata || {}),
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Idempotent reminder check for due-today and overdue follow-ups.
   * Generates at most 1 reminder alert per task per day.
   */
  async generatePendingReminders(userId, organizationId, db = pool) {
    // 1. Overdue reminders (PENDING and due_at < NOW())
    const overdueQuery = `
      INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type,
        entity_id,
        metadata
      )
      SELECT 
        f.organization_id,
        f.assigned_to_id,
        CONCAT('Overdue Follow-up: ', f.title),
        CONCAT('Task "', f.title, '" was due on ', TO_CHAR(f.due_at, 'YYYY-MM-DD HH24:MI'), ' and is currently overdue.'),
        '${NOTIFICATION_TYPES.FOLLOWUP_OVERDUE}',
        '${NOTIFICATION_ENTITY_TYPES.FOLLOWUP}',
        f.id,
        jsonb_build_object('followupId', f.id, 'leadId', f.lead_id, 'dueAt', f.due_at, 'priority', f.priority)
      FROM followups f
      WHERE f.organization_id = $1
        AND f.assigned_to_id = $2
        AND f.status = 'PENDING'
        AND f.due_at < NOW()
      ON CONFLICT (user_id, notification_type, entity_id, (DATE(created_at AT TIME ZONE 'UTC'))) WHERE entity_id IS NOT NULL DO NOTHING;
    `;

    // 2. Due today reminders (PENDING and due_at between today and tomorrow)
    const dueTodayQuery = `
      INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type,
        entity_id,
        metadata
      )
      SELECT 
        f.organization_id,
        f.assigned_to_id,
        CONCAT('Follow-up Due Today: ', f.title),
        CONCAT('Task "', f.title, '" is scheduled for today at ', TO_CHAR(f.due_at, 'HH24:MI'), '.'),
        '${NOTIFICATION_TYPES.FOLLOWUP_DUE_TODAY}',
        '${NOTIFICATION_ENTITY_TYPES.FOLLOWUP}',
        f.id,
        jsonb_build_object('followupId', f.id, 'leadId', f.lead_id, 'dueAt', f.due_at, 'priority', f.priority)
      FROM followups f
      WHERE f.organization_id = $1
        AND f.assigned_to_id = $2
        AND f.status = 'PENDING'
        AND f.due_at >= CURRENT_DATE
        AND f.due_at < CURRENT_DATE + INTERVAL '1 day'
      ON CONFLICT (user_id, notification_type, entity_id, (DATE(created_at AT TIME ZONE 'UTC'))) WHERE entity_id IS NOT NULL DO NOTHING;
    `;

    await Promise.all([
      db.query(overdueQuery, [organizationId, userId]),
      db.query(dueTodayQuery, [organizationId, userId]),
    ]);
  },
};
