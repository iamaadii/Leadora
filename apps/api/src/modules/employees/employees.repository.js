import { pool } from '../../config/database.js';

export const employeesRepository = {
  /**
   * Find paginated employees in an organization with active team info
   */
  async findMany(organizationId, params, db = pool) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = params;

    const conditions = ['u.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    if (search) {
      conditions.push(
        `(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`u.role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`u.is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Total count
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM users u
      WHERE ${whereClause};
    `;
    const countRes = await db.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Data query: join active team membership and active leads count
    const dataQuery = `
      SELECT 
        u.id,
        u.organization_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.must_change_password,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        -- Active team for regular employees
        t_member.id AS team_id,
        t_member.name AS team_name,
        -- Active managed team for managers
        t_managed.id AS managed_team_id,
        t_managed.name AS managed_team_name,
        -- Active assigned leads count
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.organization_id = u.organization_id 
            AND l.assigned_to_id = u.id 
            AND l.archived_at IS NULL
        ) AS active_leads_count
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.employee_id AND tm.removed_at IS NULL
      LEFT JOIN teams t_member ON tm.team_id = t_member.id AND t_member.is_active = TRUE
      LEFT JOIN teams t_managed ON u.id = t_managed.manager_id AND t_managed.is_active = TRUE
      WHERE ${whereClause}
      ORDER BY u.${sortBy} ${sortOrder}
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
   * Find employee by ID with team details and leads count
   */
  async findById(id, organizationId, db = pool) {
    const query = `
      SELECT 
        u.id,
        u.organization_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.must_change_password,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        t_member.id AS team_id,
        t_member.name AS team_name,
        t_managed.id AS managed_team_id,
        t_managed.name AS managed_team_name,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.organization_id = u.organization_id 
            AND l.assigned_to_id = u.id 
            AND l.archived_at IS NULL
        ) AS active_leads_count
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.employee_id AND tm.removed_at IS NULL
      LEFT JOIN teams t_member ON tm.team_id = t_member.id AND t_member.is_active = TRUE
      LEFT JOIN teams t_managed ON u.id = t_managed.manager_id AND t_managed.is_active = TRUE
      WHERE u.id = $1 AND u.organization_id = $2;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Find user by email in organization
   */
  async findByEmail(email, organizationId, db = pool) {
    const query = `
      SELECT id, email, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1) AND organization_id = $2;
    `;
    const res = await db.query(query, [email, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Count active administrators in organization
   */
  async countActiveAdmins(organizationId, db = pool) {
    const query = `
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE organization_id = $1 AND role = 'ADMIN' AND is_active = TRUE;
    `;
    const res = await db.query(query, [organizationId]);
    return res.rows[0]?.count || 0;
  },

  /**
   * Get list of active teams led by manager
   */
  async getActiveTeamsLedByManager(managerId, organizationId, db = pool) {
    const query = `
      SELECT id, name
      FROM teams
      WHERE organization_id = $1 AND manager_id = $2 AND is_active = TRUE;
    `;
    const res = await db.query(query, [organizationId, managerId]);
    return res.rows;
  },

  /**
   * Insert new employee
   */
  async create(user, db = pool) {
    const query = `
      INSERT INTO users (
        organization_id,
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        role,
        is_active,
        must_change_password
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE)
      RETURNING 
        id,
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        must_change_password,
        created_at,
        updated_at;
    `;
    const values = [
      user.organization_id,
      user.first_name,
      user.last_name,
      user.email,
      user.password_hash,
      user.phone || null,
      user.role,
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Update employee basic information
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
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND organization_id = $2
      RETURNING 
        id,
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        must_change_password,
        created_at,
        updated_at;
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  },

  /**
   * Update employee role
   */
  async updateRole(id, organizationId, newRole, db = pool) {
    const query = `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2 AND organization_id = $3
      RETURNING 
        id,
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        must_change_password,
        created_at,
        updated_at;
    `;
    const res = await db.query(query, [newRole, id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Set employee active status
   */
  async setActiveStatus(id, organizationId, isActive, db = pool) {
    const query = `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND organization_id = $3
      RETURNING 
        id,
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        must_change_password,
        created_at,
        updated_at;
    `;
    const res = await db.query(query, [isActive, id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Revoke all active refresh sessions for user
   */
  async revokeAllSessions(userId, db = pool) {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL;
    `;
    await db.query(query, [userId]);
  },

  /**
   * Remove active team memberships when user is deactivated
   */
  async removeActiveTeamMemberships(userId, organizationId, db = pool) {
    const query = `
      UPDATE team_members
      SET removed_at = NOW()
      WHERE employee_id = $1 AND organization_id = $2 AND removed_at IS NULL;
    `;
    await db.query(query, [userId, organizationId]);
  },

  /**
   * Insert audit log entry
   */
  async logAudit(auditData, db = pool) {
    const query = `
      INSERT INTO audit_logs (
        organization_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    const values = [
      auditData.organization_id,
      auditData.actor_user_id || null,
      auditData.action,
      auditData.entity_type,
      auditData.entity_id || null,
      auditData.old_values ? JSON.stringify(auditData.old_values) : null,
      auditData.new_values ? JSON.stringify(auditData.new_values) : null,
      auditData.ip_address || null,
    ];
    await db.query(query, values);
  },
};
