import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

describe('Phase 10: Security Hardening & Production Reliability Tests', () => {
  test('1. API requests include X-Request-Id header in responses and accept client correlation IDs', async () => {
    const customCorrelationId = 'test-trace-id-12345';
    const res = await fetch(`${baseUrl}/health`, {
      headers: {
        'x-request-id': customCorrelationId,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('x-request-id'), customCorrelationId);

    // Without incoming header, a UUID must be auto-generated
    const resAuto = await fetch(`${baseUrl}/health`);
    assert.strictEqual(resAuto.status, 200);
    const autoId = resAuto.headers.get('x-request-id');
    assert.ok(autoId, 'Expected auto-generated X-Request-Id header');
    assert.match(
      autoId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Expected valid UUIDv4',
    );
  });

  test('2. Health check endpoints do not disclose internal database names or credentials', async () => {
    const res = await fetch(`${baseUrl}/health/db`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'connected');
    assert.ok(body.data.responseTimeMs >= 0);
    // Ensure database name is NOT leaked
    assert.strictEqual(body.data.database, undefined);
  });

  test('3. JWT verification strictly rejects tokens with "none" or unexpected algorithms', async () => {
    // Forge an unsigned token with alg: 'none'
    const forgedToken = jwt.sign(
      {
        userId: 'f0000000-0000-0000-0000-000000000001',
        organizationId: '8a51596d-4612-4fdf-a560-072299372635',
        role: 'SUPER_ADMIN',
      },
      '',
      { algorithm: 'none' },
    );

    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${forgedToken}`,
      },
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, 'TOKEN_INVALID');
  });

  test('4. Centralized error handling returns structured error format with requestId', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': 'err-test-id-999',
      },
      body: JSON.stringify({ email: 'invalid-email-format' }),
    });

    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    assert.strictEqual(body.error.requestId, 'err-test-id-999');
    assert.ok(body.error.timestamp);
  });

  test('5. Non-existent routes return structured 404 without leaking server internals', async () => {
    const res = await fetch(`${baseUrl}/non-existent-endpoint-xyz`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'NOT_FOUND');
    assert.strictEqual(body.error.requestId, res.headers.get('x-request-id'));
  });
});
