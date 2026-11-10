import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const poolConfig = {
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

if (env.DATABASE_SSL) {
  poolConfig.ssl = {
    rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED,
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error on idle client:', err.message);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} [params] - Query arguments
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.NODE_ENV === 'development') {
    console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').trim());
  }

  return res;
}

/**
 * Execute multiple database operations within a single SQL transaction
 * @param {function(pg.PoolClient): Promise<any>} callback
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Failed to rollback transaction:', rollbackErr.message);
    }
    throw err;
  } finally {
    client.release();
  }
}

