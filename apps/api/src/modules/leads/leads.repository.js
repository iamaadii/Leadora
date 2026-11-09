import { pool } from '../../config/database.js';

export const leadsRepository = {
  /**
   * Insert a new lead record
   * @param {object} lead
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async create(lead, db = pool) {
    const query = `
      INSERT INTO leads (
        organization_id,
        name,
        email,
        phone,
        company,
        source,
        status,
        assigned_to_id,
        description,
        created_by_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      lead.organization_id,
      lead.name,
      lead.email || null,
      lead.phone || null,
      lead.company || null,
      lead.source || 'WEBSITE',
      lead.status || 'NEW',
      lead.assigned_to_id || null,
      lead.description || null,
      lead.created_by_id,
    ];

    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Find a lead by ID with user joins, scoped strictly by organization
   * @param {string} id
   * @param {string} organizationId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async findById(id, organizationId, db = pool) {
    const query = `
      SELECT 
        l.*,
        u_assignee.first_name AS assigned_to_first_name,
        u_assignee.last_name AS assigned_to_last_name,
        u_assignee.email AS assigned_to_email,
        u_creator.first_name AS created_by_first_name,
        u_creator.last_name AS created_by_last_name,
        u_creator.email AS created_by_email
      FROM leads l
      LEFT JOIN users u_assignee ON l.assigned_to_id = u_assignee.id
      LEFT JOIN users u_creator ON l.created_by_id = u_creator.id
      WHERE l.id = $1 AND l.organization_id = $2;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Find paginated leads matching filter criteria
   * @param {object} params
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async findMany(params, db = pool) {
    const {
      organizationId,
      role,
      userId,
      page = 1,
      limit = 10,
      search,
      status,
      source,
      assigned_to_id,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      isArchived = false,
    } = params;

    const conditions = ['l.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    // Role-based scoping: Employees only view leads assigned to them or created by them
    if (role === 'EMPLOYEE') {
      conditions.push(`(l.assigned_to_id = $${paramIndex} OR l.created_by_id = $${paramIndex})`);
      values.push(userId);
      paramIndex++;
    }

    // Archive filter
    if (isArchived) {
      conditions.push('l.archived_at IS NOT NULL');
    } else {
      conditions.push('l.archived_at IS NULL');
    }

    // Status filter
    if (status) {
      conditions.push(`l.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    // Source filter
    if (source) {
      conditions.push(`l.source = $${paramIndex}`);
      values.push(source);
      paramIndex++;
    }

    // Assignee filter
    if (assigned_to_id) {
      conditions.push(`l.assigned_to_id = $${paramIndex}`);
      values.push(assigned_to_id);
      paramIndex++;
    }

    // Search query (name, email, phone, company)
    if (search) {
      conditions.push(
        `(l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Date range filters
    if (startDate) {
      conditions.push(`l.created_at >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`l.created_at <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Total count query
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM leads l
      WHERE ${whereClause};
    `;
    const countRes = await db.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Data query with allowlisted safe sorting
    const dataQuery = `
      SELECT 
        l.*,
        u_assignee.first_name AS assigned_to_first_name,
        u_assignee.last_name AS assigned_to_last_name,
        u_assignee.email AS assigned_to_email,
        u_creator.first_name AS created_by_first_name,
        u_creator.last_name AS created_by_last_name
      FROM leads l
      LEFT JOIN users u_assignee ON l.assigned_to_id = u_assignee.id
      LEFT JOIN users u_creator ON l.created_by_id = u_creator.id
      WHERE ${whereClause}
      ORDER BY l.${sortBy} ${sortOrder}
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
   * Update lead fields
   * @param {string} id
   * @param {string} organizationId
   * @param {object} fields
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
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
      UPDATE leads
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND organization_id = $2
      RETURNING *;
    `;

    const res = await db.query(query, values);
    return res.rows[0] || null;
  },

  /**
   * Soft archive lead
   * @param {string} id
   * @param {string} organizationId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async archive(id, organizationId, db = pool) {
    const query = `
      UPDATE leads
      SET archived_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
      RETURNING *;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Restore archived lead
   * @param {string} id
   * @param {string} organizationId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async restore(id, organizationId, db = pool) {
    const query = `
      UPDATE leads
      SET archived_at = NULL, updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
      RETURNING *;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Insert a lead activity record
   * @param {object} activity
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
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
      RETURNING *;
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
   * Find paginated activities for a lead
   * @param {string} leadId
   * @param {string} organizationId
   * @param {object} pagination
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async findActivities(leadId, organizationId, { page = 1, limit = 20 }, db = pool) {
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM activities
      WHERE lead_id = $1 AND organization_id = $2;
    `;
    const countRes = await db.query(countQuery, [leadId, organizationId]);
    const total = countRes.rows[0]?.total || 0;

    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        a.*,
        u.first_name AS actor_first_name,
        u.last_name AS actor_last_name,
        u.email AS actor_email,
        u.role AS actor_role
      FROM activities a
      LEFT JOIN users u ON a.actor_user_id = u.id
      WHERE a.lead_id = $1 AND a.organization_id = $2
      ORDER BY a.created_at DESC
      LIMIT $3 OFFSET $4;
    `;

    const res = await db.query(query, [leadId, organizationId, limit, offset]);
    return {
      data: res.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Check if user exists, belongs to organization, and is active
   * @param {string} userId
   * @param {string} organizationId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async findActiveUserInOrg(userId, organizationId, db = pool) {
    const query = `
      SELECT id, organization_id, first_name, last_name, email, role, is_active
      FROM users
      WHERE id = $1 AND organization_id = $2 AND is_active = true;
    `;
    const res = await db.query(query, [userId, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Get all active assignable users in organization
   * @param {string} organizationId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async findAssignableUsers(organizationId, db = pool) {
    const query = `
      SELECT id, first_name, last_name, email, role
      FROM users
      WHERE organization_id = $1 AND is_active = true
      ORDER BY first_name ASC, last_name ASC;
    `;
    const res = await db.query(query, [organizationId]);
    return res.rows;
  },
};
