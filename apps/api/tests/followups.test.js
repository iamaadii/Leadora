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

describe('Phase 7: Follow-ups & Task Scheduling Tests', () => {
  let adminToken = '';
  let managerToken = '';
  let aliceToken = '';
  let bobToken = '';
  let superAdminToken = '';

  let aliceId = '';
  let bobId = '';

  let leadForAdminId = '';
  let leadForAliceId = '';
  let createdFollowupId = '';
  let aliceFollowupId = '';

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
    aliceToken = aliceData.data.accessToken;
    aliceId = aliceData.data.user.id;

    // 4. Employee Bob login
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
    bobToken = bobData.data.accessToken;
    bobId = bobData.data.user.id;

    // 5. Super Admin login
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

    // Create a lead owned by Admin for testing
    const leadRes1 = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Followup Test Company 1',
        contactPerson: 'Frank Test',
        email: `frank-${Date.now()}@test.com`,
        phone: '+1 555-0199',
        status: 'NEW',
      }),
    });
    const leadData1 = await leadRes1.json();
    leadForAdminId = leadData1.data.id;

    // Create a lead assigned to Alice
    const leadRes2 = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Alice Client Lead',
        contactPerson: 'Grace Hopper',
        email: `grace-${Date.now()}@test.com`,
        phone: '+1 555-0188',
        assigned_to_id: aliceId,
        status: 'CONTACTED',
      }),
    });
    const leadData2 = await leadRes2.json();
    leadForAliceId = leadData2.data.id;
  });

  // --- 1. Authentication & Role Boundary Tests ---

  test('1. GET /followups - Unauthenticated request fails with 401', async () => {
    const res = await fetch(`${baseUrl}/followups`);
    assert.strictEqual(res.status, 401);
  });

  test('2. GET /followups - Super Admin is forbidden (403)', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('3. POST /followups - Super Admin cannot create follow-up (403)', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        leadId: leadForAdminId,
        title: 'Super Admin Followup',
        dueAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  // --- 2. Follow-up Validation & Creation ---

  test('4. POST /followups - Validation rejects missing leadId and dueAt', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Missing Fields',
      }),
    });
    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('5. POST /followups - Validation rejects invalid date format', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        leadId: leadForAdminId,
        title: 'Invalid Date Task',
        dueAt: 'not-a-valid-date-string',
      }),
    });
    assert.strictEqual(res.status, 422);
  });

  test('6. POST /followups - Admin creates follow-up assigned to Bob', async () => {
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString();
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        leadId: leadForAdminId,
        title: 'Initial Discovery Call',
        description: 'Discuss enterprise pricing and timeline',
        type: 'CALL',
        priority: 'HIGH',
        dueAt: futureDate,
        assignedToId: bobId,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.title, 'Initial Discovery Call');
    assert.strictEqual(body.data.type, 'CALL');
    assert.strictEqual(body.data.priority, 'HIGH');
    assert.strictEqual(body.data.status, 'PENDING');
    assert.strictEqual(body.data.assigned_to_id, bobId);

    createdFollowupId = body.data.id;
  });

  test('7. POST /followups - Employee Alice can schedule follow-up for her lead assigned to herself', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        leadId: leadForAliceId,
        title: 'Product Walkthrough Meeting',
        type: 'MEETING',
        priority: 'MEDIUM',
        dueAt: futureDate,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.assigned_to_id, aliceId);
    aliceFollowupId = body.data.id;
  });

  test('8. POST /followups - Employee Alice cannot assign follow-up to Bob (403)', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const res = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        leadId: leadForAliceId,
        title: 'Unauthorized Assignment',
        type: 'EMAIL',
        dueAt: futureDate,
        assignedToId: bobId,
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  // --- 3. Scoped Listing and Filtering ---

  test('9. GET /followups - Admin lists all follow-ups with pagination & filters', async () => {
    const res = await fetch(`${baseUrl}/followups?type=CALL&priority=HIGH`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    assert.ok(body.data.some((f) => f.id === createdFollowupId));
  });

  test('10. GET /followups - Employee Alice sees only her follow-up, not Bob’s', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    // All returned follow-ups for Alice must be assigned to Alice
    assert.ok(body.data.every((f) => f.assigned_to_id === aliceId));
    // Must NOT contain the one assigned to Bob
    assert.ok(!body.data.some((f) => f.id === createdFollowupId));
  });

  test('11. GET /followups/:id - Employee Alice cannot access Bob’s follow-up (404)', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.strictEqual(res.status, 404);
  });

  test('12. GET /followups/:id - Admin can view Bob’s follow-up details', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.id, createdFollowupId);
    assert.strictEqual(body.data.lead_name, 'Followup Test Company 1');
  });

  // --- 4. Update, Rescheduling, and Reassignment ---

  test('13. PATCH /followups/:id - Admin updates title and priority', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Discovery Call - Tech Architecture',
        priority: 'MEDIUM',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.title, 'Updated Discovery Call - Tech Architecture');
    assert.strictEqual(body.data.priority, 'MEDIUM');
  });

  test('14. PATCH /followups/:id - Admin reschedules due date', async () => {
    const newDueDate = new Date(Date.now() + 5 * 86400000).toISOString();
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        dueAt: newDueDate,
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(new Date(body.data.due_at).toISOString(), newDueDate);
  });

  test('15. PATCH /followups/:id - Employee Alice cannot reassign her follow-up (403)', async () => {
    const res = await fetch(`${baseUrl}/followups/${aliceFollowupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        assignedToId: bobId,
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  test('16. PATCH /followups/:id - Admin reassigns Bob’s task to Alice', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assignedToId: aliceId,
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.assigned_to_id, aliceId);
  });

  // --- 5. Lifecycle Completion & Cancellation ---

  test('17. PATCH /followups/:id/complete - Alice marks reassigned task as COMPLETED', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        completionNotes: 'Discovery call went exceptionally well. Client agreed to receive proposal.',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, 'COMPLETED');
    assert.strictEqual(body.data.completed_by_id, aliceId);
    assert.strictEqual(
      body.data.completion_notes,
      'Discovery call went exceptionally well. Client agreed to receive proposal.',
    );
    assert.ok(body.data.completed_at);
  });

  test('18. PATCH /followups/:id/complete - Cannot complete already completed task (400)', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        completionNotes: 'Trying to complete again',
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  test('19. PATCH /followups/:id/cancel - Cannot cancel already completed task (400)', async () => {
    const res = await fetch(`${baseUrl}/followups/${createdFollowupId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 400);
  });

  test('20. PATCH /followups/:id/cancel - Alice cancels her pending task', async () => {
    const res = await fetch(`${baseUrl}/followups/${aliceFollowupId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${aliceToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, 'CANCELLED');
  });

  test('21. PATCH /followups/:id - Cannot update cancelled task (400)', async () => {
    const res = await fetch(`${baseUrl}/followups/${aliceFollowupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Try to edit cancelled task',
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  // --- 6. Summary Metrics & Lead History ---

  test('22. GET /followups/summary - Returns aggregated KPI metrics', async () => {
    const res = await fetch(`${baseUrl}/followups/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.total === 'number');
    assert.ok(typeof body.data.pending === 'number');
    assert.ok(typeof body.data.overdue === 'number');
    assert.ok(typeof body.data.due_today === 'number');
    assert.ok(typeof body.data.completed === 'number');
    assert.ok(typeof body.data.cancelled === 'number');
  });

  test('23. GET /leads/:id/followups - Returns follow-ups for a specific lead', async () => {
    const res = await fetch(`${baseUrl}/leads/${leadForAdminId}/followups`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some((f) => f.id === createdFollowupId));
  });

  test('24. GET /leads/:id/activities - Activity logs follow-up lifecycle events', async () => {
    const res = await fetch(`${baseUrl}/leads/${leadForAdminId}/activities`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    const types = body.data.map((a) => a.activity_type);
    assert.ok(types.includes('FOLLOWUP_CREATED'));
    assert.ok(types.includes('FOLLOWUP_COMPLETED'));
  });
});
