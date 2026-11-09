# Business CRM and Lead Management System

A multi-organization Business CRM and Lead Management System for small and medium-sized businesses (SMBs). Built with **React**, **Node.js/Express**, and **PostgreSQL** using raw parameterized SQL queries.

---

## 1. Prerequisites and Required Software

Before running this project on your local machine, ensure you have installed:

- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher
- **Docker Desktop**: With Docker Engine and Docker Compose enabled
- **Git**

---

## 2. Project Architecture and Folder Structure

```
business-crm/
├── apps/
│   ├── api/                              # Backend Express.js Application (ES Modules)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.js          # pg.Pool connection & withTransaction helper
│   │   │   │   └── env.js               # Zod environment variable validation
│   │   │   ├── database/                # Database migrations & seeds
│   │   │   │   ├── migrations/          # Versioned raw SQL migration files (001-008)
│   │   │   │   ├── seeds/
│   │   │   │   │   └── seed.js          # Argon2 idempotent demo seed script
│   │   │   │   ├── migrate.js           # Database migration runner
│   │   │   │   └── verify.js            # Automated 36-point DB architecture test suite
│   │   │   ├── errors/
│   │   │   │   └── app-error.js         # Standard AppError class
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.middleware.js # JWT verification & tenant active check
│   │   │   │   ├── authorize.middleware.js    # RBAC role authorization
│   │   │   │   ├── rate-limit.middleware.js   # In-memory IP rate limiter
│   │   │   │   ├── error.middleware.js        # Centralized error handler
│   │   │   │   └── not-found.middleware.js    # 404 handler
│   │   │   ├── modules/
│   │   │   │   └── auth/                # Authentication module
│   │   │   │       ├── auth.controller.js
│   │   │   │       ├── auth.routes.js
│   │   │   │       ├── auth.service.js
│   │   │   │       └── auth.validation.js
│   │   │   ├── repositories/            # Raw SQL repository layer
│   │   │   │   ├── auth.repository.js
│   │   │   │   ├── refresh-token.repository.js
│   │   │   │   └── user.repository.js
│   │   │   ├── utils/                   # Shared utility helpers (tokens, cookies)
│   │   │   ├── app.js                   # Express app configuration & middleware
│   │   │   └── server.js                # Server entry point & graceful shutdown
│   │   ├── tests/
│   │   │   └── auth.test.js             # 17-point automated auth & RBAC test suite
│   │   └── package.json
│   │
│   └── web/                              # Frontend React + Vite Application
│       ├── src/
│       │   ├── features/
│       │   │   └── auth/                # Frontend Auth feature module
│       │   │       ├── components/
│       │   │       │   ├── LoginForm.jsx
│       │   │       │   ├── ProtectedRoute.jsx
│       │   │       │   └── RoleRoute.jsx
│       │   │       ├── context/
│       │   │       │   └── AuthContext.jsx # In-memory JWT access token provider
│       │   │       ├── hooks/
│       │   │       │   └── useAuth.js
│       │   │       ├── pages/
│       │   │       │   └── LoginPage.jsx
│       │   │       └── services/
│       │   │           └── auth.service.js
│       │   ├── layouts/
│       │   │   └── AppLayout.jsx        # Top navbar & authenticated user status
│       │   ├── pages/
│       │   │   └── HomePage.jsx         # Home dashboard with session card & connectivity test
│       │   ├── services/
│       │   │   └── api.js               # Axios client with token & refresh interceptors
│       │   ├── App.jsx                  # React Router & AuthProvider
│       │   ├── main.jsx                 # React DOM entry point
│       │   └── index.css                # Tailwind CSS directives
│       ├── index.html
│       ├── vite.config.js               # Vite proxy config (/api -> http://localhost:5000)
│       └── package.json
│
├── docs/                                 # Architectural Specifications
│   ├── functional-requirements.md
│   ├── role-permissions.md
│   ├── application-workflows.md
│   ├── database-design.md
│   ├── database-erd.md                  # Mermaid Entity-Relationship Diagram
│   ├── api-design.md
│   ├── api-documentation.md             # Complete REST API reference documentation
│   ├── architecture.md
│   └── frontend-pages.md
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml           # PostgreSQL 16 container with persistent volume
│
├── .env.example                          # Environment variables template
├── .env                                  # Local development credentials (git-ignored)
├── package.json                          # Root npm workspaces configuration
└── README.md
```

---

## 3. Environment Setup

Copy `.env.example` to `.env` in the root of the project:

```bash
cp .env.example .env
```

