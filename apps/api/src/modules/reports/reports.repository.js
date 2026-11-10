// reports.repository.js
// Phase 9: Reports & Data Export SQL Data Access Layer

import { pool } from '../../config/database.js';

export const reportsRepository = {
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
    return { clause: null, params: [], nextIndex: paramIndex };
  },

  /**
   * 1. Lead Pipeline & Acquisition Report
   */
  async getLeadReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = ['l.organization_id = $1', 'l.archived_at IS NULL'];
    const values = [organizationId];
    let paramIndex = 2;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    if (filters.startDate) {
      conditions.push(`l.created_at >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`l.created_at <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`l.status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }
    if (filters.source) {
      conditions.push(`l.source = $${paramIndex}`);
      values.push(filters.source);
      paramIndex++;
    }
    if (filters.assignedToId) {
      conditions.push(`l.assigned_to_id = $${paramIndex}`);
      values.push(filters.assignedToId);
      paramIndex++;
    }
    if (filters.teamId) {
      conditions.push(`l.assigned_to_id IN (
        SELECT tm.employee_id FROM team_members tm WHERE tm.team_id = $${paramIndex} AND tm.removed_at IS NULL
      )`);
      values.push(filters.teamId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Count and summary
    const summaryQuery = `
      SELECT 
        COUNT(*)::int AS total_leads,
        COUNT(*) FILTER (WHERE l.status = 'NEW')::int AS new_leads,
        COUNT(*) FILTER (WHERE l.status = 'CONTACTED')::int AS contacted_leads,
        COUNT(*) FILTER (WHERE l.status = 'INTERESTED')::int AS interested_leads,
        COUNT(*) FILTER (WHERE l.status = 'QUALIFIED')::int AS qualified_leads,
        COUNT(*) FILTER (WHERE l.status = 'PROPOSAL_SENT')::int AS proposal_leads,
        COUNT(*) FILTER (WHERE l.status = 'CONVERTED')::int AS converted_leads,
        COUNT(*) FILTER (WHERE l.status = 'LOST')::int AS lost_leads
      FROM leads l
      WHERE ${whereClause};
    `;

    // Data query
    const sortCol = ['created_at', 'name', 'status', 'source'].includes(filters.sortBy)
      ? `l.${filters.sortBy}`
      : 'l.created_at';
    const sortDir = (filters.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.company,
        l.source,
        l.status,
        l.created_at,
        l.updated_at,
        u.id AS assigned_to_id,
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
        u.email AS assigned_to_email,
        (
          SELECT t.name 
          FROM team_members tm 
          JOIN teams t ON tm.team_id = t.id 
          WHERE tm.employee_id = l.assigned_to_id 
            AND tm.removed_at IS NULL 
            AND t.is_active = TRUE 
          LIMIT 1
        ) AS team_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_id = u.id
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      ${paginationClause};
    `;

    const [summaryRes, dataRes] = await Promise.all([
      db.query(summaryQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = summaryRes.rows[0] || {};
    const totalCount = summaryRow.total_leads || 0;

    return {
      totalCount,
      summary: {
        totalLeads: totalCount,
        newLeads: summaryRow.new_leads || 0,
        contactedLeads: summaryRow.contacted_leads || 0,
        interestedLeads: summaryRow.interested_leads || 0,
        qualifiedLeads: summaryRow.qualified_leads || 0,
        proposalLeads: summaryRow.proposal_leads || 0,
        convertedLeads: summaryRow.converted_leads || 0,
        lostLeads: summaryRow.lost_leads || 0,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email || '',
        phone: r.phone || '',
        company: r.company || '',
        source: r.source,
        status: r.status,
        assignedTo: r.assigned_to_name ? r.assigned_to_name.trim() : 'Unassigned',
        assignedToEmail: r.assigned_to_email || '',
        teamName: r.team_name || 'Unassigned',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    };
  },

  /**
   * 2. Lead Conversion & Sales Velocity Report
   */
  async getConversionReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = [
      'l.organization_id = $1',
      'l.archived_at IS NULL',
      "l.status = 'CONVERTED'",
    ];
    const values = [organizationId];
    let paramIndex = 2;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    if (filters.startDate) {
      conditions.push(`l.updated_at >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`l.updated_at <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }
    if (filters.source) {
      conditions.push(`l.source = $${paramIndex}`);
      values.push(filters.source);
      paramIndex++;
    }
    if (filters.assignedToId) {
      conditions.push(`l.assigned_to_id = $${paramIndex}`);
      values.push(filters.assignedToId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Summary query
    const summaryQuery = `
      SELECT 
        COUNT(*)::int AS total_converted,
        ROUND(AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at)) / 86400.0)::numeric, 1) AS avg_days_to_convert,
        (
          SELECT COUNT(*)::int 
          FROM leads all_l 
          WHERE all_l.organization_id = $1 AND all_l.archived_at IS NULL
        ) AS total_organization_leads
      FROM leads l
      WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.company,
        l.source,
        l.created_at,
        l.updated_at AS converted_at,
        ROUND(EXTRACT(EPOCH FROM (l.updated_at - l.created_at)) / 86400.0, 1) AS days_to_convert,
        CONCAT(u.first_name, ' ', u.last_name) AS rep_name,
        (
          SELECT t.name 
          FROM team_members tm 
          JOIN teams t ON tm.team_id = t.id 
          WHERE tm.employee_id = l.assigned_to_id 
            AND tm.removed_at IS NULL 
            AND t.is_active = TRUE 
          LIMIT 1
        ) AS team_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_id = u.id
      WHERE ${whereClause}
      ORDER BY l.updated_at DESC
      ${paginationClause};
    `;

    const [summaryRes, dataRes] = await Promise.all([
      db.query(summaryQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = summaryRes.rows[0] || {};
    const totalConverted = summaryRow.total_converted || 0;
    const totalAllLeads = summaryRow.total_organization_leads || 0;
    const conversionRate = totalAllLeads > 0
      ? Number(((totalConverted / totalAllLeads) * 100).toFixed(1))
      : 0;

    return {
      totalCount: totalConverted,
      summary: {
        totalConverted,
        avgDaysToConvert: Number(summaryRow.avg_days_to_convert || 0),
        conversionRate,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email || '',
        company: r.company || '',
        source: r.source,
        assignedTo: r.rep_name ? r.rep_name.trim() : 'Unassigned',
        teamName: r.team_name || 'Unassigned',
        createdAt: r.created_at,
        convertedAt: r.converted_at,
        daysToConvert: Number(r.days_to_convert || 0),
      })),
    };
  },

  /**
   * 3. Lost Leads & Deal Drop-off Report
   */
  async getLostLeadsReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = [
      'l.organization_id = $1',
      'l.archived_at IS NULL',
      "l.status = 'LOST'",
    ];
    const values = [organizationId];
    let paramIndex = 2;

    const leadScope = this._buildLeadScopeCondition(role, userId, paramIndex);
    if (leadScope.clause) {
      conditions.push(leadScope.clause);
      values.push(...leadScope.params);
      paramIndex = leadScope.nextIndex;
    }

    if (filters.startDate) {
      conditions.push(`l.updated_at >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`l.updated_at <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }
    if (filters.source) {
      conditions.push(`l.source = $${paramIndex}`);
      values.push(filters.source);
      paramIndex++;
    }
    if (filters.assignedToId) {
      conditions.push(`l.assigned_to_id = $${paramIndex}`);
      values.push(filters.assignedToId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const summaryQuery = `
      SELECT 
        COUNT(*)::int AS total_lost,
        (
          SELECT COUNT(*)::int 
          FROM leads all_l 
          WHERE all_l.organization_id = $1 AND all_l.archived_at IS NULL
        ) AS total_leads
      FROM leads l
      WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.company,
        l.source,
        l.created_at,
        l.updated_at AS lost_at,
        CONCAT(u.first_name, ' ', u.last_name) AS rep_name,
        (
          SELECT t.name 
          FROM team_members tm 
          JOIN teams t ON tm.team_id = t.id 
          WHERE tm.employee_id = l.assigned_to_id 
            AND tm.removed_at IS NULL 
            AND t.is_active = TRUE 
          LIMIT 1
        ) AS team_name,
        (
          SELECT a.description 
          FROM activities a 
          WHERE a.lead_id = l.id 
            AND a.activity_type = 'LEAD_STATUS_CHANGED' 
            AND (a.metadata->>'to' = 'LOST' OR a.metadata->>'new_status' = 'LOST')
          ORDER BY a.created_at DESC 
          LIMIT 1
        ) AS status_note
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_id = u.id
      WHERE ${whereClause}
      ORDER BY l.updated_at DESC
      ${paginationClause};
    `;

    const [summaryRes, dataRes] = await Promise.all([
      db.query(summaryQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = summaryRes.rows[0] || {};
    const totalLost = summaryRow.total_lost || 0;
    const totalLeads = summaryRow.total_leads || 0;
    const lossRate = totalLeads > 0 ? Number(((totalLost / totalLeads) * 100).toFixed(1)) : 0;

    return {
      totalCount: totalLost,
      summary: {
        totalLost,
        totalLeads,
        lossRate,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email || '',
        company: r.company || '',
        source: r.source,
        assignedTo: r.rep_name ? r.rep_name.trim() : 'Unassigned',
        teamName: r.team_name || 'Unassigned',
        createdAt: r.created_at,
        lostAt: r.lost_at,
        lossNote: r.status_note || 'Closed without specific reason',
      })),
    };
  },

  /**
   * 4. Follow-up Task & Scheduling Report
   */
  async getFollowupReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = ['f.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    const followupScope = this._buildFollowupScopeCondition(role, userId, paramIndex);
    if (followupScope.clause) {
      conditions.push(followupScope.clause);
      values.push(...followupScope.params);
      paramIndex = followupScope.nextIndex;
    }

    if (filters.startDate) {
      conditions.push(`f.due_at >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`f.due_at <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`f.status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }
    if (filters.type) {
      conditions.push(`f.type = $${paramIndex}`);
      values.push(filters.type);
      paramIndex++;
    }
    if (filters.priority) {
      conditions.push(`f.priority = $${paramIndex}`);
      values.push(filters.priority);
      paramIndex++;
    }
    if (filters.assignedToId) {
      conditions.push(`f.assigned_to_id = $${paramIndex}`);
      values.push(filters.assignedToId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const summaryQuery = `
      SELECT 
        COUNT(*)::int AS total_followups,
        COUNT(*) FILTER (WHERE f.status = 'COMPLETED')::int AS completed_followups,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at < NOW())::int AS overdue_followups,
        COUNT(*) FILTER (WHERE f.status = 'PENDING' AND f.due_at >= NOW())::int AS pending_followups,
        COUNT(*) FILTER (WHERE f.status = 'CANCELLED')::int AS cancelled_followups
      FROM followups f
      WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        f.id,
        f.title,
        f.type,
        f.priority,
        f.status,
        f.due_at,
        f.completed_at,
        f.completion_notes,
        f.created_at,
        l.id AS lead_id,
        l.name AS lead_name,
        l.company AS lead_company,
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
        u.email AS assigned_to_email
      FROM followups f
      JOIN leads l ON f.lead_id = l.id AND l.organization_id = f.organization_id
      LEFT JOIN users u ON f.assigned_to_id = u.id
      WHERE ${whereClause}
      ORDER BY f.due_at DESC
      ${paginationClause};
    `;

    const [summaryRes, dataRes] = await Promise.all([
      db.query(summaryQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = summaryRes.rows[0] || {};
    const totalCount = summaryRow.total_followups || 0;
    const completedCount = summaryRow.completed_followups || 0;
    const completionRate = totalCount > 0 ? Number(((completedCount / totalCount) * 100).toFixed(1)) : 0;

    return {
      totalCount,
      summary: {
        totalFollowups: totalCount,
        completedFollowups: completedCount,
        overdueFollowups: summaryRow.overdue_followups || 0,
        pendingFollowups: summaryRow.pending_followups || 0,
        completionRate,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        priority: r.priority,
        status: r.status,
        dueAt: r.due_at,
        completedAt: r.completed_at,
        leadName: r.lead_name,
        company: r.lead_company || '',
        assignedTo: r.assigned_to_name ? r.assigned_to_name.trim() : 'Unassigned',
        notes: r.completion_notes || '',
      })),
    };
  },

  /**
   * 5. Sales Representative Performance Report
   */
  async getEmployeeReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = ['u.organization_id = $1', 'u.is_active = TRUE'];
    const values = [organizationId];
    let paramIndex = 2;

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
    } else if (role === 'EMPLOYEE') {
      conditions.push(`u.id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    }

    if (filters.teamId) {
      conditions.push(`u.id IN (
        SELECT tm.employee_id FROM team_members tm WHERE tm.team_id = $${paramIndex} AND tm.removed_at IS NULL
      )`);
      values.push(filters.teamId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*)::int AS total_reps FROM users u WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
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
        ) AS total_leads,
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
        ) AS total_followups,
        (
          SELECT COUNT(*)::int 
          FROM followups f 
          WHERE f.assigned_to_id = u.id 
            AND f.organization_id = u.organization_id 
            AND f.status = 'COMPLETED'
        ) AS completed_followups
      FROM users u
      WHERE ${whereClause}
      ORDER BY total_leads DESC, u.first_name ASC
      ${paginationClause};
    `;

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const totalReps = countRes.rows[0]?.total_reps || 0;

    let aggregateConversions = 0;
    let aggregateLeads = 0;

    const rows = dataRes.rows.map((r) => {
      const leads = r.total_leads || 0;
      const converted = r.converted_leads || 0;
      const lost = r.lost_leads || 0;
      const fTotal = r.total_followups || 0;
      const fCompleted = r.completed_followups || 0;

      aggregateLeads += leads;
      aggregateConversions += converted;

      const convRate = leads > 0 ? Number(((converted / leads) * 100).toFixed(1)) : 0;
      const followRate = fTotal > 0 ? Number(((fCompleted / fTotal) * 100).toFixed(1)) : 0;

      return {
        id: r.employee_id,
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        email: r.email,
        role: r.role,
        teamName: r.team_name || 'Unassigned',
        totalLeads: leads,
        convertedLeads: converted,
        lostLeads: lost,
        conversionRate: convRate,
        totalFollowups: fTotal,
        completedFollowups: fCompleted,
        followupCompletionRate: followRate,
      };
    });

    const avgConversionRate = aggregateLeads > 0
      ? Number(((aggregateConversions / aggregateLeads) * 100).toFixed(1))
      : 0;

    return {
      totalCount: totalReps,
      summary: {
        activeRepsCount: totalReps,
        totalAssignedLeads: aggregateLeads,
        totalConvertedLeads: aggregateConversions,
        avgConversionRate,
      },
      rows,
    };
  },

  /**
   * 6. Team Performance & Conversion Report
   */
  async getTeamReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = ['t.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

    if (role === 'MANAGER') {
      conditions.push(`t.manager_id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    }

    if (filters.teamId) {
      conditions.push(`t.id = $${paramIndex}`);
      values.push(filters.teamId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*)::int AS total_teams FROM teams t WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        t.id AS team_id,
        t.name AS team_name,
        t.description,
        t.is_active,
        CONCAT(u.first_name, ' ', u.last_name) AS manager_name,
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
            AND f.status = 'COMPLETED'
        ) AS completed_followups
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      WHERE ${whereClause}
      ORDER BY total_leads DESC, t.name ASC
      ${paginationClause};
    `;

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const totalTeams = countRes.rows[0]?.total_teams || 0;

    let aggregateWon = 0;
    let aggregateLeads = 0;

    const rows = dataRes.rows.map((r) => {
      const leads = r.total_leads || 0;
      const won = r.won_leads || 0;
      const lost = r.lost_leads || 0;
      aggregateWon += won;
      aggregateLeads += leads;

      const convRate = leads > 0 ? Number(((won / leads) * 100).toFixed(1)) : 0;

      return {
        id: r.team_id,
        name: r.team_name,
        managerName: r.manager_name ? r.manager_name.trim() : 'Unassigned',
        managerEmail: r.manager_email || '',
        memberCount: r.member_count || 0,
        totalLeads: leads,
        wonLeads: won,
        lostLeads: lost,
        conversionRate: convRate,
        completedFollowups: r.completed_followups || 0,
        isActive: r.is_active ? 'Active' : 'Inactive',
      };
    });

    const overallConversionRate = aggregateLeads > 0
      ? Number(((aggregateWon / aggregateLeads) * 100).toFixed(1))
      : 0;

    return {
      totalCount: totalTeams,
      summary: {
        totalTeams,
        totalLeads: aggregateLeads,
        totalWonLeads: aggregateWon,
        overallConversionRate,
      },
      rows,
    };
  },

  /**
   * 7. System Activity & Audit Log Report
   */
  async getActivityReport({ organizationId, role, userId, filters = {}, limit = 50, offset = 0, isExport = false }, db = pool) {
    const conditions = ['a.organization_id = $1'];
    const values = [organizationId];
    let paramIndex = 2;

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

    if (filters.startDate) {
      conditions.push(`a.created_at >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`a.created_at <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }
    if (filters.type) {
      if (filters.type === 'STATUS_CHANGED' || filters.type === 'LEAD_STATUS_CHANGED') {
        conditions.push(`a.activity_type IN ('LEAD_STATUS_CHANGED', 'STATUS_CHANGED', 'STATUS_CHANGE')`);
      } else if (filters.type === 'CALL' || filters.type === 'CALL_LOGGED') {
        conditions.push(`a.activity_type IN ('CALL', 'CALL_LOGGED')`);
      } else if (filters.type === 'EMAIL' || filters.type === 'EMAIL_SENT') {
        conditions.push(`a.activity_type IN ('EMAIL', 'EMAIL_SENT')`);
      } else if (filters.type === 'NOTE' || filters.type === 'NOTE_ADDED') {
        conditions.push(`a.activity_type IN ('NOTE', 'NOTE_ADDED')`);
      } else {
        conditions.push(`a.activity_type = $${paramIndex}`);
        values.push(filters.type);
        paramIndex++;
      }
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT 
        COUNT(*)::int AS total_activities
      FROM activities a
      LEFT JOIN leads l ON a.lead_id = l.id
      WHERE ${whereClause};
    `;

    const paginationClause = isExport ? `LIMIT $${paramIndex}` : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataValues = [...values, isExport ? 10000 : limit];
    if (!isExport) dataValues.push(offset);

    const dataQuery = `
      SELECT 
        a.id,
        a.activity_type,
        a.description,
        a.created_at,
        l.id AS lead_id,
        l.name AS lead_name,
        l.company AS lead_company,
        CONCAT(u.first_name, ' ', u.last_name) AS actor_name,
        u.email AS actor_email
      FROM activities a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN users u ON a.actor_user_id = u.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      ${paginationClause};
    `;

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery, values),
      db.query(dataQuery, dataValues),
    ]);

    const totalActivities = countRes.rows[0]?.total_activities || 0;

    return {
      totalCount: totalActivities,
      summary: {
        totalActivities,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        leadId: r.lead_id,
        lead_id: r.lead_id,
        activityType: r.activity_type,
        activity_type: r.activity_type,
        description: r.description,
        details: r.description,
        leadName: r.lead_name || 'Direct Contact',
        lead_name: r.lead_name || 'Direct Contact',
        company: r.lead_company || '',
        actorName: r.actor_name ? r.actor_name.trim() : 'System',
        actor_name: r.actor_name ? r.actor_name.trim() : 'System',
        actorEmail: r.actor_email || '',
        createdAt: r.created_at,
        created_at: r.created_at,
      })),
    };
  },

  /**
   * Platform Report 1: Organizations & Growth Report (Super Admin only)
   */
  async getPlatformOrganizationsReport({ limit = 50, offset = 0, isExport = false }, db = pool) {
    const countQuery = `
      SELECT 
        COUNT(*)::int AS total_orgs,
        COUNT(*) FILTER (WHERE is_active = TRUE)::int AS active_orgs,
        COUNT(*) FILTER (WHERE is_active = FALSE)::int AS inactive_orgs
      FROM organizations;
    `;

    const paginationClause = isExport ? 'LIMIT 10000' : 'LIMIT $1 OFFSET $2';
    const dataValues = isExport ? [] : [limit, offset];

    const dataQuery = `
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.email,
        o.is_active,
        o.created_at,
        (SELECT COUNT(*)::int FROM users u WHERE u.organization_id = o.id) AS user_count,
        (SELECT COUNT(*)::int FROM leads l WHERE l.organization_id = o.id) AS lead_count
      FROM organizations o
      ORDER BY o.created_at DESC
      ${paginationClause};
    `;

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = countRes.rows[0] || {};
    const totalCount = summaryRow.total_orgs || 0;

    return {
      totalCount,
      summary: {
        totalOrganizations: totalCount,
        activeOrganizations: summaryRow.active_orgs || 0,
        inactiveOrganizations: summaryRow.inactive_orgs || 0,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        email: r.email || '',
        status: r.is_active ? 'Active' : 'Inactive',
        userCount: r.user_count || 0,
        leadCount: r.lead_count || 0,
        createdAt: r.created_at,
      })),
    };
  },

  /**
   * Platform Report 2: Users & Role Distribution Report (Super Admin only)
   */
  async getPlatformUsersReport({ limit = 50, offset = 0, isExport = false }, db = pool) {
    const countQuery = `
      SELECT 
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE is_active = TRUE)::int AS active_users,
        COUNT(*) FILTER (WHERE role = 'ADMIN')::int AS admin_count,
        COUNT(*) FILTER (WHERE role = 'MANAGER')::int AS manager_count,
        COUNT(*) FILTER (WHERE role = 'EMPLOYEE')::int AS employee_count,
        COUNT(*) FILTER (WHERE role = 'SUPER_ADMIN')::int AS super_admin_count
      FROM users;
    `;

    const paginationClause = isExport ? 'LIMIT 10000' : 'LIMIT $1 OFFSET $2';
    const dataValues = isExport ? [] : [limit, offset];

    const dataQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.last_login_at,
        u.created_at,
        o.name AS organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      ORDER BY u.created_at DESC
      ${paginationClause};
    `;

    const [countRes, dataRes] = await Promise.all([
      db.query(countQuery),
      db.query(dataQuery, dataValues),
    ]);

    const summaryRow = countRes.rows[0] || {};
    const totalCount = summaryRow.total_users || 0;

    return {
      totalCount,
      summary: {
        totalUsers: totalCount,
        activeUsers: summaryRow.active_users || 0,
        adminUsers: summaryRow.admin_count || 0,
        managerUsers: summaryRow.manager_count || 0,
        employeeUsers: summaryRow.employee_count || 0,
        superAdminUsers: summaryRow.super_admin_count || 0,
      },
      rows: dataRes.rows.map((r) => ({
        id: r.id,
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        email: r.email,
        role: r.role,
        organization: r.organization_name || 'Platform (Super Admin)',
        status: r.is_active ? 'Active' : 'Inactive',
        lastLoginAt: r.last_login_at,
        createdAt: r.created_at,
      })),
    };
  },
};
