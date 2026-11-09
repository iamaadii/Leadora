import { pool } from '../config/database.js';

export const refreshTokenRepository = {
  /**
   * Persists a new hashed refresh token
   * @param {object} params
   * @param {string} params.userId
   * @param {string} params.tokenHash
   * @param {Date} params.expiresAt
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<object>}
   */
  async create({ userId, tokenHash, expiresAt }, db = pool) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at;
    `;
    const res = await db.query(query, [userId, tokenHash, expiresAt]);
    return res.rows[0];
  },

  /**
   * Finds a refresh token record by its SHA-256 hash
   * @param {string} tokenHash
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<object|null>}
   */
  async findByTokenHash(tokenHash, db = pool) {
    const query = `
      SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
      FROM refresh_tokens
      WHERE token_hash = $1;
    `;
    const res = await db.query(query, [tokenHash]);
    return res.rows[0] || null;
  },

  /**
   * Revokes a specific token by its SHA-256 hash
   * @param {string} tokenHash
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<number>} Number of rows updated
   */
  async revokeByTokenHash(tokenHash, db = pool) {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1 AND revoked_at IS NULL;
    `;
    const res = await db.query(query, [tokenHash]);
    return res.rowCount;
  },

  /**
   * Revokes a specific token by primary key ID
   * @param {string} id
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<void>}
   */
  async revokeById(id, db = pool) {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1 AND revoked_at IS NULL;
    `;
    await db.query(query, [id]);
  },

  /**
   * Revokes all active refresh tokens for a user (used during reuse detection or password change)
   * @param {string} userId
   * @param {import('pg').PoolClient|import('pg').Pool} [db=pool]
   * @returns {Promise<number>} Number of active sessions revoked
   */
  async revokeAllForUser(userId, db = pool) {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL;
    `;
    const res = await db.query(query, [userId]);
    return res.rowCount;
  },
};

