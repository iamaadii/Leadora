# Operations, Deployment & Administration Guide

This document is the unified operational runbook for Leadora, covering environment configuration, Super Admin provisioning, Docker container orchestration, deployment checklists, and production readiness audits.

---

## 1. Environment Configuration Guide (`.env`)

### Example Configuration

```env
# Server Mode & Port
NODE_ENV=development
PORT=5000

# Web Frontend URL (CORS allowed origin)
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database Connection
DATABASE_URL=postgresql://crm_admin:crm_secret_password@localhost:5432/business_crm
DATABASE_SSL=false
DB_USER=crm_admin
DB_PASSWORD=crm_secret_password
DB_NAME=business_crm
DB_PORT=5432
DB_HOST=localhost

# Authentication & JWT Configuration
JWT_ACCESS_SECRET="super-secret-jwt-access-token-key-minimum-32-chars-long"
ACCESS_TOKEN_EXPIRES_IN="10m"
REFRESH_TOKEN_EXPIRES_IN="7d"
COOKIE_NAME="refreshToken"
COOKIE_SAME_SITE="lax"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=10
```

### Key Environment Variables

| Variable                   | Description                                                            | Production Example                    |
| :------------------------- | :--------------------------------------------------------------------- | :------------------------------------ |
| `NODE_ENV`                 | Application runtime environment (`development`, `test`, `production`). | `production`                          |
| `PORT`                     | HTTP port the Express server binds to.                                 | `5000`                                |
| `FRONTEND_URL`             | Trusted origin allowed for CORS requests and cookie transmission.      | `https://crm.yourdomain.com`          |
| `DATABASE_URL`             | Complete PostgreSQL connection string.                                 | `postgresql://user:pass@host:5432/db` |
| `DATABASE_SSL`             | Enable TLS/SSL connection to remote database.                          | `true`                                |
| `JWT_ACCESS_SECRET`        | 32+ character cryptographic secret for signing JWTs.                   | Random 64-char hex string             |
| `ACCESS_TOKEN_EXPIRES_IN`  | Lifespan of in-memory access token.                                    | `10m`                                 |
| `REFRESH_TOKEN_EXPIRES_IN` | Lifespan of refresh token session.                                     | `7d`                                  |

### Production Secret Key Generation

When running with `NODE_ENV=production`, the application validates `JWT_ACCESS_SECRET`. To generate a cryptographically secure key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. Super Admin Initial Bootstrap CLI

Leadora includes a dedicated CLI command to provision the platform Super Admin account without populating the database with demo fixtures or test organizations.

- **CLI Shortcut:** `npm run admin:create`
- **Script Location:** `apps/api/src/scripts/create-super-admin.js`

### Default Seeded Super Admin

When seeding the database with demo data (`npm run db:seed`), the following Super Admin is created:

- **Email:** `superadmin@platform.com`
- **Password:** `Password123!`
- **Sign-in Note:** In the web login interface, check the **Platform Super Admin (no organization slug required)** checkbox.

### Interactive CLI Usage

```bash
npm run admin:create
```

Prompts for:

1. **Email:** Valid email format (mandatory).
2. **First Name:** Defaults to `Super`.
3. **Last Name:** Defaults to `Admin`.
4. **Password:** Minimum 8 characters (masked in interactive TTY).

### Automated / CI/CD Usage

```bash
npm run admin:create -- --email=admin@yourdomain.com --password=YourStrongPassword123! --firstName=Lead --lastName=Admin
```

### Idempotence & Safety

- If the email belongs to an existing `SUPER_ADMIN`, the script safely updates the name and password without affecting audit logs.
- If the email belongs to a tenant user, the script immediately aborts with an error to prevent accidental privilege escalation.

---

## 3. Production Docker Deployment Guide

Leadora features a containerized multi-service architecture orchestrated via Docker Compose:

- **`web`**: Nginx Alpine multi-stage runtime serving optimized Vite SPA assets, handling security headers, gzip compression, and reverse-proxying `/api/` to the backend.
- **`api`**: Node.js 20 Alpine container running as non-root `USER node` with built-in `/health` checks.
- **`migrate`**: Transient one-shot container executing database migrations (`node src/database/migrate.js`) against PostgreSQL and terminating cleanly before the API initializes.
- **`postgres`**: PostgreSQL 16 Alpine with healthcheck, parameterized queries, and persistent Docker volume.

