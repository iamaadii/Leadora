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

describe('Phase 3: Authentication & Session Tests', () => {
  let tenantCookie = '';
  let superAdminCookie = '';
  let tenantAccessToken = '';
  let superAdminAccessToken = '';
  let managerAccessToken = '';
  let employeeAccessToken = '';

  // --------------------------------------------------------------------------
  // 1. Login Tests
  // --------------------------------------------------------------------------
  test('POST /auth/login - should log in tenant admin successfully', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.email, 'admin@acme.com');
    assert.strictEqual(body.data.user.role, 'ADMIN');
    assert.ok(body.data.accessToken);

    tenantAccessToken = body.data.accessToken;

    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader && cookieHeader.includes('refreshToken='));
    tenantCookie = cookieHeader.split(';')[0];
  });

  test('POST /auth/login - should log in platform Super Admin without organization slug', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@platform.com',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.role, 'SUPER_ADMIN');
    assert.strictEqual(body.data.user.organizationId, null);
    assert.ok(body.data.accessToken);

    superAdminAccessToken = body.data.accessToken;
    superAdminCookie = res.headers.get('set-cookie').split(';')[0];
  });

  test('POST /auth/login - should log in manager and employee for role testing', async () => {
    const mgrRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const mgrBody = await mgrRes.json();
    managerAccessToken = mgrBody.data.accessToken;

    const empRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bob@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const empBody = await empRes.json();
    employeeAccessToken = empBody.data.accessToken;

    assert.ok(managerAccessToken);
    assert.ok(employeeAccessToken);
  });

  test('POST /auth/login - should reject invalid password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.com',
        password: 'WrongPassword!',
        organizationSlug: 'acme-sales',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_CREDENTIALS');
  });

  test('POST /auth/login - should reject unknown email', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_CREDENTIALS');
  });

  test('POST /auth/login - should reject invalid validation schema (missing fields)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
      }),
    });

    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  // --------------------------------------------------------------------------
  // 2. Current User (GET /auth/me) Tests
  // --------------------------------------------------------------------------
  test('GET /auth/me - should return authenticated user profile', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tenantAccessToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.email, 'admin@acme.com');
    assert.strictEqual(body.data.user.organizationSlug, 'acme-sales');
    assert.strictEqual(body.data.user.password_hash, undefined);
  });

  test('GET /auth/me - should reject request without token', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'TOKEN_MISSING');
  });

  test('GET /auth/me - should reject invalid JWT token', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'TOKEN_INVALID');
  });

  // --------------------------------------------------------------------------
  // 3. Role-Based Authorization Tests
  // --------------------------------------------------------------------------
  test('RBAC - Admin should access /auth/test-admin', async () => {
    const res = await fetch(`${baseUrl}/auth/test-admin`, {
      headers: { Authorization: `Bearer ${tenantAccessToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  test('RBAC - Super Admin should access /auth/test-admin', async () => {
    const res = await fetch(`${baseUrl}/auth/test-admin`, {
      headers: { Authorization: `Bearer ${superAdminAccessToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  test('RBAC - Employee should be FORBIDDEN (403) from /auth/test-admin', async () => {
    const res = await fetch(`${baseUrl}/auth/test-admin`, {
      headers: { Authorization: `Bearer ${employeeAccessToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'FORBIDDEN');
  });

  test('RBAC - Manager should access /auth/test-manager but be FORBIDDEN from /auth/test-admin', async () => {
    const okRes = await fetch(`${baseUrl}/auth/test-manager`, {
      headers: { Authorization: `Bearer ${managerAccessToken}` },
    });
    assert.strictEqual(okRes.status, 200);

    const forbiddenRes = await fetch(`${baseUrl}/auth/test-admin`, {
      headers: { Authorization: `Bearer ${managerAccessToken}` },
    });
    assert.strictEqual(forbiddenRes.status, 403);
    const forbiddenBody = await forbiddenRes.json();
    assert.strictEqual(forbiddenBody.error.code, 'FORBIDDEN');
  });

  // --------------------------------------------------------------------------
  // 4. Refresh Session & Token Rotation Tests
  // --------------------------------------------------------------------------
  let rotatedCookie = '';

  test('POST /auth/refresh - should rotate refresh token and issue new access token', async () => {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: tenantCookie },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);

    const newCookieHeader = res.headers.get('set-cookie');
    assert.ok(newCookieHeader && newCookieHeader.includes('refreshToken='));
    rotatedCookie = newCookieHeader.split(';')[0];
    assert.notStrictEqual(rotatedCookie, tenantCookie);
  });

  test('POST /auth/refresh - REUSE DETECTION: presenting old token should revoke all sessions', async () => {
    // Presenting tenantCookie, which was already rotated in the previous test!
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: tenantCookie },
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'REFRESH_TOKEN_REUSED');
  });

  // --------------------------------------------------------------------------
  // 5. Change Password Tests
  // --------------------------------------------------------------------------
  test('POST /auth/change-password - should verify current password and reject if wrong', async () => {
    const res = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerAccessToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'WrongPassword123!',
        newPassword: 'BrandNewPassword2026!',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'INVALID_CURRENT_PASSWORD');
  });

  // --------------------------------------------------------------------------
  // 6. Logout Tests
  // --------------------------------------------------------------------------
  test('POST /auth/logout - should revoke refresh token and clear cookie', async () => {
    // Log in fresh user
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@acme.com',
        password: 'Password123!',
        organizationSlug: 'acme-sales',
      }),
    });
    const freshCookie = loginRes.headers.get('set-cookie').split(';')[0];

    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: freshCookie },
    });

    assert.strictEqual(logoutRes.status, 200);
    const body = await logoutRes.json();
    assert.strictEqual(body.success, true);

    // After logout, attempting to refresh with that cookie must fail
    const refreshAfterLogout = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: freshCookie },
    });
    assert.strictEqual(refreshAfterLogout.status, 401);
  });
});
