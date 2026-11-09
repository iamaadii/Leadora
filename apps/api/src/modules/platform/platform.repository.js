// platform.repository.js
// Phase 10: Platform Super Admin SQL Data Access Layer

import { pool } from '../../config/database.js';

export const platformRepository = {
  /**
   * Find organizations with search, active filter, and pagination
   */
  async findOrganizations({ search, isActive, page = 1, limit = 20 } = {}, db = pool) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(o.name ILIKE $${paramIndex} OR o.slug ILIKE $${paramIndex} OR o.email ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (typeof isActive === 'boolean') {
      conditions.push(`o.is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM organizations o ${whereClause};`;

    const dataQuery = `
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.email,
        o.phone,
        o.website,
        o.currency,
        o.timezone,
        o.is_active,
        o.created_at,
        o.updated_at,
        (SELECT COUNT(*)::int FROM users u WHERE u.organization_id = o.id) AS user_count,
        (SELECT COUNT(*)::int FROM leads l WHERE l.organization_id = o.id) AS lead_count,
        (
          SELECT json_build_object(
            'id', u.id,
            'name', CONCAT(u.first_name, ' ', u.last_name),
            'email', u.email
          )
          FROM users u
          WHERE u.organization_id = o.id AND u.role = 'ADMIN'
          ORDER BY u.created_at ASC
          LIMIT 1
        ) AS primary_admin
      FROM organizations o
      ${whereClause}
      ORDER BY o.created_at DESC
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
      organizations: dataRes.rows,
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
   * Find single organization with deep stats by ID
   */
  async findById(orgId, db = pool) {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.email,
        o.phone,
        o.website,
        o.address,
        o.currency,
        o.timezone,
        o.is_active,
        o.created_at,
        o.updated_at,
        (SELECT COUNT(*)::int FROM users u WHERE u.organization_id = o.id) AS user_count,
        (SELECT COUNT(*)::int FROM leads l WHERE l.organization_id = o.id) AS lead_count,
        (SELECT COUNT(*)::int FROM teams t WHERE t.organization_id = o.id) AS team_count
      FROM organizations o
      WHERE o.id = $1;
    `;
    const res = await db.query(query, [orgId]);
    return res.rows[0] || null;
  },

  /**
   * Find organization by slug
   */
  async findBySlug(slug, db = pool) {
    const query = `SELECT id, name, slug FROM organizations WHERE slug = $1;`;
    const res = await db.query(query, [slug]);
    return res.rows[0] || null;
  },

  /**
   * Create organization record
   */
  async createOrganization(data, db = pool) {
    const query = `
      INSERT INTO organizations (
        name,
        slug,
        email,
        phone,
        website,
        address,
        currency,
        timezone,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *;
    `;
    const values = [
      data.name,
      data.slug,
      data.email || null,
      data.phone || null,
      data.website || null,
      data.address || null,
      data.currency || 'USD',
      data.timezone || 'America/New_York',
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Create admin user for newly provisioned organization
   */
  async createAdminUser(data, db = pool) {
    const query = `
      INSERT INTO users (
        organization_id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, 'ADMIN', TRUE)
      RETURNING id, organization_id, first_name, last_name, email, role, is_active, created_at;
    `;
    const values = [
      data.organization_id,
      data.first_name,
      data.last_name,
      data.email,
      data.password_hash,
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  /**
   * Update organization status (is_active)
   */
  async updateStatus(orgId, isActive, db = pool) {
    const query = `
      UPDATE organizations
      SET is_active = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, slug, is_active, updated_at;
    `;
    const res = await db.query(query, [orgId, isActive]);
    return res.rows[0] || null;
  },

  /**
   * Revoke all active sessions and refresh tokens for an organization
   */
  async revokeOrganizationSessions(orgId, db = pool) {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id IN (
        SELECT id FROM users WHERE organization_id = $1
      ) AND revoked_at IS NULL;
    `;
    const res = await db.query(query, [orgId]);
    return res.rowCount;
  },

  /**
   * Record administrative audit log
   */
  async createAuditLog(logData, db = pool) {
    const query = `
      INSERT INTO audit_logs (
        organization_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      logData.organization_id || null,
      logData.actor_user_id || null,
      logData.action,
      logData.entity_type,
      logData.entity_id || null,
      JSON.stringify(logData.old_values || null),
      JSON.stringify(logData.new_values || null),
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  },
};
