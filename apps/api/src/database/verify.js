import { pool } from '../config/database.js';

async function runVerification() {
  console.log('🧪 Starting Phase 2 Database Architecture Verification...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  const client = await pool.connect();

  try {
    // ------------------------------------------------------------------------
    // Check 1: Verify tables exist
    // ------------------------------------------------------------------------
    console.log('--- 1. Table Existence Checks ---');
    const expectedTables = [
      'schema_migrations',
      'organizations',
      'users',
      'leads',
      'followups',
      'activities',
      'notifications',
      'refresh_tokens',
      'audit_logs',
    ];

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    const existingTables = new Set(tablesRes.rows.map((r) => r.table_name));

    for (const table of expectedTables) {
      assert(existingTables.has(table), `Table "${table}" exists`);
    }

    // ------------------------------------------------------------------------
    // Check 2: Verify sample records exist
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Record Count Checks ---');
    const orgCount = await client.query('SELECT COUNT(*) FROM organizations;');
    assert(parseInt(orgCount.rows[0].count, 10) >= 1, 'Organizations count >= 1');

    const userCount = await client.query('SELECT COUNT(*) FROM users;');
    assert(parseInt(userCount.rows[0].count, 10) >= 5, 'Users count >= 5 (SuperAdmin, Admin, Manager, 2 Employees)');

    const leadCount = await client.query('SELECT COUNT(*) FROM leads;');
    assert(parseInt(leadCount.rows[0].count, 10) >= 10, 'Leads count >= 10');

    const followupCount = await client.query('SELECT COUNT(*) FROM followups;');
    assert(parseInt(followupCount.rows[0].count, 10) >= 6, 'Follow-ups count >= 6');

    const activityCount = await client.query('SELECT COUNT(*) FROM activities;');
    assert(parseInt(activityCount.rows[0].count, 10) >= 5, 'Activities count >= 5');

    const notifCount = await client.query('SELECT COUNT(*) FROM notifications;');
    assert(parseInt(notifCount.rows[0].count, 10) >= 3, 'Notifications count >= 3');

    // ------------------------------------------------------------------------
    // Check 3: Check constraints enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Check Constraints Enforcement ---');

    // Test invalid role
    try {
      await client.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES ('Test', 'User', 'invalid_role@test.com', 'hash', 'INVALID_ROLE');
      `);
      assert(false, 'Invalid role rejection');
    } catch (err) {
      assert(err.code === '23514', 'Invalid role rejected by check constraint (chk_user_role)');
    }

    // Test invalid lead status
    try {
      const org = (await client.query('SELECT id FROM organizations LIMIT 1;')).rows[0];
      await client.query(`
        INSERT INTO leads (organization_id, name, status)
        VALUES ($1, 'Test Lead', 'INVALID_STATUS');
      `, [org.id]);
      assert(false, 'Invalid lead status rejection');
    } catch (err) {
      assert(err.code === '23514', 'Invalid lead status rejected by check constraint (chk_lead_status)');
    }

    // Test Super Admin MUST have NULL organization_id
    try {
      const org = (await client.query('SELECT id FROM organizations LIMIT 1;')).rows[0];
      await client.query(`
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
        VALUES ($1, 'Bad', 'SuperAdmin', 'badsuper@test.com', 'hash', 'SUPER_ADMIN');
      `, [org.id]);
      assert(false, 'Super Admin with organization_id rejection');
    } catch (err) {
      assert(err.code === '23514', 'Super Admin with organization_id rejected (chk_user_org_super_admin)');
    }

    // Test non-Super Admin MUST have an organization_id
    try {
      await client.query(`
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
        VALUES (NULL, 'No', 'Org', 'noorg@test.com', 'hash', 'EMPLOYEE');
      `);
      assert(false, 'Employee without organization_id rejection');
    } catch (err) {
      assert(err.code === '23514', 'Employee without organization_id rejected (chk_user_org_super_admin)');
    }

    // ------------------------------------------------------------------------
    // Check 4: Unique constraints enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Unique Constraints Enforcement ---');

    // Test duplicate organization slug
    try {
      await client.query(`
        INSERT INTO organizations (name, slug)
        VALUES ('Duplicate Acme', 'acme-sales');
      `);
      assert(false, 'Duplicate organization slug rejection');
    } catch (err) {
      assert(err.code === '23505', 'Duplicate organization slug rejected (uq_organizations_slug)');
    }

    // Test duplicate user email within same organization
    try {
      const org = (await client.query('SELECT id FROM organizations WHERE slug = $1;', ['acme-sales'])).rows[0];
      await client.query(`
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
        VALUES ($1, 'Duplicate', 'Admin', 'admin@acme.com', 'hash', 'ADMIN');
      `, [org.id]);
      assert(false, 'Duplicate user email rejection');
    } catch (err) {
      assert(err.code === '23505', 'Duplicate user email rejected (uq_users_org_email)');
    }

    // ------------------------------------------------------------------------
    // Check 5: Cross-Organization Assignment Restrictions (Multi-tenant Foreign Keys)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Cross-Organization Isolation & Composite Foreign Keys ---');

    // Create a temporary second organization
    const org2Res = await client.query(`
      INSERT INTO organizations (name, slug)
      VALUES ('Second Tenant Inc', 'second-tenant')
      RETURNING id;
    `);
    const org2Id = org2Res.rows[0].id;

    // Create a user in Organization 2
    const user2Res = await client.query(`
      INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
      VALUES ($1, 'User', 'Two', 'user2@secondtenant.com', 'hash', 'EMPLOYEE')
      RETURNING id;
    `, [org2Id]);
    const user2Id = user2Res.rows[0].id;

    // Attempt to assign a lead belonging to Org 1 (Acme) to User 2 (from Org 2)
    const org1 = (await client.query('SELECT id FROM organizations WHERE slug = $1;', ['acme-sales'])).rows[0];
    try {
      await client.query(`
        INSERT INTO leads (organization_id, name, assigned_to_id)
        VALUES ($1, 'Cross-Org Leak Attempt', $2);
      `, [org1.id, user2Id]);
      assert(false, 'Cross-organization user assignment should be blocked by composite foreign key');
    } catch (err) {
      assert(
        err.code === '23503',
        'Cross-organization user assignment BLOCKED by composite foreign key (fk_leads_assigned_user)',
      );
    }

    // Attempt to create a follow-up for Org 1 lead with Org 2 ID in followups table
    const lead1 = (await client.query('SELECT id FROM leads WHERE organization_id = $1 LIMIT 1;', [org1.id])).rows[0];
    try {
      await client.query(`
        INSERT INTO followups (organization_id, lead_id, assigned_to_id, title, due_at, created_by_id)
        VALUES ($1, $2, $3, 'Illegal Cross Followup', NOW(), $3);
      `, [org2Id, lead1.id, user2Id]);
      assert(false, 'Cross-organization follow-up on another tenant lead should be blocked');
    } catch (err) {
      assert(
        err.code === '23503',
        'Cross-organization follow-up BLOCKED by composite foreign key (fk_followups_lead)',
      );
    }

    // Clean up temporary Organization 2 (cascades to user 2)
    await client.query('DELETE FROM organizations WHERE id = $1;', [org2Id]);
    assert(true, 'Cleaned up temporary tenant organization');

    // ------------------------------------------------------------------------
    // Check 6: Verify Indexes
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Index Existence Checks ---');
    const indexRes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `);
    const existingIndexes = new Set(indexRes.rows.map((r) => r.indexname));

    const expectedIndexes = [
      'idx_organizations_slug',
      'idx_users_org_id',
      'idx_users_org_role',
      'idx_leads_org_status',
      'idx_leads_org_assigned',
      'idx_followups_org_due_at',
      'idx_followups_pending_due',
      'idx_activities_lead_created',
      'idx_notifications_user_read',
      'idx_refresh_tokens_user_id',
      'idx_audit_logs_org_created',
    ];

    for (const idx of expectedIndexes) {
      assert(existingIndexes.has(idx), `Index "${idx}" exists`);
    }

    // ------------------------------------------------------------------------
    // Check 7: Database Health Query (SELECT 1 & Server Time)
    // ------------------------------------------------------------------------
    console.log('\n--- 7. Health Query Verification ---');
    const healthRes = await client.query('SELECT 1 AS alive, NOW() AS server_time, current_database() AS database_name;');
    assert(
      healthRes.rows[0].alive === 1 && healthRes.rows[0].database_name === 'business_crm',
      'Database health query executes cleanly',
    );

    console.log(`\n=========================================`);
    console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error during verification:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runVerification();

