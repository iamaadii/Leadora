import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

/**
 * Ensures the schema_migrations tracking table exists.
 */
async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
}

/**
 * Runs all pending SQL migrations in ascending alphabetical order.
 */
export async function runMigrations() {
  console.log('🔄 Checking database migrations...');

  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);

    // Fetch applied migrations
    const res = await client.query('SELECT name FROM schema_migrations ORDER BY id ASC;');
    const appliedMigrations = new Set(res.rows.map((row) => row.name));

    // Read migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const pendingFiles = files.filter((file) => !appliedMigrations.has(file));

    if (pendingFiles.length === 0) {
      console.log('✅ All migrations are up to date. (0 pending)');
      return;
    }

    console.log(`📦 Found ${pendingFiles.length} pending migration(s):`);
    pendingFiles.forEach((file) => console.log(`   - ${file}`));

    // Execute each migration within a dedicated transaction
    for (const file of pendingFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`\n⏳ Applying migration: ${file}...`);

      await withTransaction(async (txClient) => {
        // Execute migration SQL
        await txClient.query(sql);

        // Record successful execution
        await txClient.query(
          'INSERT INTO schema_migrations (name, applied_at) VALUES ($1, NOW());',
          [file],
        );
      });

      console.log(`✅ Applied: ${file}`);
    }

    console.log('\n🎉 All database migrations applied successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct CLI execution: node src/database/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error running migrations:', err);
      await pool.end();
      process.exit(1);
    });
}

