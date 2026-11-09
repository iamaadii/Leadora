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

describe('Phase 6: Team Management & Manager Boundary Tests', () => {
  let adminToken = '';
  let managerToken = '';
  let employeeAliceToken = '';
  let superAdminToken = '';

  let managerId = '';
  let aliceId = '';
  let bobId = '';

  let teamAId = '';
  let teamBId = '';
  let leadInTeamBId = '';

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
    managerId = managerData.data.user.id;

    // 3. Employee Alice login
    const aliceRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const aliceData = await aliceRes.json();
    employeeAliceToken = aliceData.data.accessToken;
    aliceId = aliceData.data.user.id;

    // 4. Super Admin login
    const saRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@platform.com',
        password: 'Password123!',
      }),
    });
    const saData = await saRes.json();
    superAdminToken = saData.data.accessToken;

    // 5. Look up Bob (another employee in Acme)
    const empListRes = await fetch(`${baseUrl}/employees?search=Bob`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const empListData = await empListRes.json();
    if (empListData.data && empListData.data.length > 0) {
      bobId = empListData.data[0].id;
    }
  });

  // Section 1: RBAC on Teams
  test('Super Admin cannot access teams (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/teams`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('Employee cannot create or manage teams (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeAliceToken}`,
      },
      body: JSON.stringify({ name: 'Unauthorized Team' }),
    });
    assert.strictEqual(res.status, 403);
  });

  // Section 2: Admin Team Creation and Validation
  test('Admin can create a new team assigned to Manager', async () => {
    const teamName = `Team Alpha ${Date.now()}`;
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: teamName,
        description: 'Primary outbound sales team',
        managerId: managerId,
      }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, teamName);
    assert.strictEqual(body.data.manager_id, managerId);
    teamAId = body.data.id;
  });

  test('Admin cannot create team with non-manager user as manager (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Invalid Manager Team ${Date.now()}`,
        managerId: aliceId, // Alice is role EMPLOYEE
      }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('must be an active user with role MANAGER'));
  });

  // Section 3: Team Membership & Single Active Team Invariant
  test('Admin can add employee to team', async () => {
    // Create fresh employee for isolated test
    const freshEmpRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'Charlie',
        lastName: 'Sales',
        email: `charlie_${Date.now()}@acme.com`,
        role: 'EMPLOYEE',
        temporaryPassword: 'Password123!',
      }),
    });
    const freshEmp = await freshEmpRes.json();
    const employeeToAddId = freshEmp.data.id;

    const res = await fetch(`${baseUrl}/teams/${teamAId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ employeeId: employeeToAddId }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.employee_id, employeeToAddId);

    // Now create Team B and verify employee CANNOT be in both active teams
    const teamBRes = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Team Beta ${Date.now()}`,
      }),
    });
    const teamBData = await teamBRes.json();
    teamBId = teamBData.data.id;

    const dupMemberRes = await fetch(`${baseUrl}/teams/${teamBId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ employeeId: employeeToAddId }),
    });
    assert.strictEqual(dupMemberRes.status, 409); // Conflict: already in team
  });

  // Section 4: Manager Scoped Views and Boundaries
  test('Manager sees only teams they manage', async () => {
    const res = await fetch(`${baseUrl}/teams`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    // Every returned team must have manager_id equal to managerId
    for (const team of body.data) {
      assert.strictEqual(team.manager_id, managerId);
    }
  });

  test('Manager cannot view or access another unassigned/other team (HTTP 403)', async () => {
    // teamB has manager_id = null (not Marcus)
    const res = await fetch(`${baseUrl}/teams/${teamBId}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('Manager can view team roster and workload for their team', async () => {
    const rosterRes = await fetch(`${baseUrl}/teams/${teamAId}/roster`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(rosterRes.status, 200);
    const roster = await rosterRes.json();
    assert.strictEqual(roster.success, true);
    assert.ok(Array.isArray(roster.data.members));

    const workloadRes = await fetch(`${baseUrl}/teams/${teamAId}/workload`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(workloadRes.status, 200);
    const workload = await workloadRes.json();
    assert.strictEqual(workload.success, true);
    assert.ok(workload.data.summary);
    assert.strictEqual(typeof workload.data.summary.totalLeads, 'number');
  });

  // Section 5: Manager Team Scoping on Lead Assignment
  test('Manager CANNOT assign lead to an employee outside their team (HTTP 403)', async () => {
    // Create an employee in another team or unassigned
    const otherEmpRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'External',
        lastName: 'Worker',
        email: `ext_${Date.now()}@acme.com`,
        role: 'EMPLOYEE',
        temporaryPassword: 'Password123!',
      }),
    });
    const otherEmp = await otherEmpRes.json();
    const otherEmpId = otherEmp.data.id;

    // Manager attempts to create lead assigned to otherEmpId
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        name: 'Manager Rogue Assignment Lead',
        email: `rogue_${Date.now()}@prospect.com`,
        assigned_to_id: otherEmpId,
      }),
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('Managers can only assign leads to members of their managed teams'));
  });

  // Section 6: Team Deactivation
  test('Admin can deactivate a team', async () => {
    const res = await fetch(`${baseUrl}/teams/${teamBId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.is_active, false);
  });
});
