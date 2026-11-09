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

describe('Feature: Interactive Public Demo Environment Tests', () => {
  let demoToken = '';
  let demoUser = null;
  let sampleLeadId = '';
  let acmeAdminToken = '';

  before(async () => {
    // Acquire regular Acme Sales admin token for regression check
    const acmeRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const acmeData = await acmeRes.json();
    acmeAdminToken = acmeData.data.accessToken;
  });

  test('1. Visitor can initialize demo session without credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/demo-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.accessToken);
    assert.strictEqual(json.data.user.role, 'DEMO');
    assert.strictEqual(json.data.user.isDemo, true);
    assert.strictEqual(json.data.user.organizationSlug, 'leadora-demo');

    demoToken = json.data.accessToken;
    demoUser = json.data.user;
  });

  test('2. Demo visitor can read leads within demo organization', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 7, 'Demo organization should have at least 7 sample leads');

    sampleLeadId = json.data[0].id;

    // Verify tenant isolation: none of the leads belong to another organization
    const orgIds = new Set(json.data.map((l) => l.organization_id));
    assert.ok(!orgIds.has('acme-sales'));
  });

  test('3. Demo visitor can read dashboard overview analytics', async () => {
    const res = await fetch(`${baseUrl}/dashboard/overview?range=30d`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.kpis);
  });

  test('4. Demo visitor can view employee directory and teams', async () => {
    // Employees
    const empRes = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.strictEqual(empRes.status, 200);
    const empJson = await empRes.json();
    assert.ok(Array.isArray(empJson.data));
    assert.ok(empJson.data.length >= 3, 'Demo should have manager, reps, and viewer');

    // Teams
    const teamRes = await fetch(`${baseUrl}/teams`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.strictEqual(teamRes.status, 200);
    const teamJson = await teamRes.json();
    assert.ok(Array.isArray(teamJson.data));
  });

  test('5. Demo visitor can read follow-ups and activities', async () => {
    // Follow-ups
    const folRes = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.strictEqual(folRes.status, 200);

    // Activities
    const actRes = await fetch(`${baseUrl}/activities`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.strictEqual(actRes.status, 200);
  });

  test('6. Demo visitor can preview reports', async () => {
    const res = await fetch(`${baseUrl}/reports/leads`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  test('7. Backend strictly blocks POST /leads in demo mode (403 DEMO_READ_ONLY)', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Demo Lead',
        email: 'attacker@evil.com',
        source: 'WEBSITE',
        status: 'NEW',
      }),
    });

    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'DEMO_READ_ONLY');
  });

  test('8. Backend strictly blocks PATCH /leads/:id in demo mode (403 DEMO_READ_ONLY)', async () => {
    const res = await fetch(`${baseUrl}/leads/${sampleLeadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        name: 'Modified Demo Lead Name',
      }),
    });

    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'DEMO_READ_ONLY');
  });

  test('9. Backend strictly blocks DELETE /leads/:id in demo mode (403 DEMO_READ_ONLY)', async () => {
    const res = await fetch(`${baseUrl}/leads/${sampleLeadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'DEMO_READ_ONLY');
  });

  test('10. Backend strictly blocks employee and team creation in demo mode', async () => {
    // Create Employee
    const empRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        firstName: 'Fake',
        lastName: 'User',
        email: 'fake@example.com',
        role: 'EMPLOYEE',
      }),
    });
    assert.strictEqual(empRes.status, 403);

    // Create Team
    const teamRes = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        name: 'Forbidden Team',
      }),
    });
    assert.strictEqual(teamRes.status, 403);
  });

  test('11. Backend strictly blocks organization settings and user profile updates in demo mode', async () => {
    // Organization settings
    const orgRes = await fetch(`${baseUrl}/organization/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        currency: 'EUR',
      }),
    });
    assert.strictEqual(orgRes.status, 403);

    // User profile
    const profRes = await fetch(`${baseUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        firstName: 'Hacked',
      }),
    });
    assert.strictEqual(profRes.status, 403);
  });

  test('12. Backend strictly blocks report data export in demo mode (403 DEMO_EXPORT_DISABLED)', async () => {
    const res = await fetch(`${baseUrl}/reports/leads/export?format=csv`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'DEMO_EXPORT_DISABLED');
  });

  test('13. Backend strictly blocks platform administration in demo mode (403 DEMO_FORBIDDEN)', async () => {
    const res = await fetch(`${baseUrl}/platform/organizations`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'DEMO_FORBIDDEN');
  });

  test('14. Regular production user permissions remain completely intact', async () => {
    // Normal Acme Admin can access their own organization settings
    const res = await fetch(`${baseUrl}/organization/settings`, {
      headers: { Authorization: `Bearer ${acmeAdminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });
});

