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

describe('Phase 10: In-App Notifications Module Tests', () => {
  let adminToken = '';
  let employeeAliceToken = '';
  let employeeBobToken = '';
  let superAdminToken = '';
  let bobUserId = '';
  let aliceUserId = '';

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

    // 2. Alice login
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
    aliceUserId = aliceData.data.user.id;

    // 3. Bob login
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
    bobUserId = bobData.data.user.id;

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

  // 1. Unauthenticated request
  test('Unauthenticated request to notifications returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/notifications`);
    assert.strictEqual(res.status, 401);
  });

  // 2. Super Admin isolation
  test('Super Admin is forbidden (HTTP 403) from tenant notifications', async () => {
    const res = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 3. Unread count
  test('GET /notifications/unread-count returns unread count number', async () => {
    const res = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${employeeAliceToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.unreadCount === 'number');
  });

  // 4. List notifications with pagination
  test('GET /notifications returns paginated list of notifications', async () => {
    const res = await fetch(`${baseUrl}/notifications?limit=10`, {
      headers: { Authorization: `Bearer ${employeeAliceToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta.limit === 10);
  });

  // 5. Creating assigned lead generates notification
  test('Creating lead assigned to Bob generates LEAD_ASSIGNED notification for Bob', async () => {
    // Admin creates lead assigned to Bob
    const createRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Notification Test Corp',
        email: 'notif@testcorp.com',
        company: 'Test Corp',
        source: 'WEBSITE',
        status: 'NEW',
        assigned_to_id: bobUserId,
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const lead = (await createRes.json()).data;

    // Check Bob's notifications
    const notifRes = await fetch(`${baseUrl}/notifications?limit=5`, {
      headers: { Authorization: `Bearer ${employeeBobToken}` },
    });
    assert.strictEqual(notifRes.status, 200);
    const notifBody = await notifRes.json();
    const assignedNotif = notifBody.data.find(
      (n) => n.notificationType === 'LEAD_ASSIGNED' && n.entityId === lead.id,
    );
    assert.ok(assignedNotif, 'Expected LEAD_ASSIGNED notification for Bob');
    assert.strictEqual(assignedNotif.isRead, false);

    // Reassign lead from Bob to Alice
    const reassignRes = await fetch(`${baseUrl}/leads/${lead.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assigned_to_id: aliceUserId,
      }),
    });
    assert.strictEqual(reassignRes.status, 200);

    // Check Alice's notifications
    const aliceNotifRes = await fetch(`${baseUrl}/notifications?limit=5`, {
      headers: { Authorization: `Bearer ${employeeAliceToken}` },
    });
    assert.strictEqual(aliceNotifRes.status, 200);
    const aliceNotifBody = await aliceNotifRes.json();
    const reassignedNotif = aliceNotifBody.data.find(
      (n) => n.notificationType === 'LEAD_REASSIGNED' && n.entityId === lead.id,
    );
    assert.ok(reassignedNotif, 'Expected LEAD_REASSIGNED notification for Alice');
  });

  // 6. Mark single notification as read
  test('PATCH /notifications/:id/read marks notification as read', async () => {
    const listRes = await fetch(`${baseUrl}/notifications?isRead=false`, {
      headers: { Authorization: `Bearer ${employeeBobToken}` },
    });
    const listBody = await listRes.json();
    if (listBody.data.length > 0) {
      const targetNotif = listBody.data[0];

      // Alice cannot mark Bob's notification as read (returns 404)
      const unauthorizedRes = await fetch(`${baseUrl}/notifications/${targetNotif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${employeeAliceToken}` },
      });
      assert.strictEqual(unauthorizedRes.status, 404);

      // Bob marks his own notification
      const readRes = await fetch(`${baseUrl}/notifications/${targetNotif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${employeeBobToken}` },
      });
      assert.strictEqual(readRes.status, 200);
      const readBody = await readRes.json();
      assert.strictEqual(readBody.data.isRead, true);
    }
  });

  // 7. Mark all notifications as read
  test('PATCH /notifications/read-all marks all unread notifications for current user', async () => {
    const res = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employeeBobToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.updatedCount === 'number');

    // Confirm unread count is now 0
    const countRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${employeeBobToken}` },
    });
    const countBody = await countRes.json();
    assert.strictEqual(countBody.data.unreadCount, 0);
  });
});
