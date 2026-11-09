import { pool } from '../../config/database.js';

export const dashboardRepository = {
  /**
   * Helper: Build WHERE clause fragment for lead scoping by role
   */
  _buildLeadScopeCondition(role, userId, paramIndex) {
    if (role === 'EMPLOYEE') {
      return {
        clause: `(l.assigned_to_id = $${paramIndex} OR l.created_by_id = $${paramIndex})`,
        params: [userId],
        nextIndex: paramIndex + 1,
      };
    }
    if (role === 'MANAGER') {
      return {
        clause: `(
          l.assigned_to_id = $${paramIndex}
          OR l.created_by_id = $${paramIndex}
          OR l.assigned_to_id IN (
            SELECT tm.employee_id
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE t.manager_id = $${paramIndex}
              AND t.organization_id = l.organization_id
              AND t.is_active = TRUE
              AND tm.removed_at IS NULL
          )
        )`,
        params: [userId],
        nextIndex: paramIndex + 1,
      };
    }
    // Admin has full organization scope
    return { clause: null, params: [], nextIndex: paramIndex };
  },

  /**
   * Helper: Build WHERE clause fragment for follow-up scoping by role
   */
  _buildFollowupScopeCondition(role, userId, paramIndex) {
    if (role === 'EMPLOYEE') {
      return {
        clause: `f.assigned_to_id = $${paramIndex}`,
        params: [userId],
        nextIndex: paramIndex + 1,
      };
    }
    if (role === 'MANAGER') {
      return {
        clause: `(
          f.assigned_to_id = $${paramIndex}
          OR f.assigned_to_id IN (
            SELECT tm.employee_id
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE t.manager_id = $${paramIndex}
              AND t.organization_id = f.organization_id
              AND t.is_active = TRUE
              AND tm.removed_at IS NULL
          )
        )`,
        params: [userId],
        nextIndex: paramIndex + 1,
      };
    }
    // Admin has full organization scope
    return { clause: null, params: [], nextIndex: paramIndex };
  },

  /**
   * 1. Overview KPIs: Lead & Follow-up statistics with period comparisons
   */
  async getOverviewMetrics(
    organizationId,
    role,
    userId,
    { startDate, endDate, prevStartDate, prevEndDate },
    db = pool,
  ) {
    // 1A. Lead Aggregation
    const leadConditions = ['l.organization_id = $1', 'l.archived_at IS NULL'];
    const leadValues = [organizationId, startDate, endDate, prevStartDate, prevEndDate];
    let leadParamIndex = 6;

    const leadScope = this._buildLeadScopeCondition(role, userId, leadParamIndex);
    if (leadScope.clause) {
      leadConditions.push(leadScope.clause);
      leadValues.push(...leadScope.params);
      leadParamIndex = leadScope.nextIndex;
    }

    const leadQuery = `
      SELECT 
        COUNT(*)::int AS total_leads,
        COUNT(*) FILTER (WHERE l.status = 'CONVERTED')::int AS converted_leads,
        COUNT(*) FILTER (WHERE l.status = 'LOST')::int AS lost_leads,
        COUNT(*) FILTER (WHERE l.created_at >= $2 AND l.created_at <= $3)::int AS new_leads_in_period,
        COUNT(*) FILTER (WHERE l.created_at >= $4 AND l.created_at <= $5)::int AS new_leads_prev_period
      FROM leads l
      WHERE ${leadConditions.join(' AND ')};
    `;

    // 1B. Follow-up Aggregation
    const followupConditions = ['f.organization_id = $1'];
    const followupValues = [organizationId, startDate, endDate, prevStartDate, prevEndDate];
    let followupParamIndex = 6;

    const followupScope = this._buildFollowupScopeCondition(role, userId, followupParamIndex);
    if (followupScope.clause) {
      followupConditions.push(followupScope.clause);
      followupValues.push(...followupScope.params);
      followupParamIndex = followupScope.nextIndex;
    }

    const followupQuery = `
      SELECT 
        COUNT(*)::int AS total_followups,
        COUNT(*) FILTER (WHERE f.status = 'PENDING')::int AS pending_followups,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at < NOW())::int AS overdue_followups,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= CURRENT_DATE AND f.due_at < CURRENT_DATE + INTERVAL '1 day')::int AS due_today_followups,
        COUNT(*) FILTER (WHERE f.status = 'COMPLETED' AND f.completed_at >= $2 AND f.completed_at <= $3)::int AS completed_in_period,
        COUNT(*) FILTER (WHERE f.status = 'COMPLETED' AND f.completed_at >= $4 AND f.completed_at <= $5)::int AS completed_prev_period
      FROM followups f
      WHERE ${followupConditions.join(' AND ')};
    `;

    // 1C. Verified Historical Conversions from Activities Table
    const conversionConditions = [
      'a.organization_id = $1',
      "a.activity_type = 'LEAD_STATUS_CHANGED'",
      "a.metadata->>'to' = 'CONVERTED'",
      'l.archived_at IS NULL',
    ];
    const conversionValues = [organizationId, startDate, endDate, prevStartDate, prevEndDate];
    let conversionParamIndex = 6;

    const conversionScope = this._buildLeadScopeCondition(role, userId, conversionParamIndex);
    if (conversionScope.clause) {
      conversionConditions.push(conversionScope.clause);
      conversionValues.push(...conversionScope.params);
      conversionParamIndex = conversionScope.nextIndex;
    }

    const conversionQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE a.created_at >= $2 AND a.created_at <= $3)::int AS conversions_in_period,
        COUNT(*) FILTER (WHERE a.created_at >= $4 AND a.created_at <= $5)::int AS conversions_prev_period
      FROM activities a
      JOIN leads l ON a.lead_id = l.id AND l.organization_id = a.organization_id
      WHERE ${conversionConditions.join(' AND ')};
    `;

    const [leadRes, followupRes, conversionRes] = await Promise.all([
      db.query(leadQuery, leadValues),
      db.query(followupQuery, followupValues),
      db.query(conversionQuery, conversionValues),
    ]);

    const leadRow = leadRes.rows[0] || {};
    const followupRow = followupRes.rows[0] || {};
    const conversionRow = conversionRes.rows[0] || {};

    const totalLeads = leadRow.total_leads || 0;
    const convertedLeads = leadRow.converted_leads || 0;
    const lostLeads = leadRow.lost_leads || 0;
    const overallConversionRate =
      totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    return {
      totalLeads,
      convertedLeads,
      lostLeads,
      overallConversionRate,
      newLeadsInPeriod: leadRow.new_leads_in_period || 0,
      newLeadsPrevPeriod: leadRow.new_leads_prev_period || 0,
      conversionsInPeriod: conversionRow.conversions_in_period || 0,
      conversionsPrevPeriod: conversionRow.conversions_prev_period || 0,
      pendingFollowups: followupRow.pending_followups || 0,
      overdueFollowups: followupRow.overdue_followups || 0,
      dueTodayFollowups: followupRow.due_today_followups || 0,
      completedFollowupsInPeriod: followupRow.completed_in_period || 0,
      completedFollowupsPrevPeriod: followupRow.completed_prev_period || 0,
    };
  },

  /**
   * 2. Lead Pipeline Distribution across all 7 lifecycle stages
   */
  async getLeadPipeline(organizationId, role, userId, db = pool) {
    const conditions = ['l.organization_id = $1', 'l.archived_at IS NULL'];
    const values = [organizationId];
    let paramIndex = 2;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    const query = `
      SELECT 
        l.status,
        COUNT(*)::int AS count
      FROM leads l
      WHERE ${conditions.join(' AND ')}
      GROUP BY l.status;
    `;

    const res = await db.query(query, values);
    return res.rows;
  },

  /**
   * 3. Lead Creation Time-Series Trends
   */
  async getLeadCreationTrends(
    organizationId,
    role,
    userId,
    interval,
    startDate,
    endDate,
    db = pool,
  ) {
    const conditions = [
      'l.organization_id = $1',
      'l.archived_at IS NULL',
      'l.created_at >= $2',
      'l.created_at <= $3',
    ];
    const values = [organizationId, startDate, endDate];
    let paramIndex = 4;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    const query = `
      SELECT 
        DATE_TRUNC('${interval}', l.created_at) AS date_bucket,
        COUNT(*)::int AS new_leads
      FROM leads l
      WHERE ${conditions.join(' AND ')}
      GROUP BY date_bucket
      ORDER BY date_bucket ASC;
    `;

    const res = await db.query(query, values);
    return res.rows;
  },

  /**
   * 4. Verified Historical Conversion Time-Series Trends
   */
  async getHistoricalConversionTrends(
    organizationId,
    role,
    userId,
    interval,
    startDate,
    endDate,
    db = pool,
  ) {
    const conditions = [
      'a.organization_id = $1',
      "a.activity_type = 'LEAD_STATUS_CHANGED'",
      "a.metadata->>'to' = 'CONVERTED'",
      'l.archived_at IS NULL',
      'a.created_at >= $2',
      'a.created_at <= $3',
    ];
    const values = [organizationId, startDate, endDate];
    let paramIndex = 4;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    const query = `
      SELECT 
        DATE_TRUNC('${interval}', a.created_at) AS date_bucket,
        COUNT(*)::int AS conversions
      FROM activities a
      JOIN leads l ON a.lead_id = l.id AND l.organization_id = a.organization_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY date_bucket
      ORDER BY date_bucket ASC;
    `;

    const res = await db.query(query, values);
    return res.rows;
  },

  /**
   * 5. Follow-up Analytics (Status, Type, Priority breakdowns)
   */
  async getFollowupAnalytics(organizationId, role, userId, db = pool) {
    const conditions = ['f.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    const followupScope = this._buildFollowupScopeCondition(role, userId, paramIndex);
    if (followupScope.clause) {
      conditions.push(followupScope.clause);
      values.push(...followupScope.params);
      paramIndex = followupScope.nextIndex;
    }

    const whereClause = conditions.join(' AND ');

    // 5A. Status breakdown
    const statusQuery = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= NOW())::int AS pending_upcoming,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at < NOW())::int AS overdue,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= CURRENT_DATE AND f.due_at < CURRENT_DATE + INTERVAL '1 day')::int AS due_today,
        COUNT(*) FILTER (WHERE f.status = 'COMPLETED')::int AS completed,
        COUNT(*) FILTER (WHERE f.status = 'CANCELLED')::int AS cancelled
      FROM followups f
      WHERE ${whereClause};
    `;

    // 5B. Type breakdown
    const typeQuery = `
      SELECT 
        f.type,
        COUNT(*)::int AS count
      FROM followups f
      WHERE ${whereClause}
      GROUP BY f.type;
    `;

    // 5C. Priority breakdown
    const priorityQuery = `
      SELECT 
        f.priority,
        COUNT(*)::int AS count
      FROM followups f
      WHERE ${whereClause}
      GROUP BY f.priority;
    `;

    const [statusRes, typeRes, priorityRes] = await Promise.all([
      db.query(statusQuery, values),
      db.query(typeQuery, values),
      db.query(priorityQuery, values),
    ]);

    const statusRow = statusRes.rows[0] || {};
    const total = statusRow.total || 0;
    const completed = statusRow.completed || 0;
    const completionRate = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

    return {
      statusBreakdown: {
        total,
        pending: statusRow.pending_upcoming || 0,
        overdue: statusRow.overdue || 0,
        dueToday: statusRow.due_today || 0,
        completed,
        cancelled: statusRow.cancelled || 0,
        completionRate,
      },
      typeBreakdown: typeRes.rows,
      priorityBreakdown: priorityRes.rows,
    };
  },

  /**
   * 6. Team Performance (Admin sees all teams; Manager sees only managed teams)
   */
  async getTeamPerformance(organizationId, role, userId, db = pool) {
    const conditions = ['t.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    if (role === 'MANAGER') {
      conditions.push(`t.manager_id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT 
        t.id AS team_id,
        t.name AS team_name,
        t.description,
        t.is_active,
        u.id AS manager_id,
        u.first_name AS manager_first_name,
        u.last_name AS manager_last_name,
        u.email AS manager_email,
        (
          SELECT COUNT(*)::int 
          FROM team_members tm 
          WHERE tm.team_id = t.id AND tm.removed_at IS NULL
        ) AS member_count,
        (
          SELECT COUNT(l.id)::int 
          FROM team_members tm 
          JOIN leads l ON l.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND l.organization_id = t.organization_id 
            AND l.archived_at IS NULL
        ) AS total_leads,
        (
          SELECT COUNT(l.id)::int 
          FROM team_members tm 
          JOIN leads l ON l.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND l.organization_id = t.organization_id 
            AND l.archived_at IS NULL
            AND l.status = 'CONVERTED'
        ) AS won_leads,
        (
          SELECT COUNT(l.id)::int 
          FROM team_members tm 
          JOIN leads l ON l.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND l.organization_id = t.organization_id 
            AND l.archived_at IS NULL
            AND l.status = 'LOST'
        ) AS lost_leads,
        (
          SELECT COUNT(f.id)::int 
          FROM team_members tm 
          JOIN followups f ON f.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND f.organization_id = t.organization_id 
            AND f.status = 'PENDING'
        ) AS pending_followups,
        (
          SELECT COUNT(f.id)::int 
          FROM team_members tm 
          JOIN followups f ON f.assigned_to_id = tm.employee_id 
          WHERE tm.team_id = t.id 
            AND tm.removed_at IS NULL 
            AND f.organization_id = t.organization_id 
            AND f.status = 'PENDING'
            AND f.due_at < NOW()
        ) AS overdue_followups
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      WHERE ${whereClause}
      ORDER BY t.created_at DESC;
    `;

    const res = await db.query(query, values);
    return res.rows.map((row) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      description: row.description,
      isActive: row.is_active,
      manager: row.manager_id
        ? {
            id: row.manager_id,
            name: `${row.manager_first_name || ''} ${row.manager_last_name || ''}`.trim(),
            email: row.manager_email,
          }
        : null,
      memberCount: row.member_count || 0,
      totalLeads: row.total_leads || 0,
      wonLeads: row.won_leads || 0,
      lostLeads: row.lost_leads || 0,
      conversionRate:
        row.total_leads > 0
          ? Number(((row.won_leads / row.total_leads) * 100).toFixed(1))
          : 0,
      pendingFollowups: row.pending_followups || 0,
      overdueFollowups: row.overdue_followups || 0,
    }));
  },

  /**
   * 7. Employee Performance (Admin sees all active; Manager sees only active members of managed teams)
   */
  async getEmployeePerformance(
    organizationId,
    role,
    userId,
    { startDate, endDate },
    db = pool,
  ) {
    const conditions = ['u.organization_id = $1', 'u.is_active = TRUE'];
    const values = [organizationId, startDate, endDate];
    let paramIndex = 4;

    if (role === 'MANAGER') {
      conditions.push(`(
        u.id = $${paramIndex}
        OR u.id IN (
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
        u.id AS employee_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        (
          SELECT t.name 
          FROM team_members tm 
          JOIN teams t ON tm.team_id = t.id 
          WHERE tm.employee_id = u.id 
            AND tm.removed_at IS NULL 
            AND t.is_active = TRUE
          LIMIT 1
        ) AS team_name,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.assigned_to_id = u.id 
            AND l.organization_id = u.organization_id 
            AND l.archived_at IS NULL
        ) AS active_leads,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.assigned_to_id = u.id 
            AND l.organization_id = u.organization_id 
            AND l.archived_at IS NULL
            AND l.status = 'CONVERTED'
        ) AS converted_leads,
        (
          SELECT COUNT(*)::int 
          FROM leads l 
          WHERE l.assigned_to_id = u.id 
            AND l.organization_id = u.organization_id 
            AND l.archived_at IS NULL
            AND l.status = 'LOST'
        ) AS lost_leads,
        (
          SELECT COUNT(*)::int 
          FROM followups f 
          WHERE f.assigned_to_id = u.id 
            AND f.organization_id = u.organization_id 
            AND f.status = 'PENDING'
        ) AS pending_followups,
        (
          SELECT COUNT(*)::int 
          FROM followups f 
          WHERE f.assigned_to_id = u.id 
            AND f.organization_id = u.organization_id 
            AND f.status = 'PENDING'
            AND f.due_at < NOW()
        ) AS overdue_followups,
        (
          SELECT COUNT(*)::int 
          FROM followups f 
          WHERE f.assigned_to_id = u.id 
            AND f.organization_id = u.organization_id 
            AND f.status = 'COMPLETED'
            AND f.completed_at >= $2 AND f.completed_at <= $3
        ) AS completed_followups_in_period
      FROM users u
      WHERE ${whereClause}
      ORDER BY active_leads DESC, u.first_name ASC;
    `;

    const res = await db.query(query, values);
    return res.rows.map((row) => ({
      employeeId: row.employee_id,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      email: row.email,
      role: row.role,
      teamName: row.team_name || 'Unassigned',
      activeLeads: row.active_leads || 0,
      convertedLeads: row.converted_leads || 0,
      lostLeads: row.lost_leads || 0,
      conversionRate:
        row.active_leads > 0
          ? Number(((row.converted_leads / row.active_leads) * 100).toFixed(1))
          : 0,
      pendingFollowups: row.pending_followups || 0,
      overdueFollowups: row.overdue_followups || 0,
      completedFollowupsInPeriod: row.completed_followups_in_period || 0,
    }));
  },

  /**
   * 8. Recent Activities (Role-scoped latest activity log entries)
   */
  async getRecentActivity(organizationId, role, userId, limit = 10, db = pool) {
    const conditions = ['a.organization_id = $1'];
    const values = [organizationId, limit];
    let paramIndex = 3;

    if (role === 'EMPLOYEE') {
      conditions.push(`(
        a.actor_user_id = $${paramIndex}
        OR l.assigned_to_id = $${paramIndex}
        OR l.created_by_id = $${paramIndex}
      )`);
      values.push(userId);
      paramIndex++;
    } else if (role === 'MANAGER') {
      conditions.push(`(
        a.actor_user_id = $${paramIndex}
        OR l.assigned_to_id = $${paramIndex}
        OR l.created_by_id = $${paramIndex}
        OR l.assigned_to_id IN (
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
        a.id,
        a.activity_type,
        a.description,
        a.metadata,
        a.created_at,
        l.id AS lead_id,
        l.name AS lead_name,
        l.company AS lead_company,
        u.id AS actor_id,
        u.first_name AS actor_first_name,
        u.last_name AS actor_last_name,
        u.email AS actor_email
      FROM activities a
      JOIN leads l ON a.lead_id = l.id AND l.organization_id = a.organization_id
      LEFT JOIN users u ON a.actor_user_id = u.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $2;
    `;

    const res = await db.query(query, values);
    return res.rows.map((row) => ({
      id: row.id,
      activityType: row.activity_type,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
      lead: {
        id: row.lead_id,
        name: row.lead_name,
        company: row.lead_company,
      },
      actor: row.actor_id
        ? {
            id: row.actor_id,
            name: `${row.actor_first_name || ''} ${row.actor_last_name || ''}`.trim(),
            email: row.actor_email,
          }
        : null,
    }));
  },
};

