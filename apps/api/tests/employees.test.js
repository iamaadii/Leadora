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

describe('Phase 6: Employee Management Module Tests', () => {
  let adminToken = '';
  let managerToken = '';
  let employeeToken = '';
  let superAdminToken = '';
  let adminUserId = '';

  let createdEmployeeId = '';
  const testEmail = `employee_test_${Date.now()}@acme.com`;

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
    adminUserId = adminData.data.user.id;

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
  });

  // Section 1: Role-based Access Control
  test('Super Admin cannot access employee management endpoints (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('Manager cannot access employee management endpoints (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  test('Employee cannot access employee management endpoints (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // Section 2: Admin Employee Listing
  test('Admin can list employees with pagination and filters', async () => {
    const res = await fetch(`${baseUrl}/employees?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    assert.ok(data.meta.total >= 1);
    // Each employee includes active_leads_count
    assert.strictEqual(typeof data.data[0].active_leads_count, 'number');
  });

  // Section 3: Create Employee
  test('Admin can create a new employee with temporary password and must_change_password=true', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Agent',
        email: testEmail,
        phone: '+1-555-0199',
        role: 'EMPLOYEE',
        temporaryPassword: 'TempPassword123!',
      }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, testEmail);
    assert.strictEqual(body.data.role, 'EMPLOYEE');
    assert.strictEqual(body.data.must_change_password, true);
    assert.strictEqual(body.data.is_active, true);
    assert.strictEqual(body.data.password_hash, undefined); // Never expose password hash

    createdEmployeeId = body.data.id;
  });

  test('Admin cannot create employee with duplicate email in same org (HTTP 409)', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'Duplicate',
        lastName: 'Agent',
        email: testEmail,
        role: 'EMPLOYEE',
        temporaryPassword: 'TempPassword123!',
      }),
    });
    assert.strictEqual(res.status, 409);
  });

  // Section 4: Get & Update Employee
  test('Admin can get employee details by ID', async () => {
    const res = await fetch(`${baseUrl}/employees/${createdEmployeeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.id, createdEmployeeId);
    assert.strictEqual(body.data.email, testEmail);
  });

  test('Admin can update employee details', async () => {
    const res = await fetch(`${baseUrl}/employees/${createdEmployeeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'UpdatedName',
        phone: '+1-555-9999',
      }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.first_name, 'UpdatedName');
    assert.strictEqual(body.data.phone, '+1-555-9999');
  });

  // Section 5: Role Change and Invariant Protections
  test('Admin can promote employee to MANAGER', async () => {
    const res = await fetch(`${baseUrl}/employees/${createdEmployeeId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'MANAGER',
      }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'MANAGER');
  });

  test('Admin cannot change their own role (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/employees/${adminUserId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'EMPLOYEE',
      }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('cannot change your own role'));
  });

  // Section 6: Deactivation & Invariant Protections
  test('Admin cannot deactivate their own account (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/employees/${adminUserId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('cannot deactivate your own account'));
  });

  test('Admin can deactivate an employee account', async () => {
    const res = await fetch(`${baseUrl}/employees/${createdEmployeeId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.is_active, false);
  });

  test('Admin can reactivate a deactivated employee', async () => {
    const res = await fetch(`${baseUrl}/employees/${createdEmployeeId}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.is_active, true);
  });
});