Verify your `.env` contains:

```env
NODE_ENV=development

# PostgreSQL Configuration
DB_USER=crm_admin
DB_PASSWORD=crm_secret_password
DB_NAME=business_crm
DB_PORT=5432
DB_HOST=localhost

# Backend API Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://crm_admin:crm_secret_password@localhost:5432/business_crm"

# JWT and Authentication Security (Phase 3)
JWT_ACCESS_SECRET="crm-dev-super-secret-access-token-key-change-in-production-min-32-chars"
ACCESS_TOKEN_EXPIRES_IN="10m"
REFRESH_TOKEN_EXPIRES_IN="7d"
COOKIE_NAME="refresh_token"

# Frontend Configuration
VITE_API_BASE_URL=/api
```

---

## 4. Database Setup & Migrations (Phase 2)

### Step 1: Start PostgreSQL via Docker Compose
```bash
npm run db:up
```
*(Or: `docker compose -f infrastructure/docker/docker-compose.yml up -d`)*

### Step 2: Run Database Migrations
Executes all pending raw SQL migrations in `apps/api/src/database/migrations/`:
```bash
npm run db:migrate
```
*(Tracks applied migrations in `schema_migrations` and runs them safely inside transactions)*

### Step 3: Seed Demo Data
Populates the database with demo organization, users across all 4 roles, sample leads, follow-ups, and activities:
```bash
npm run db:seed
```

### Step 4: Run Database Architecture Verification
Runs the 36-point automated verification suite testing constraints, foreign keys, and multi-tenant isolation:
```bash
node apps/api/src/database/verify.js
```

---

## 5. Local Demo Accounts & Credentials

The seed script creates the following demo accounts for local testing (all use Argon2 hashed passwords):

| Role | Email | Password | Organization | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@platform.com` | `Password123!` | *None (Global)* | Platform-wide |
| **Admin** | `admin@acme.com` | `Password123!` | Acme Sales Corp | Organization-wide |
| **Manager** | `manager@acme.com` | `Password123!` | Acme Sales Corp | Team / Leads |
| **Employee** | `alice@acme.com` | `Password123!` | Acme Sales Corp | Assigned Leads |
| **Employee** | `bob@acme.com` | `Password123!` | Acme Sales Corp | Assigned Leads |

---

## 6. Authentication & Role-Based Authorization (Phase 3)

### Security Architecture
- **In-Memory Access Tokens:** The frontend keeps short-lived JWTs (~10m) strictly in application memory (`AuthContext`), never in `localStorage` or `sessionStorage` (mitigating XSS theft).
- **HttpOnly Refresh Cookies:** 64-byte cryptographically secure random refresh tokens (~7d) reside in `HttpOnly`, `SameSite=Lax` cookies, accessible solely by the backend authentication endpoints.
- **SHA-256 Database Persistence:** Raw refresh tokens are never stored. The database stores only SHA-256 hashes (`token_hash`) alongside expiry and revocation status.
- **Single-Use Rotation & Reuse Detection:** Every refresh call consumes the old token and issues a fresh one. If an already revoked token is used (indicating stolen cookies), the system invalidates **all** active sessions for that user instantly.
- **Tenant Isolation at Login:** Tenant users must provide their organization slug; platform Super Admins log in globally without tenant scoping.
- **Argon2 Password Hashing:** Robust modern password hashing with salt generation.

### Testing Authentication & Running Test Suite
Execute the 17-point automated auth test suite (covering login, refresh rotation, reuse detection, password changes, logout, and RBAC middleware):

```bash
# Run backend test suite
npm run test:api
# Or directly with Node's built-in test runner:
node --test apps/api/tests/auth.test.js
```

Full API specifications are available in [docs/api-documentation.md](docs/api-documentation.md).

---

## 7. Starting Frontend and Backend

Start both applications with one command:

```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

Separate terminals:
- Backend only: `npm run dev:api`
- Frontend only: `npm run dev:web`

---

## 8. Database Administration and Safe Reset

### View Database Tables
Using `psql` via Docker:
```bash
docker exec -it business_crm_postgres psql -U crm_admin -d business_crm -c "\dt"
```

### Safe Database Reset (Wipe & Re-migrate)
To reset the database completely from scratch:
```bash
# 1. Stop and remove container + volume
docker compose -f infrastructure/docker/docker-compose.yml down -v

# 2. Start clean PostgreSQL container
npm run db:up

# 3. Apply all migrations
npm run db:migrate

# 4. Seed demo data
npm run db:seed
```
