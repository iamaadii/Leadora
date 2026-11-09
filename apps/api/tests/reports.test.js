import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { sanitizeForCsv } from '../src/modules/reports/exporters/csv.exporter.js';

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

describe('Phase 9: Reports & Data Export Module Tests', () => {
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

  // 1. Unauthenticated rejection
  test('Unauthenticated request to reports endpoint returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/reports/leads`);
    assert.strictEqual(res.status, 401);
  });

  // 2. Super Admin tenant isolation
  test('Super Admin is strictly forbidden (HTTP 403) from accessing organization reports', async () => {
    const res = await fetch(`${baseUrl}/reports/leads`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 3. Admin queries all 7 tenant reports
  test('Admin can query Lead Report (leads) with summary metrics', async () => {
    const res = await fetch(`${baseUrl}/reports/leads?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'leads');
    assert.ok(typeof body.data.summary.totalLeads === 'number');
    assert.ok(Array.isArray(body.data.data));
    assert.ok(Array.isArray(body.data.columns));
  });

  test('Admin can query Conversion Report (conversions)', async () => {
    const res = await fetch(`${baseUrl}/reports/conversions?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'conversions');
    assert.ok(typeof body.data.summary.conversionRate === 'number');
    assert.ok(Array.isArray(body.data.data));
  });

  test('Admin can query Lost Leads Report (lost-leads)', async () => {
    const res = await fetch(`${baseUrl}/reports/lost-leads?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'lost-leads');
    assert.ok(typeof body.data.summary.totalLost === 'number');
    assert.ok(Array.isArray(body.data.data));
  });

  test('Admin can query Follow-up Report (followups)', async () => {
    const res = await fetch(`${baseUrl}/reports/followups?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'followups');
    assert.ok(typeof body.data.summary.totalFollowups === 'number');
    assert.ok(Array.isArray(body.data.data));
  });

  test('Admin can query Employee Performance Report (employees)', async () => {
    const res = await fetch(`${baseUrl}/reports/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'employees');
    assert.ok(body.data.data.length > 0);
    assert.ok(body.data.data.some((r) => r.name.includes('Alice')));
  });

  test('Admin can query Team Performance Report (teams)', async () => {
    const res = await fetch(`${baseUrl}/reports/teams`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'teams');
    assert.ok(typeof body.data.summary.totalTeams === 'number');
    assert.ok(Array.isArray(body.data.data));
  });

  test('Admin can query System Activity Report (activities)', async () => {
    const res = await fetch(`${baseUrl}/reports/activities?range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'activities');
    assert.ok(typeof body.data.summary.totalActivities === 'number');
    assert.ok(Array.isArray(body.data.data));
  });

  // 4. Role-based scoping tests
  test('Employee Alice sees only her scoped leads in Lead Report', async () => {
    const res = await fetch(`${baseUrl}/reports/leads`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    for (const lead of body.data.data) {
      assert.ok(
        lead.assignedTo.includes('Alice') || lead.assignedTo === 'Unassigned',
        `Lead assigned to unexpected rep: ${lead.assignedTo}`,
      );
    }
  });

  test('Manager Marcus sees only teams they manage in Team Report', async () => {
    const res = await fetch(`${baseUrl}/reports/teams`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    for (const team of body.data.data) {
      assert.ok(
        team.managerName.includes('Marcus') || team.managerName === 'Unassigned',
        `Team managed by unexpected manager: ${team.managerName}`,
      );
    }
  });

  // 5. Data export tests (CSV, Excel, PDF)
  test('Export: Lead Report as CSV returns RFC 4180 format with attachment headers', async () => {
    const res = await fetch(`${baseUrl}/reports/leads/export?format=csv&range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/csv'));
    assert.ok(res.headers.get('content-disposition').includes('attachment; filename="leads-report-'));

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // Verify UTF-8 BOM bytes (0xEF, 0xBB, 0xBF)
    assert.strictEqual(bytes[0], 0xEF);
    assert.strictEqual(bytes[1], 0xBB);
    assert.strictEqual(bytes[2], 0xBF);

    const text = new TextDecoder('utf-8').decode(bytes);
    assert.ok(text.includes('Lead Name'));
    assert.ok(text.includes('Company'));
  });

  test('Export: Lead Report as Excel (.xlsx) returns valid workbook format', async () => {
    const res = await fetch(`${baseUrl}/reports/leads/export?format=excel&range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    assert.ok(res.headers.get('content-disposition').includes('.xlsx'));

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // Check ZIP magic header for .xlsx files: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    assert.strictEqual(bytes[0], 0x50);
    assert.strictEqual(bytes[1], 0x4B);
    assert.strictEqual(bytes[2], 0x03);
    assert.strictEqual(bytes[3], 0x04);
  });

  test('Export: Lead Report as PDF returns valid printable PDF binary', async () => {
    const res = await fetch(`${baseUrl}/reports/leads/export?format=pdf&range=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.ok(res.headers.get('content-disposition').includes('.pdf'));

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // Check PDF magic header %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    const headerStr = String.fromCharCode(...bytes.slice(0, 5));
    assert.strictEqual(headerStr, '%PDF-');
  });

  // 6. Formula injection mitigation test
  test('CSV Formula Injection Defense: sanitizes leading formula triggers', () => {
    assert.strictEqual(sanitizeForCsv('=1+1'), "'=1+1");
    assert.strictEqual(sanitizeForCsv('+cmd|'), "'+cmd|");
    assert.strictEqual(sanitizeForCsv('-2*3'), "'-2*3");
    assert.strictEqual(sanitizeForCsv('@SUM(A1:A10)'), "'@SUM(A1:A10)");
    assert.strictEqual(sanitizeForCsv('Acme Corp'), 'Acme Corp');
    assert.strictEqual(sanitizeForCsv('Quotes, "with" commas'), '"Quotes, ""with"" commas"');
  });

  // 7. Platform Reports (Super Admin only)
  test('Super Admin can access Platform Organizations Report', async () => {
    const res = await fetch(`${baseUrl}/platform/reports/organizations`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'organizations');
    assert.ok(typeof body.data.summary.totalOrganizations === 'number');
    assert.ok(body.data.data.length > 0);
  });

  test('Super Admin can access Platform Users Report', async () => {
    const res = await fetch(`${baseUrl}/platform/reports/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.reportType, 'users');
    assert.ok(typeof body.data.summary.totalUsers === 'number');
    assert.ok(body.data.data.length > 0);
  });

  test('Super Admin can export platform report as CSV', async () => {
    const res = await fetch(`${baseUrl}/platform/reports/organizations/export?format=csv`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/csv'));
    const text = await res.text();
    assert.ok(text.includes('Organization Name'));
  });

  test('Tenant Admin is forbidden (HTTP 403) from platform reports', async () => {
    const res = await fetch(`${baseUrl}/platform/reports/organizations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 403);
  });
});
