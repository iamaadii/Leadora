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

describe('Phase 10: Platform Super Admin Organization Management Tests', () => {
  let superAdminToken = '';
  let tenantAdminToken = '';
  let newOrgId = '';
  const testSlug = `test-org-${Date.now()}`;

  before(async () => {
    // 1. Super Admin login
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

    // 2. Tenant Admin login
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
    tenantAdminToken = adminData.data.accessToken;
  });

  test('Super Admin can list all platform organizations', async () => {
    const res = await fetch(`${baseUrl}/platform/organizations`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta.total >= 1);
  });

  test('Super Admin can provision a new tenant organization with initial Admin', async () => {
    const res = await fetch(`${baseUrl}/platform/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        name: 'Apex Innovations',
        slug: testSlug,
        adminFirstName: 'Sarah',
        adminLastName: 'Connor',
        adminEmail: 'sarah@apex.com',
        adminPassword: 'Password123!',
        currency: 'USD',
        timezone: 'America/New_York',
      }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.organization.name, 'Apex Innovations');
    assert.strictEqual(body.data.organization.slug, testSlug);
    assert.strictEqual(body.data.initialAdmin.email, 'sarah@apex.com');
    newOrgId = body.data.organization.id;

    // Verify initial Admin can log in
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@apex.com',
        password: 'Password123!',
        organizationSlug: testSlug,
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.data.user.role, 'ADMIN');
  });

  test('Provisioning organization with existing slug returns HTTP 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/platform/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Apex',
        slug: testSlug,
        adminFirstName: 'John',
        adminLastName: 'Doe',
        adminEmail: 'john@apex.com',
        adminPassword: 'Password123!',
      }),
    });
    assert.strictEqual(res.status, 409);
  });

  test('Super Admin can suspend organization and verify login is blocked', async () => {
    const suspendRes = await fetch(`${baseUrl}/platform/organizations/${newOrgId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    assert.strictEqual(suspendRes.status, 200);
    const body = await suspendRes.json();
    assert.strictEqual(body.data.is_active, false);

    // Attempt login with suspended org Admin (must fail with 401 ORGANIZATION_INACTIVE)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@apex.com',
        password: 'Password123!',
        organizationSlug: testSlug,
      }),
    });
    assert.strictEqual(loginRes.status, 401);
    const errBody = await loginRes.json();
    assert.strictEqual(errBody.error.code, 'ORGANIZATION_INACTIVE');
  });

  test('Super Admin can reactivate suspended organization and login works again', async () => {
    const reactivateRes = await fetch(`${baseUrl}/platform/organizations/${newOrgId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ isActive: true }),
    });
    assert.strictEqual(reactivateRes.status, 200);

    // Login succeeds now
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@apex.com',
        password: 'Password123!',
        organizationSlug: testSlug,
      }),
    });
    assert.strictEqual(loginRes.status, 200);
  });

  test('Tenant Admin receives 403 Forbidden on platform endpoints', async () => {
    const res = await fetch(`${baseUrl}/platform/organizations`, {
      headers: { Authorization: `Bearer ${tenantAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });
});
