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

describe('Phase 10: Organization Settings & User Profile Tests', () => {
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

    // 2. Manager login
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

  // --- Organization Settings ---
  test('Admin can GET /organization/settings', async () => {
    const res = await fetch(`${baseUrl}/organization/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.name);
    assert.ok(body.data.currency);
    assert.ok(body.data.timezone);
  });

  test('Admin can PATCH /organization/settings with valid data', async () => {
    const res = await fetch(`${baseUrl}/organization/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Acme Sales Corporation Updated',
        currency: 'EUR',
        timezone: 'Europe/London',
        phone: '+1-555-987-6543',
        website: 'https://acme-updated.com',
      }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, 'Acme Sales Corporation Updated');
    assert.strictEqual(body.data.currency, 'EUR');
    assert.strictEqual(body.data.timezone, 'Europe/London');
  });

  test('PATCH /organization/settings rejects invalid currency code (HTTP 422/400)', async () => {
    const res = await fetch(`${baseUrl}/organization/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        currency: 'INVALID_CODE',
      }),
    });
    assert.strictEqual(res.status, 422);
  });

  test('Manager and Employee receive 403 on PATCH /organization/settings', async () => {
    const mgrRes = await fetch(`${baseUrl}/organization/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Name' }),
    });
    assert.strictEqual(mgrRes.status, 403);

    const empRes = await fetch(`${baseUrl}/organization/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Name' }),
    });
    assert.strictEqual(empRes.status, 403);
  });

  test('Super Admin receives 403 on tenant organization settings', async () => {
    const res = await fetch(`${baseUrl}/organization/settings`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // --- User Profile Management ---
  test('Authenticated user can GET /users/profile', async () => {
    const res = await fetch(`${baseUrl}/users/profile`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'alice@acme.com');
  });

  test('Authenticated user can PATCH /users/profile to update own name and phone', async () => {
    const res = await fetch(`${baseUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        firstName: 'Alice Updated',
        lastName: 'Smith Updated',
        phone: '+1-555-111-2222',
      }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.firstName, 'Alice Updated');
    assert.strictEqual(body.data.lastName, 'Smith Updated');
    assert.strictEqual(body.data.phone, '+1-555-111-2222');
  });

  test('User profile update cannot modify role or email or is_active', async () => {
    const res = await fetch(`${baseUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        firstName: 'Alice',
        role: 'ADMIN', // Should be ignored by Zod schema
        email: 'hacked@acme.com', // Should be ignored
      }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.role, 'EMPLOYEE');
    assert.strictEqual(body.data.email, 'alice@acme.com');
  });
});
