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

describe('Phase 5: Lead Management Module Tests', () => {
  let adminToken = '';
  let employeeAliceToken = '';
  let employeeBobToken = '';
  let superAdminToken = '';
  let aliceId = '';
  let bobId = '';

  let createdLeadId = '';
  let employeeLeadId = '';

  // Setup: Authenticate users for Acme Sales Corp
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

    // 2. Employee Alice login
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

    // 3. Employee Bob login
    const bobRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bob@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const bobData = await bobRes.json();
    employeeBobToken = bobData.data.accessToken;
    bobId = bobData.data.user.id;

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

  // 1. Unauthenticated user cannot access leads
  test('1. GET /leads - unauthenticated user cannot access leads', async () => {
    const res = await fetch(`${baseUrl}/leads`);
    assert.strictEqual(res.status, 401);
  });

  // 2. Authorized user can create a lead
  test('2. POST /leads - authorized user can create a lead', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'John Connor',
        email: 'john.connor@resistance.net',
        phone: '+1-555-0199',
        company: 'Resistance Tech',
        source: 'WEBSITE',
        status: 'NEW',
        assigned_to_id: aliceId,
        description: 'Key prospect interested in security automation',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, 'John Connor');
    assert.strictEqual(body.data.assigned_to_id, aliceId);
    assert.ok(body.data.id);
    createdLeadId = body.data.id;
  });

  // 3. Invalid lead input returns validation errors
  test('3. POST /leads - invalid lead input returns validation errors', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: '', // Empty name should fail
        email: 'not-an-email',
        status: 'INVALID_STATUS',
      }),
    });

    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  // 4. User cannot create a lead in another organization
  test('4. POST /leads - organization_id in body is ignored and securely derived from user', async () => {
    const fakeOrgId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Spoof Test Lead',
        organization_id: fakeOrgId, // Should be ignored
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.notStrictEqual(body.data.organization_id, fakeOrgId);
  });

  // 5. User cannot assign a lead to an employee from another organization / invalid user
  test('5. POST /leads - cannot assign lead to nonexistent or cross-organization employee', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Assignee Lead',
        assigned_to_id: '11111111-1111-1111-1111-111111111111',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'INVALID_ASSIGNEE');
  });

  // 6. User can retrieve organization leads according to permissions
  test('6. GET /leads - Admin retrieves all leads, Employee retrieves only permitted leads', async () => {
    // Bob creates a private lead assigned to Bob
    const bobLeadRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeBobToken}`,
      },
      body: JSON.stringify({
        name: 'Bob Confidential Prospect',
        assigned_to_id: bobId,
      }),
    });
    const bobLeadBody = await bobLeadRes.json();
    employeeLeadId = bobLeadBody.data.id;

    // Alice fetches leads - should NOT see Bob's confidential lead
    const aliceGetRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${employeeAliceToken}` },
    });
    const aliceData = await aliceGetRes.json();
    assert.strictEqual(aliceGetRes.status, 200);
    const aliceLeadIds = aliceData.data.map((l) => l.id);
    assert.ok(aliceLeadIds.includes(createdLeadId)); // Assigned to Alice
    assert.ok(!aliceLeadIds.includes(employeeLeadId)); // Not assigned to Alice

    // Admin fetches leads - should see both
    const adminGetRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminGetRes.json();
    const adminLeadIds = adminData.data.map((l) => l.id);
    assert.ok(adminLeadIds.includes(createdLeadId));
    assert.ok(adminLeadIds.includes(employeeLeadId));
  });

  // 7. Pagination works correctly
  test('7. GET /leads - pagination returns correct metadata and slice', async () => {
    const res = await fetch(`${baseUrl}/leads?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.length, 1);
    assert.strictEqual(body.meta.page, 1);
    assert.strictEqual(body.meta.limit, 1);
    assert.ok(body.meta.total >= 2);
  });

  // 8. Search works correctly
  test('8. GET /leads - search filter matches by name, email, or company', async () => {
    const res = await fetch(`${baseUrl}/leads?search=Resistance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.length >= 1);
    assert.strictEqual(body.data[0].name, 'John Connor');
  });

  // 9. Status and source filters work
  test('9. GET /leads - status and source filters work', async () => {
    const res = await fetch(`${baseUrl}/leads?status=NEW&source=WEBSITE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.every((l) => l.status === 'NEW' && l.source === 'WEBSITE'));
  });

  // 10. User cannot retrieve another organization's or unauthorized lead by ID
  test('10. GET /leads/:id - returns 404 for inaccessible lead', async () => {
    // Alice tries to fetch Bob's private lead directly by ID
    const res = await fetch(`${baseUrl}/leads/${employeeLeadId}`, {
      headers: { Authorization: `Bearer ${employeeAliceToken}` },
    });

    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'LEAD_NOT_FOUND');
  });

  // 11. User can update an authorized lead
  test('11. PATCH /leads/:id - updates lead details', async () => {
    const res = await fetch(`${baseUrl}/leads/${createdLeadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'QUALIFIED',
        company: 'Resistance Systems International',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, 'QUALIFIED');
    assert.strictEqual(body.data.company, 'Resistance Systems International');
  });

  // 12. Unauthorized user cannot update restricted leads
  test('12. PATCH /leads/:id - unauthorized user cannot update restricted lead', async () => {
    const res = await fetch(`${baseUrl}/leads/${employeeLeadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeAliceToken}`,
      },
      body: JSON.stringify({
        name: 'Hacked Name',
      }),
    });

    assert.strictEqual(res.status, 404);
  });

  // 13. Lead update records an activity
  test('13. GET /leads/:id/activities - update records lead activities', async () => {
    const res = await fetch(`${baseUrl}/leads/${createdLeadId}/activities`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.length >= 2); // LEAD_CREATED and LEAD_STATUS_CHANGED / LEAD_UPDATED
    const types = body.data.map((a) => a.activity_type);
    assert.ok(types.includes('LEAD_CREATED'));
    assert.ok(types.includes('LEAD_STATUS_CHANGED'));
  });

  // 14. Archiving removes a lead from normal listings
  test('14. PATCH /leads/:id/archive - archives lead and excludes from active list', async () => {
    const archiveRes = await fetch(`${baseUrl}/leads/${createdLeadId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(archiveRes.status, 200);
    const archiveBody = await archiveRes.json();
    assert.ok(archiveBody.data.archived_at);

    // Verify it is not in default GET /leads
    const getRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getData = await getRes.json();
    const activeIds = getData.data.map((l) => l.id);
    assert.ok(!activeIds.includes(createdLeadId));

    // Verify it IS in isArchived=true
    const archivedListRes = await fetch(`${baseUrl}/leads?isArchived=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const archivedListData = await archivedListRes.json();
    const archivedIds = archivedListData.data.map((l) => l.id);
    assert.ok(archivedIds.includes(createdLeadId));
  });

  // 15. Restoring makes the lead visible again
  test('15. PATCH /leads/:id/restore - restores archived lead', async () => {
    const restoreRes = await fetch(`${baseUrl}/leads/${createdLeadId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(restoreRes.status, 200);
    const restoreBody = await restoreRes.json();
    assert.strictEqual(restoreBody.data.archived_at, null);

    // Now it should be visible again in default GET /leads
    const getRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getData = await getRes.json();
    const activeIds = getData.data.map((l) => l.id);
    assert.ok(activeIds.includes(createdLeadId));
  });

  // 16. Archiving records an activity
  test('16. GET /leads/:id/activities - archiving and restoring record activities', async () => {
    const res = await fetch(`${baseUrl}/leads/${createdLeadId}/activities`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    const types = body.data.map((a) => a.activity_type);
    assert.ok(types.includes('LEAD_ARCHIVED'));
    assert.ok(types.includes('LEAD_RESTORED'));
  });

  // 17. Failed database operations do not leave partial activity records
  test('17. Failed lead operation does not leave orphaned activity records', async () => {
    const countBeforeRes = await pool.query('SELECT COUNT(*)::int AS count FROM activities;');
    const countBefore = countBeforeRes.rows[0].count;

    // Attempting invalid lead create with invalid assignee
    const failRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Fail Lead',
        assigned_to_id: '00000000-0000-0000-0000-000000000000',
      }),
    });
    assert.strictEqual(failRes.status, 400);

    const countAfterRes = await pool.query('SELECT COUNT(*)::int AS count FROM activities;');
    const countAfter = countAfterRes.rows[0].count;
    assert.strictEqual(countBefore, countAfter);
  });

  // Bonus: Super Admin cannot directly access organization leads
  test('Bonus: Super Admin is restricted from accessing organization leads directly', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });
});
