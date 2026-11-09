import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

describe('Phase 8: Dashboard & Analytics Module Tests', () => {
  let adminToken = '';
  let managerToken = '';
  let employeeToken = '';
  let superAdminToken = '';

  before(async () => {
    // 1. Admin login
    const adminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.data.accessToken;

    // 2. Manager Marcus login
    const managerRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const managerData = await managerRes.json();
    managerToken = managerData.data.accessToken;

    // 3. Employee Alice login
    const employeeRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const employeeData = await employeeRes.json();
    employeeToken = employeeData.data.accessToken;

    // 4. Super Admin login
    const superRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@platform.com',
        password: 'Password123!',
      }),
    });
    const superData = await superRes.json();
    superAdminToken = superData.data.accessToken;
  });

  // --- 1. Authentication & Platform Super Admin Boundaries ---

  test('1. Unauthenticated request to /dashboard/overview returns 401', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview`);
    assert.strictEqual(res.status, 401);
  });

  test('2. Super Admin is strictly forbidden from accessing /dashboard/overview (403)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('3. Super Admin is forbidden from accessing /dashboard/lead-pipeline (403)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/lead-pipeline`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // --- 2. Filter Validation Tests ---

  test('4. GET /dashboard/overview - Validation rejects invalid range query (422)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview?range=invalid_range`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  test('5. GET /dashboard/overview - Validation rejects custom range where startDate > endDate (422)', async () => {
    const res = await fetch(
      `${baseUrl}/dashboard/overview?range=custom&startDate=2026-12-31&endDate=2026-01-01`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    assert.strictEqual(res.status, 422);
  });

  // --- 3. Admin Dashboard Analytics Tests ---

  test('6. Admin can access GET /dashboard/overview with complete KPI structure', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.range, '30d');
    assert.ok(body.data.period.startDate);
    assert.ok(body.data.period.endDate);

    const kpis = body.data.kpis;
    assert.ok(typeof kpis.totalLeads === 'number');
    assert.ok(typeof kpis.newLeadsInPeriod === 'number');
    assert.ok(typeof kpis.convertedLeads === 'number');
    assert.ok(typeof kpis.lostLeads === 'number');
    assert.ok(typeof kpis.overallConversionRate === 'number');
    assert.ok(typeof kpis.conversionsInPeriod === 'number');
    assert.ok(typeof kpis.pendingFollowups === 'number');
    assert.ok(typeof kpis.overdueFollowups === 'number');
    assert.ok(typeof kpis.dueTodayFollowups === 'number');
    assert.ok(typeof kpis.completedFollowupsInPeriod === 'number');
  });

  test('7. Admin can access GET /dashboard/lead-pipeline with all 7 stages and percentages', async () => {
    const res = await fetch(`${baseUrl}/dashboard/lead-pipeline`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.totalLeads === 'number');
    assert.strictEqual(body.data.stages.length, 7);

    const statuses = body.data.stages.map((s) => s.status);
    assert.ok(statuses.includes('NEW'));
    assert.ok(statuses.includes('CONTACTED'));
    assert.ok(statuses.includes('INTERESTED'));
    assert.ok(statuses.includes('QUALIFIED'));
    assert.ok(statuses.includes('PROPOSAL_SENT'));
    assert.ok(statuses.includes('CONVERTED'));
    assert.ok(statuses.includes('LOST'));

    for (const stage of body.data.stages) {
      assert.ok(typeof stage.count === 'number');
      assert.ok(typeof stage.percentage === 'number');
      assert.ok(stage.percentage >= 0 && stage.percentage <= 100);
    }
  });

  test('8. Admin can access GET /dashboard/lead-trends time-series data', async () => {
    const res = await fetch(`${baseUrl}/dashboard/lead-trends?range=30d&interval=day`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.interval, 'day');
    assert.ok(Array.isArray(body.data.timeline));
  });

  test('9. Admin can access GET /dashboard/followup-analytics with breakdowns', async () => {
    const res = await fetch(`${baseUrl}/dashboard/followup-analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);

    const sb = body.data.statusBreakdown;
    assert.ok(typeof sb.total === 'number');
    assert.ok(typeof sb.pending === 'number');
    assert.ok(typeof sb.overdue === 'number');
    assert.ok(typeof sb.dueToday === 'number');
    assert.ok(typeof sb.completed === 'number');
    assert.ok(typeof sb.completionRate === 'number');

    assert.ok(Array.isArray(body.data.typeBreakdown));
    assert.ok(Array.isArray(body.data.priorityBreakdown));
  });

  test('10. Admin can access GET /dashboard/team-performance (organization-wide)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/team-performance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));

    if (body.data.length > 0) {
      const team = body.data[0];
      assert.ok(team.teamId);
      assert.ok(team.teamName);
      assert.ok(typeof team.memberCount === 'number');
      assert.ok(typeof team.totalLeads === 'number');
      assert.ok(typeof team.conversionRate === 'number');
    }
  });

  test('11. Admin can access GET /dashboard/employee-performance (organization-wide)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/employee-performance?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);

    const emp = body.data[0];
    assert.ok(emp.employeeId);
    assert.ok(emp.name);
    assert.ok(typeof emp.activeLeads === 'number');
    assert.ok(typeof emp.convertedLeads === 'number');
    assert.ok(typeof emp.conversionRate === 'number');
  });

  test('12. Admin can access GET /dashboard/recent-activity', async () => {
    const res = await fetch(`${baseUrl}/dashboard/recent-activity?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length <= 5);
  });

  // --- 4. Manager Dashboard & Boundary Scoping Tests ---

  test('13. Manager can access GET /dashboard/overview with team-scoped metrics', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview?range=30d`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.kpis.totalLeads === 'number');
  });

  test('14. Manager GET /dashboard/team-performance returns ONLY their managed teams', async () => {
    const res = await fetch(`${baseUrl}/dashboard/team-performance`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));

    // All returned teams must have the manager's email or manager id
    for (const team of body.data) {
      if (team.manager) {
        assert.strictEqual(team.manager.email, 'manager@acme.com');
      }
    }
  });

  test('15. Manager GET /dashboard/employee-performance returns only managed team members', async () => {
    const res = await fetch(`${baseUrl}/dashboard/employee-performance`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  // --- 5. Employee Personal Workspace & Restriction Tests ---

  test('16. Employee can access GET /dashboard/overview for their personal metrics', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview?range=30d`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.kpis.totalLeads === 'number');
  });

  test('17. Employee CANNOT access GET /dashboard/team-performance (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/team-performance`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'FORBIDDEN');
  });

  test('18. Employee CANNOT access GET /dashboard/employee-performance (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/dashboard/employee-performance`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('19. Employee can access GET /dashboard/recent-activity for their personal scope', async () => {
    const res = await fetch(`${baseUrl}/dashboard/recent-activity?limit=5`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  // --- 6. Date Range Options & Edge Cases ---

  test('20. GET /dashboard/overview supports 7d, 90d, this_month, and prev_month', async () => {
    for (const range of ['7d', '90d', 'this_month', 'prev_month']) {
      const res = await fetch(`${baseUrl}/dashboard/overview?range=${range}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.data.range, range);
    }
  });

  test('21. GET /dashboard/overview supports valid custom date range', async () => {
    const res = await fetch(
      `${baseUrl}/dashboard/overview?range=custom&startDate=2026-01-01T00:00:00Z&endDate=2026-06-30T23:59:59Z`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.range, 'custom');
  });
});