### Orchestration File

Located at `infrastructure/docker/docker-compose.prod.yml`.

### Deployment Commands

```bash
# 1. Build and start containers in the background
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

# 2. Inspect running container status
docker compose -f infrastructure/docker/docker-compose.prod.yml ps

# 3. Stream backend application logs
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f api

# 4. Bootstrap the Super Admin user inside the container
docker compose -f infrastructure/docker/docker-compose.prod.yml exec api npm run admin:create
```

### Nginx Reverse Proxy & Server-Sent Events (SSE)

`apps/web/nginx.conf` is optimized for real-time SSE streaming by disabling proxy buffering on `/api/`:

```nginx
location /api/ {
    proxy_pass http://api:5000;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
    proxy_set_header Connection '';
    chunked_transfer_encoding off;
}
```

---

## 4. Production Readiness Audit

| Area / Module                    |  Status   | Verification Detail                                                                                      |
| :------------------------------- | :-------: | :------------------------------------------------------------------------------------------------------- |
| **1. Database Migrations**       | **Clean** | 12 sequential SQL migrations tested on empty databases. Composite foreign keys enforce tenant isolation. |
| **2. Authentication & Sessions** | **Clean** | Argon2id password hashing, 10-minute access tokens, secure HttpOnly cookie refresh rotation.             |
| **3. Leads & Pipeline Kanban**   | **Clean** | 7 canonical stages with atomic transitions. Mandatory loss reason enforced.                              |
| **4. Follow-ups & Reminders**    | **Clean** | Real-time tracking of Overdue and Due Today tasks. Mandatory outcome notes on completion.                |
| **5. Team Management**           | **Clean** | Strict manager boundaries. Database constraint limits users to one active team.                          |
| **6. Activity Feed & Audit**     | **Clean** | Immutable chronological event logging across all lead operations.                                        |
| **7. Real-Time Notifications**   | **Clean** | SSE stream with 25s keepalive heartbeat comments; automatic polling fallback.                            |
| **8. Dashboard & Analytics**     | **Clean** | High-performance SQL queries with proper index coverage.                                                 |
| **9. Reports & File Downloads**  | **Clean** | Streaming CSV, Excel (.xlsx), and PDF generation with spreadsheet formula injection protection.          |
| **10. Security & Hardening**     | **Clean** | IP rate limiting, input sanitization via Zod, parameterized queries, and masked production errors.       |

---

## 5. Production Deployment Checklist

### Pre-Deployment Verification

- [ ] **Database Prepared:** PostgreSQL 16+ running with SSL enabled and accessible.
- [ ] **Backup Verified:** Fresh database backup captured via `pg_dump`.
- [ ] **Secrets Configured:** `NODE_ENV=production` set with a unique 64-character `JWT_ACCESS_SECRET`.
- [ ] **Domain & SSL:** `FRONTEND_URL` configured to the production HTTPS domain.
- [ ] **Test Suite Passes:** `npm --workspace=apps/api test` executes with 100% passing tests.
- [ ] **Linter Passes:** `npm run lint` completes with 0 errors.
- [ ] **Production Build:** `npm run build:web` builds without warnings or bundle failures.

### Deployment Execution

```bash
# Step 1: Run database migrations
npm --workspace=apps/api run db:migrate

# Step 2: Launch backend server
node apps/api/src/server.js

# Step 3: Deploy frontend bundle
# Serve apps/web/dist via Nginx or Cloudflare Pages with SPA index.html fallback
```

### Post-Deployment Smoke Tests

- [ ] **Health Endpoint:** Verify `GET /api/v1/health` returns `{"status":"healthy"}`.
- [ ] **Database Health:** Verify `GET /api/v1/health/db` confirms active database connectivity.
- [ ] **Authentication:** Successfully authenticate with Admin account.
- [ ] **Lead Management:** Create a test lead and move it across Kanban stages.
- [ ] **Export Verification:** Download a sample report in CSV, Excel, and PDF formats to confirm streaming downloads work.
