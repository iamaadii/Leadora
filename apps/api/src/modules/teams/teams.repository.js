import { pool } from '../../config/database.js';

export const teamsRepository = {
  /**
   * Find paginated teams in an organization, optionally scoped to a manager
   */
  async findMany(organizationId, params, filterByManagerId = null, db = pool) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = params;

    const conditions = ['t.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    if (filterByManagerId) {
      conditions.push(`t.manager_id = $${paramIndex}`);
      values.push(filterByManagerId);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`t.is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Total count
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM teams t
      WHERE ${whereClause};
    `;
    const countRes = await db.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Data query with manager info, member count, active leads count
    const dataQuery = `
      SELECT 
        t.id,
        t.organization_id,
        t.name,
        t.description,
        t.manager_id,
        t.is_active,
        t.created_at,
        t.updated_at,
        u.first_name AS manager_first_name,
        u.last_name AS manager_last_name,
        u.email AS manager_email,
        (
          SELECT COUNT(*)::int 
          FROM team_members tm 
          WHERE tm.team_id = t.id AND tm.removed_at IS NULL
        ) AS member_count,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          JOIN team_members tm ON l.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND l.organization_id = t.organization_id 
            AND l.archived_at IS NULL
        ) AS active_leads_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id AND u.organization_id = t.organization_id
      WHERE ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}
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
   * Find team by ID in organization
   */
  async findById(id, organizationId, db = pool) {
    const query = `
      SELECT 
        t.id,
        t.organization_id,
        t.name,
        t.description,
        t.manager_id,
        t.is_active,
        t.created_at,
        t.updated_at,
        u.first_name AS manager_first_name,
        u.last_name AS manager_last_name,
        u.email AS manager_email,
        (
          SELECT COUNT(*)::int 
          FROM team_members tm 
          WHERE tm.team_id = t.id AND tm.removed_at IS NULL
        ) AS member_count,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          JOIN team_members tm ON l.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND l.organization_id = t.organization_id 
            AND l.archived_at IS NULL
        ) AS active_leads_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id AND u.organization_id = t.organization_id
      WHERE t.id = $1 AND t.organization_id = $2;
    `;
    const res = await db.query(query, [id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Find team by name in organization
   */
  async findByName(name, organizationId, db = pool) {
    const query = `
      SELECT id, name, manager_id, is_active
      FROM teams
      WHERE LOWER(name) = LOWER($1) AND organization_id = $2;
    `;
    const res = await db.query(query, [name, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Create new team
   */
  async create(team, db = pool) {
    const query = `
      INSERT INTO teams (
        organization_id,
        name,
        description,
        manager_id,
        is_active
      )
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING 
        id,
        organization_id,
        name,
        description,
        manager_id,
        is_active,
        created_at,
        updated_at;
    `;
    const values = [
      team.organization_id,
      team.name,
      team.description || null,
      team.manager_id || null,
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Update team fields
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
      UPDATE teams
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND organization_id = $2
      RETURNING 
        id,
        organization_id,
        name,
        description,
        manager_id,
        is_active,
        created_at,
        updated_at;
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  },

  /**
   * Set team active status
   */
  async setActiveStatus(id, organizationId, isActive, db = pool) {
    const query = `
      UPDATE teams
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND organization_id = $3
      RETURNING 
        id,
        organization_id,
        name,
        description,
        manager_id,
        is_active,
        created_at,
        updated_at;
    `;
    const res = await db.query(query, [isActive, id, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Remove all active members from a team (e.g. on deactivation)
   */
  async removeActiveMembersForTeam(teamId, organizationId, db = pool) {
    const query = `
      UPDATE team_members
      SET removed_at = NOW()
      WHERE team_id = $1 AND organization_id = $2 AND removed_at IS NULL;
    `;
    await db.query(query, [teamId, organizationId]);
  },

  /**
   * Check if employee is currently an active member of ANY team
   */
  async findActiveMembershipForEmployee(employeeId, organizationId, db = pool) {
    const query = `
      SELECT tm.id, tm.team_id, tm.employee_id, tm.joined_at, t.name AS team_name
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.employee_id = $1 
        AND tm.organization_id = $2 
        AND tm.removed_at IS NULL;
    `;
    const res = await db.query(query, [employeeId, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Add member to team
   */
  async addMember(teamId, employeeId, organizationId, db = pool) {
    const query = `
      INSERT INTO team_members (
        organization_id,
        team_id,
        employee_id,
        joined_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING 
        id,
        organization_id,
        team_id,
        employee_id,
        joined_at;
    `;
    const res = await db.query(query, [organizationId, teamId, employeeId]);
    return res.rows[0];
  },

  /**
   * Remove member from team
   */
  async removeMember(teamId, employeeId, organizationId, db = pool) {
    const query = `
      UPDATE team_members
      SET removed_at = NOW()
      WHERE team_id = $1 AND employee_id = $2 AND organization_id = $3 AND removed_at IS NULL
      RETURNING id, team_id, employee_id, removed_at;
    `;
    const res = await db.query(query, [teamId, employeeId, organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Get active roster of a team
   */
  async getRoster(teamId, organizationId, db = pool) {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        tm.joined_at,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.assigned_to_id = u.id 
            AND l.organization_id = u.organization_id 
            AND l.archived_at IS NULL
        ) AS active_leads_count
      FROM team_members tm
      JOIN users u ON tm.employee_id = u.id
      WHERE tm.team_id = $1 
        AND tm.organization_id = $2 
        AND tm.removed_at IS NULL
      ORDER BY u.first_name ASC, u.last_name ASC;
    `;
    const res = await db.query(query, [teamId, organizationId]);
    return res.rows;
  },

  /**
   * Get team workload distribution and lead stage breakdown
   */
  async getWorkload(teamId, organizationId, db = pool) {
    // 1. Members workload breakdown
    const memberWorkloadQuery = `
      SELECT 
        u.id AS employee_id,
        u.first_name,
        u.last_name,
        u.email,
        tm.joined_at,
        COUNT(l.id)::int AS total_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'NEW')::int AS new_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'CONTACTED')::int AS contacted_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'INTERESTED')::int AS interested_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'QUALIFIED')::int AS qualified_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'PROPOSAL_SENT')::int AS proposal_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'CONVERTED')::int AS won_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'LOST')::int AS lost_leads
      FROM team_members tm
      JOIN users u ON tm.employee_id = u.id
      LEFT JOIN leads l ON l.assigned_to_id = u.id 
        AND l.organization_id = tm.organization_id 
        AND l.archived_at IS NULL
      WHERE tm.team_id = $1 
        AND tm.organization_id = $2 
        AND tm.removed_at IS NULL
      GROUP BY u.id, u.first_name, u.last_name, u.email, tm.joined_at
      ORDER BY total_leads DESC, u.first_name ASC;
    `;
    const memberWorkloadRes = await db.query(memberWorkloadQuery, [teamId, organizationId]);

    // 2. Team aggregate summary
    const teamSummaryQuery = `
      SELECT 
        COUNT(l.id)::int AS total_team_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'CONVERTED')::int AS won_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'LOST')::int AS lost_leads
      FROM team_members tm
      JOIN leads l ON l.assigned_to_id = tm.employee_id 
        AND l.organization_id = tm.organization_id 
        AND l.archived_at IS NULL
      WHERE tm.team_id = $1 
        AND tm.organization_id = $2 
        AND tm.removed_at IS NULL;
    `;
    const summaryRes = await db.query(teamSummaryQuery, [teamId, organizationId]);
    const summary = summaryRes.rows[0] || {
      total_team_leads: 0,
      won_leads: 0,
      lost_leads: 0,
    };

    const conversionRate = summary.total_team_leads > 0
      ? Number(((summary.won_leads / summary.total_team_leads) * 100).toFixed(1))
      : 0;

    return {
      members: memberWorkloadRes.rows,
      summary: {
        totalLeads: summary.total_team_leads,
        wonLeads: summary.won_leads,
        lostLeads: summary.lost_leads,
        conversionRate,
      },
    };
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
