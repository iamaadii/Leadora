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
│   │   │   │   ├── migrations/          # Versioned raw SQL migration files
│   │   │   │   │   ├── 001_create_organizations.sql
│   │   │   │   │   ├── 002_create_users.sql
│   │   │   │   │   ├── 003_create_leads.sql
│   │   │   │   │   ├── 004_create_followups.sql
│   │   │   │   │   ├── 005_create_activities.sql
│   │   │   │   │   ├── 006_create_notifications.sql
│   │   │   │   │   ├── 007_create_refresh_tokens.sql
│   │   │   │   │   └── 008_create_audit_logs.sql
│   │   │   │   ├── seeds/
│   │   │   │   │   └── seed.js          # Argon2 idempotent demo seed script
│   │   │   │   ├── migrate.js           # Database migration runner
│   │   │   │   └── verify.js            # Automated 36-point DB architecture test suite
│   │   │   ├── middleware/
│   │   │   │   ├── error.middleware.js  # Centralized error handling
│   │   │   │   └── not-found.middleware.js # 404 handler
│   │   │   ├── utils/                   # Shared utility helpers
│   │   │   ├── app.js                   # Express app configuration & health routes
│   │   │   └── server.js                # Server entry point & graceful shutdown
│   │   └── package.json
│   │
│   └── web/                              # Frontend React + Vite Application
│       ├── src/
│       │   ├── layouts/
│       │   │   └── AppLayout.jsx        # Top navbar & main shell layout
│       │   ├── pages/
│       │   │   └── HomePage.jsx         # Initial home screen with connectivity test
│       │   ├── services/
│       │   │   └── api.js               # Axios API client (proxied to /api)
│       │   ├── App.jsx                  # React Router & TanStack Query client
│       │   ├── main.jsx                 # React DOM entry point
│       │   └── index.css                # Tailwind CSS directives
│       ├── index.html
│       ├── vite.config.js               # Vite proxy config (/api -> http://localhost:5000)
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── package.json
│
├── docs/                                 # Architectural Specifications
│   ├── functional-requirements.md
│   ├── role-permissions.md
│   ├── application-workflows.md
│   ├── database-design.md
│   ├── database-erd.md                  # Mermaid Entity-Relationship Diagram
│   ├── api-design.md
│   ├── architecture.md
│   └── frontend-pages.md
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml           # PostgreSQL 16 container with persistent volume
│
├── .env.example                          # Environment variables template
├── .env                                  # Local development credentials (git-ignored)
├── .gitignore
├── .eslintrc.json                        # ESLint configuration
├── .prettierrc                           # Prettier configuration
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

## 6. Starting Frontend and Backend

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

## 7. Database Administration and Safe Reset

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
