import { pool } from '../config/database.js';

export const userRepository = {
  /**
   * Finds a user by ID with attached organization information
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async findById(userId, db = pool) {
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
        u.last_login_at,
        u.created_at,
        u.updated_at,
        o.name AS organization_name,
        o.slug AS organization_slug,
        o.is_active AS organization_is_active,
        o.currency AS organization_currency,
        o.timezone AS organization_timezone
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = $1;
    `;
    const res = await db.query(query, [userId]);
    return res.rows[0] || null;
  },

  /**
   * Finds a user with their password_hash for authentication/password verification
   * @param {string} userId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<object|null>}
   */
  async findWithPasswordById(userId, db = pool) {
    const query = `
      SELECT id, organization_id, password_hash, is_active, role
      FROM users
      WHERE id = $1;
    `;
    const res = await db.query(query, [userId]);
    return res.rows[0] || null;
  },

  /**
   * Finds a tenant user by email and organization slug
   * @param {string} email
   * @param {string} organizationSlug
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<object|null>}
   */
  async findByEmailAndOrgSlug(email, organizationSlug, db = pool) {
    const query = `
      SELECT 
        u.id,
        u.organization_id,
        u.first_name,
        u.last_name,
        u.email,
        u.password_hash,
        u.phone,
        u.role,
        u.is_active,
        u.last_login_at,
        o.name AS organization_name,
        o.slug AS organization_slug,
        o.is_active AS organization_is_active,
        o.currency AS organization_currency,
        o.timezone AS organization_timezone
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE LOWER(u.email) = LOWER($1) AND o.slug = $2;
    `;
    const res = await db.query(query, [email, organizationSlug]);
    return res.rows[0] || null;
  },

  /**
   * Finds a platform Super Admin by email (where organization_id IS NULL)
   * @param {string} email
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<object|null>}
   */
  async findSuperAdminByEmail(email, db = pool) {
    const query = `
      SELECT 
        u.id,
        u.organization_id,
        u.first_name,
        u.last_name,
        u.email,
        u.password_hash,
        u.phone,
        u.role,
        u.is_active,
        u.last_login_at
      FROM users u
      WHERE LOWER(u.email) = LOWER($1)
        AND u.organization_id IS NULL
        AND u.role = 'SUPER_ADMIN';
    `;
    const res = await db.query(query, [email]);
    return res.rows[0] || null;
  },

  /**
   * Updates user password hash
   * @param {string} userId
   * @param {string} newPasswordHash
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async updatePasswordHash(userId, newPasswordHash, db = pool) {
    const query = `
      UPDATE users
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1;
    `;
    await db.query(query, [userId, newPasswordHash]);
  },

  /**
   * Records last login timestamp
   * @param {string} userId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   */
  async updateLastLogin(userId, db = pool) {
    const query = `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = $1;
    `;
    await db.query(query, [userId]);
  },

  /**
   * Updates user personal profile fields (first_name, last_name, phone)
   */
  async updateProfile(userId, { firstName, lastName, phone }, db = pool) {
    const fields = [];
    const values = [userId];
    let idx = 2;

    if (firstName !== undefined) {
      fields.push(`first_name = $${idx}`);
      values.push(firstName);
      idx++;
    }
    if (lastName !== undefined) {
      fields.push(`last_name = $${idx}`);
      values.push(lastName);
      idx++;
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx}`);
      values.push(phone);
      idx++;
    }

    if (fields.length === 0) {
      return await this.findById(userId, db);
    }

    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, 
        organization_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        role, 
        is_active, 
        updated_at;
    `;
    const res = await db.query(query, values);
    return res.rows[0];
  },
};

