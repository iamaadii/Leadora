// organization.repository.js
// Phase 10: Organization Settings SQL Data Access Layer

import { pool } from '../../config/database.js';

export const organizationRepository = {
  /**
   * Get organization profile and settings by ID
   */
  async getSettings(organizationId, db = pool) {
    const query = `
      SELECT 
        id,
        name,
        slug,
        email,
        phone,
        website,
        address,
        currency,
        timezone,
        is_active,
        created_at,
        updated_at
      FROM organizations
      WHERE id = $1;
    `;
    const res = await db.query(query, [organizationId]);
    return res.rows[0] || null;
  },

  /**
   * Update organization settings fields
   */
  async updateSettings(organizationId, updateData, db = pool) {
    const allowedKeys = ['name', 'phone', 'website', 'address', 'currency', 'timezone'];
    const fieldsToSet = [];
    const values = [organizationId];
    let paramIndex = 2;

    for (const key of allowedKeys) {
      if (updateData[key] !== undefined) {
        fieldsToSet.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    }

    if (fieldsToSet.length === 0) {
      return await this.getSettings(organizationId, db);
    }

    const query = `
      UPDATE organizations
      SET ${fieldsToSet.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id,
        name,
        slug,
        email,
        phone,
        website,
        address,
        currency,
        timezone,
        is_active,
        created_at,
        updated_at;
    `;

    const res = await db.query(query, values);
    return res.rows[0] || null;
  },
};
