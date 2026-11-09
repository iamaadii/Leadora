import { pool } from '../../config/database.js';

export const followupsRepository = {
  /**
   * Insert new follow-up
   */
  async create(data, db = pool) {
    const query = `
      INSERT INTO followups (
        organization_id,
        lead_id,
        assigned_to_id,
        title,
        description,
        type,
        priority,
        due_at,
        status,
        created_by_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)
      RETURNING 
        id,
        organization_id,
        lead_id,
        assigned_to_id,
        title,
        description,
        type,
        priority,
        due_at,
        status,
        completed_at,
        completed_by_id,
        completion_notes,
        created_by_id,
        created_at,
        updated_at;
    `;
    const values = [
      data.organization_id,
      data.lead_id,
      data.assigned_to_id,
      data.title,
      data.description || null,
      data.type || 'CALL',
      data.priority || 'MEDIUM',
      data.due_at,
      data.created_by_id,
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Find follow-up by ID with full lead, assignee, and creator details
   */
  async findById(id, organizationId, db = pool) {
    const query = `
      SELECT 
        f.id,
        f.organization_id,
        f.lead_id,
        f.assigned_to_id,
        f.title,
        f.description,
        f.type,
        f.priority,
        f.due_at,
        f.status,
        (f.status = 'PENDING' AND f.due_at < NOW()) AS is_overdue,
        f.completed_at,
        f.completed_by_id,
        f.completion_notes,
        f.created_by_id,
        f.created_at,
        f.updated_at,
        -- Lead info
        l.name AS lead_name,
        l.company AS lead_company,
        l.status AS lead_status,
        -- Assignee info
        u_assignee.first_name AS assignee_first_name,
        u_assignee.last_name AS assignee_last_name,
        u_assignee.email AS assignee_email,
        -- Creator info
        u_creator.first_name AS creator_first_name,
        u_creator.last_name AS creator_last_name,
        u_creator.email AS creator_email,
        -- Completed by info
        u_completed.first_name AS completed_by_first_name,
        u_completed.last_name AS completed_by_last_name
      FROM followups f
      JOIN leads l ON f.lead_id = l.id AND l.organization_id = f.organization_id
      JOIN users u_assignee ON f.assigned_to_id = u_assignee.id AND u_assignee.organization_id = f.organization_id
      JOIN users u_creator ON f.created_by_id = u_creator.id AND u_creator.organization_id = f.organization_id
      LEFT JOIN users u_completed ON f.completed_by_id = u_completed.id AND u_completed.organization_id = f.organization_id
      WHERE f.id = $1 AND f.organization_id = $2;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Find paginated follow-ups with role-based and multi-tenant scoping
   */
  async findMany(organizationId, role, userId, params, db = pool) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      priority,
      assignedToId,
      assigned_to_id,
      leadId,
      lead_id,
      isOverdue,
      isDueToday,
      myOnly,
      startDate,
      endDate,
      sortBy = 'due_at',
      sortOrder = 'ASC',
    } = params;

    const conditions = ['f.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    // 1. Role-based scoping
    if (role === 'EMPLOYEE' || myOnly) {
      conditions.push(`f.assigned_to_id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    } else if (role === 'MANAGER') {
      // Manager views follow-ups assigned to self or to active members of active managed teams
      conditions.push(`(
        f.assigned_to_id = $${paramIndex}
        OR f.assigned_to_id IN (
          SELECT tm.employee_id
          FROM team_members tm
          JOIN teams t ON tm.team_id = t.id
          WHERE t.manager_id = $${paramIndex}
            AND t.organization_id = $1
            AND t.is_active = TRUE
            AND tm.removed_at IS NULL
        )
      )`);
      values.push(userId);
      paramIndex++;
    }

    // 2. Specific assigned user filter (if caller is permitted and specified)
    const targetAssignee = assignedToId || assigned_to_id;
    if (targetAssignee && (role === 'ADMIN' || (role === 'MANAGER' && !myOnly))) {
      conditions.push(`f.assigned_to_id = $${paramIndex}`);
      values.push(targetAssignee);
      paramIndex++;
    }

    // 3. Search filter
    if (search) {
      conditions.push(
        `(f.title ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex} OR l.name ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    // 4. Status filter
    if (status) {
      if (status === 'OVERDUE') {
        conditions.push(`f.status = 'PENDING' AND f.due_at < NOW()`);
      } else {
        conditions.push(`f.status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }
    }

    // 5. Overdue / Due Today flags
    if (isOverdue) {
      conditions.push(`f.status = 'PENDING' AND f.due_at < NOW()`);
    }

    if (isDueToday) {
      conditions.push(`f.status = 'PENDING' AND f.due_at >= CURRENT_DATE AND f.due_at < CURRENT_DATE + INTERVAL '1 day'`);
    }

    // 6. Type filter
    if (type) {
      conditions.push(`f.type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    // 7. Priority filter
    if (priority) {
      conditions.push(`f.priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    // 8. Lead filter
    const targetLead = leadId || lead_id;
    if (targetLead) {
      conditions.push(`f.lead_id = $${paramIndex}`);
      values.push(targetLead);
      paramIndex++;
    }

    // 9. Date range filters
    if (startDate) {
      conditions.push(`f.due_at >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`f.due_at <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Total count
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM followups f
      JOIN leads l ON f.lead_id = l.id AND l.organization_id = f.organization_id
      WHERE ${whereClause};
    `;
    const countRes = await db.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Data query
    const dataQuery = `
      SELECT 
        f.id,
        f.organization_id,
        f.lead_id,
        f.assigned_to_id,
        f.title,
        f.description,
        f.type,
        f.priority,
        f.due_at,
        f.status,
        (f.status = 'PENDING' AND f.due_at < NOW()) AS is_overdue,
        f.completed_at,
        f.completed_by_id,
        f.completion_notes,
        f.created_by_id,
        f.created_at,
        f.updated_at,
        -- Lead info
        l.name AS lead_name,
        l.company AS lead_company,
        l.status AS lead_status,
        -- Assignee info
        u_assignee.first_name AS assignee_first_name,
        u_assignee.last_name AS assignee_last_name,
        u_assignee.email AS assignee_email,
        -- Creator info
        u_creator.first_name AS creator_first_name,
        u_creator.last_name AS creator_last_name,
        -- Completed by info
        u_completed.first_name AS completed_by_first_name,
        u_completed.last_name AS completed_by_last_name
      FROM followups f
      JOIN leads l ON f.lead_id = l.id AND l.organization_id = f.organization_id
      JOIN users u_assignee ON f.assigned_to_id = u_assignee.id AND u_assignee.organization_id = f.organization_id
      JOIN users u_creator ON f.created_by_id = u_creator.id AND u_creator.organization_id = f.organization_id
      LEFT JOIN users u_completed ON f.completed_by_id = u_completed.id AND u_completed.organization_id = f.organization_id
      WHERE ${whereClause}
      ORDER BY f.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    values.push(limit, offset);
    const dataRes = await db.query(dataQuery, values);

    return {
      data: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Update follow-up fields
   */
  async update(id, organizationId, fields, db = pool) {
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      return this.findById(id, organizationId, db);
    }

    const setClauses = [];
    const values = [id, organizationId];
    let index = 3;

    for (const key of keys) {
      setClauses.push(`${key} = $${index}`);
      values.push(fields[key]);
      index++;
    }

    setClauses.push('updated_at = NOW()');

    const query = `
      UPDATE followups
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND organization_id = $2
      RETURNING *;
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  },

  /**
   * Mark follow-up completed
   */
  async complete(id, organizationId, completedById, completionNotes, db = pool) {
    const query = `
      UPDATE followups
      SET 
        status = 'COMPLETED',
        completed_at = NOW(),
        completed_by_id = $3,
        completion_notes = $4,
        updated_at = NOW()
      WHERE id = $1 AND organization_id = $2 AND status = 'PENDING'
      RETURNING *;
    `;
    const res = await db.query(query, [id, organizationId, completedById, completionNotes || null]);
    return res.rows[0] || null;
  },

  /**
   * Mark follow-up cancelled
   */
  async cancel(id, organizationId, db = pool) {
    const query = `
      UPDATE followups
      SET 
        status = 'CANCELLED',
        updated_at = NOW()
      WHERE id = $1 AND organization_id = $2 AND status = 'PENDING'
      RETURNING *;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Get role-scoped summary counts
   */
  async getSummary(organizationId, role, userId, db = pool) {
    const conditions = ['f.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    if (role === 'EMPLOYEE') {
      conditions.push(`f.assigned_to_id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    } else if (role === 'MANAGER') {
      conditions.push(`(
        f.assigned_to_id = $${paramIndex}
        OR f.assigned_to_id IN (
          SELECT tm.employee_id
          FROM team_members tm
          JOIN teams t ON tm.team_id = t.id
          WHERE t.manager_id = $${paramIndex}
            AND t.organization_id = $1
            AND t.is_active = TRUE
            AND tm.removed_at IS NULL
        )
      )`);
      values.push(userId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE f.status = 'PENDING')::int AS pending,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at < NOW())::int AS overdue,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= CURRENT_DATE AND f.due_at < CURRENT_DATE + INTERVAL '1 day')::int AS due_today,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= CURRENT_DATE + INTERVAL '1 day')::int AS upcoming,
        COUNT(*) FILTER (WHERE f.status = 'COMPLETED')::int AS completed,
        COUNT(*) FILTER (WHERE f.status = 'CANCELLED')::int AS cancelled
      FROM followups f
      WHERE ${whereClause};
    `;

    const res = await db.query(query, values);
    const row = res.rows[0] || {};

    return {
      total: row.total || 0,
      pending: row.pending || 0,
      overdue: row.overdue || 0,
      dueToday: row.due_today || 0,
      due_today: row.due_today || 0,
      upcoming: row.upcoming || 0,
      completed: row.completed || 0,
      cancelled: row.cancelled || 0,
    };
  },

  /**
   * Get follow-ups specifically linked to a lead
   */
  async findByLeadId(leadId, organizationId, db = pool) {
    const query = `
      SELECT 
        f.id,
        f.organization_id,
        f.lead_id,
        f.assigned_to_id,
        f.title,
        f.description,
        f.type,
        f.priority,
        f.due_at,
        f.status,
        (f.status = 'PENDING' AND f.due_at < NOW()) AS is_overdue,
        f.completed_at,
        f.completed_by_id,
        f.completion_notes,
        f.created_by_id,
        f.created_at,
        f.updated_at,
        u_assignee.first_name AS assignee_first_name,
        u_assignee.last_name AS assignee_last_name,
        u_creator.first_name AS creator_first_name,
        u_creator.last_name AS creator_last_name,
        u_completed.first_name AS completed_by_first_name,
        u_completed.last_name AS completed_by_last_name
      FROM followups f
      JOIN users u_assignee ON f.assigned_to_id = u_assignee.id AND u_assignee.organization_id = f.organization_id
      JOIN users u_creator ON f.created_by_id = u_creator.id AND u_creator.organization_id = f.organization_id
      LEFT JOIN users u_completed ON f.completed_by_id = u_completed.id AND u_completed.organization_id = f.organization_id
      WHERE f.lead_id = $1 AND f.organization_id = $2
      ORDER BY f.due_at ASC, f.created_at DESC;
    `;
    const res = await db.query(query, [leadId, organizationId]);
    return res.rows;
  },

  /**
   * Insert activity record for followup lifecycle
   */
  async createActivity(activity, db = pool) {
    const query = `
      INSERT INTO activities (
        organization_id,
        lead_id,
        actor_user_id,
        activity_type,
        description,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at;
    `;
    const values = [
      activity.organization_id,
      activity.lead_id,
      activity.actor_user_id || null,
      activity.activity_type,
      activity.description,
      JSON.stringify(activity.metadata || {}),
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Insert in-app notification
   */
  async createNotification(notification, db = pool) {
    const query = `
      INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        notification_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at;
    `;
    const values = [
      notification.organization_id,
      notification.user_id,
      notification.title,
      notification.message,
      notification.notification_type || 'FOLLOWUP_ASSIGNED',
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },
};
