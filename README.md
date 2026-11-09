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
│   │   │   │   ├── auth/                # Authentication module (Phase 3)
│   │   │   │   │   ├── auth.controller.js
│   │   │   │   │   ├── auth.routes.js
│   │   │   │   │   ├── auth.service.js
│   │   │   │   │   └── auth.validation.js
│   │   │   │   ├── employees/           # Employee Directory module (Phase 6)
│   │   │   │   │   ├── employees.constants.js
│   │   │   │   │   ├── employees.controller.js
│   │   │   │   │   ├── employees.repository.js
│   │   │   │   │   ├── employees.routes.js
│   │   │   │   │   ├── employees.service.js
│   │   │   │   │   └── employees.validation.js
│   │   │   │   ├── leads/               # Lead Management module (Phase 5)
│   │   │   │   │   ├── leads.constants.js
│   │   │   │   │   ├── leads.controller.js
│   │   │   │   │   ├── leads.repository.js
│   │   │   │   │   ├── leads.routes.js
│   │   │   │   │   ├── leads.service.js
│   │   │   │   │   └── leads.validation.js
│   │   │   │   ├── followups/           # Follow-ups & Task Scheduling (Phase 7)
│   │   │   │   ├── dashboard/           # Dashboard & Analytics module (Phase 8)
│   │   │   │   └── reports/             # Reports & Data Export module (Phase 9)
│   │   │   │       ├── exporters/       # Multi-format export engines (CSV, Excel, PDF)
│   │   │   │       │   ├── csv.exporter.js
│   │   │   │       │   ├── excel.exporter.js
│   │   │   │       │   └── pdf.exporter.js
│   │   │   │       ├── reports.constants.js
│   │   │   │       ├── reports.controller.js
│   │   │   │       ├── reports.repository.js
│   │   │   │       ├── reports.routes.js
│   │   │   │       ├── reports.service.js
│   │   │   │       └── reports.validation.js
│   │   │   ├── repositories/            # Raw SQL repository layer
│   │   │   │   ├── auth.repository.js
│   │   │   │   ├── refresh-token.repository.js
│   │   │   │   └── user.repository.js
│   │   │   ├── utils/                   # Shared utility helpers (tokens, cookies)
│   │   │   ├── app.js                   # Express app configuration & middleware
│   │   │   └── server.js                # Server entry point & graceful shutdown
│   │   ├── tests/
│   │   │   ├── auth.test.js             # 17-point automated auth & RBAC test suite
│   │   │   ├── leads.test.js            # 18-point automated lead lifecycle test suite
│   │   │   ├── employees.test.js        # 13-point automated employee administration test suite
│   │   │   ├── teams.test.js            # 10-point automated team & manager boundary test suite
│   │   │   ├── followups.test.js        # 24-point automated follow-up & task scheduling test suite
│   │   │   ├── dashboard.test.js        # 21-point automated dashboard & analytics test suite
│   │   │   └── reports.test.js          # 19-point automated reports & data export test suite
│   │   └── package.json
│   │
│   └── web/                              # Frontend React + Vite Application
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/                # Frontend Auth feature module (Phase 3)
│       │   │   │   ├── components/
│       │   │   │   │   ├── LoginForm.jsx
│       │   │   │   │   ├── ProtectedRoute.jsx
│       │   │   │   │   └── RoleRoute.jsx
│       │   │   │   ├── context/
│       │   │   │   │   └── AuthContext.jsx # In-memory JWT access token provider
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useAuth.js
│       │   │   │   ├── pages/
│       │   │   │   │   └── LoginPage.jsx
│       │   │   │   └── services/
│       │   │   │       └── auth.service.js
│       │   │   ├── employees/           # Frontend Employees Directory module (Phase 6)
│       │   │   │   ├── components/
│       │   │   │   │   ├── EmployeeTable.jsx
│       │   │   │   │   ├── CreateEmployeeModal.jsx
│       │   │   │   │   ├── EditEmployeeModal.jsx
│       │   │   │   │   └── ChangeRoleModal.jsx
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useEmployees.js
│       │   │   │   └── services/
│       │   │   │       └── employees.service.js
│       │   │   ├── leads/               # Frontend Leads feature module (Phase 5)
│       │   │   │   ├── components/
│       │   │   │   │   ├── LeadActivityTimeline.jsx
│       │   │   │   │   ├── LeadFilters.jsx
│       │   │   │   │   ├── LeadForm.jsx
│       │   │   │   │   ├── LeadStatusBadge.jsx
│       │   │   │   │   └── LeadTable.jsx
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useLeads.js
│       │   │   │   ├── pages/
│       │   │   │   │   ├── LeadDetailsPage.jsx
│       │   │   │   │   └── LeadsPage.jsx
│       │   │   │   └── services/
│       │   │   │       └── leads.service.js
│       │   │   └── teams/               # Frontend Teams feature module (Phase 6)
│       │   │       ├── components/
│       │   │       │   ├── TeamCard.jsx
│       │   │       │   ├── CreateTeamModal.jsx
│       │   │       │   ├── EditTeamModal.jsx
│       │   │       │   └── ManageMembersModal.jsx
│       │   │       ├── hooks/
│       │   │       │   └── useTeams.js
│       │   │       ├── pages/
│       │   │       │   ├── TeamsPage.jsx
│       │   │       │   └── TeamDetailsPage.jsx
│       │   │       └── services/
│       │   │           └── teams.service.js
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

## 7. Frontend Layout & Design System (Phase 4)

### Overview & Architecture
The frontend is built with React + Vite, Tailwind CSS, and Lucide React icons following modern SaaS CRM design standards:
- **Responsive Dashboard Layout (`DashboardLayout`):**
  - **Sidebar:** Dynamic role-based navigation with desktop collapse toggle (`20` / `64` width) and mobile slide-in drawer.
  - **Topbar:** Mobile hamburger toggle, dynamic page title/breadcrumbs, active organization badge, notification bell with unread indicator, and user profile dropdown with logout.
  - **Main Viewport:** Wrapped inside React `<ErrorBoundary>` with consistent padding and responsive max-width.
- **Role-Based Navigation:**
  - `SUPER_ADMIN`: Dashboard, Employees, Notifications, Settings, Profile.
  - `ADMIN`: Dashboard, Leads, Employees, Follow-ups, Activities, Notifications, Reports, Settings, Profile.
  - `MANAGER`: Dashboard, Leads, Employees (Team), Follow-ups, Activities, Notifications, Reports, Profile.
  - `EMPLOYEE`: Dashboard, Leads (Assigned), Follow-ups, Activities, Notifications, Profile.
- **Reusable UI Components (`apps/web/src/components/ui/`):**
  - `Button` (5 variants, 3 sizes, loading spinner, disabled states)
  - `Input`, `Select`, `Textarea` (form fields with validation error text, helper text, icons)
  - `Badge` (primary, success, warning, danger, neutral, info with optional dot indicator)
  - `Modal`, `ConfirmationDialog` (accessible keyboard escape, backdrop click, focus management)
  - `Dropdown`, `DropdownItem`, `DropdownDivider` (profile menu, actions)
  - `Avatar` (initials fallback generator, online status indicator)
  - `Tooltip` (directional hover tooltips)
  - `Skeleton`, `SkeletonCard`, `Spinner` (loading states)
  - `EmptyState`, `ErrorState` (standardized user messaging)
  - `PageHeader` (breadcrumb, title, badge, action buttons)
  - `Toast` (global toast notification provider via `useToast()`)
- **Pages Implemented:**
  - `DashboardPage` (KPI cards: total, new, converted, lost, pending tasks; chart & activity placeholders)
  - `LeadsPage` (lead creation modal preview, search & stage filters, empty state)
  - `EmployeesPage` (invitation modal preview, role filter, empty state)
  - `FollowupsPage` (task scheduling modal preview, pending vs completed tabs, empty state)
  - `ActivitiesPage` (interaction timeline filter, empty state)
  - `NotificationsPage` (alert filters, mark-all-read action, empty state)
  - `ReportsPage` (rep performance & lead source breakdown card placeholders)
  - `SettingsPage` (organization name, timezone, currency defaults)
  - `ProfilePage` (user identity badge, assigned role, change password integration)

---

## 8. Complete Lead Management Module (Phase 5)

### Architecture & Security
- **Multi-Tenant Scoping:** Every lead query strictly enforces `organization_id = req.user.organizationId`.
- **Role-Based Lead Scoping:**
  - `ADMIN`: Full access to create, view, update, assign, archive, and restore all organization leads.
  - `MANAGER`: Full access to view, create, update, and assign leads within organization scope.
  - `EMPLOYEE`: Access strictly restricted to assigned leads (`assigned_to_id = req.user.id` or created by employee). Cannot reassign leads to other users or archive records.
  - `SUPER_ADMIN`: Restricted from accessing organization leads directly (HTTP 403 Forbidden).
- **Atomic Event Auditing:** Lead creation, updates, stage transitions, assignment changes, archiving, and restorations are committed alongside immutable activity records inside single PostgreSQL transactions (`withTransaction`).
- **Safe Dynamic Filtering & Sorting:** Safe parameterization with strict allowlists (`created_at`, `updated_at`, `name`, `company`, `status`), preventing SQL injection.

### Running Backend Tests
Execute all 6 automated test suites (Auth, Leads, Employees, Teams, Follow-ups, Dashboard - 103 tests total):
```bash
npm run test:api
# Or run individual test suites:
node --test apps/api/tests/auth.test.js
node --test apps/api/tests/leads.test.js
node --test apps/api/tests/employees.test.js
node --test apps/api/tests/teams.test.js
node --test apps/api/tests/followups.test.js
node --test apps/api/tests/dashboard.test.js
```

---

## 9. Employee & Team Management (Phase 6)

- **Employee Directory:** Secure account provisioning, Argon2 hashed temporary passwords, mandatory first-login password changes, role promotions, and safe deactivations.
- **Team Management:** Admin team creation, assignment of managers, single-active-membership invariant, and team-scoped workload distribution dashboards.
- **Role Boundary Scoping:** Managers are strictly bounded to their assigned teams. Leads cannot be assigned to employees outside managed teams.

---

## 10. Follow-ups & Task Scheduling (Phase 7)

- **Task Scheduling:** Schedule calls, emails, meetings, and general tasks with `due_at` timestamps and priority flags (`HIGH`, `MEDIUM`, `LOW`).
- **Dynamic Overdue Tracking:** Overdue tasks are dynamically calculated (`status = 'PENDING' AND due_at < NOW()`) and highlighted in red without stale cron dependencies.
- **Task Lifecycle:** Strict transitions from `PENDING` to terminal states `COMPLETED` or `CANCELLED`.
- **Outcome Logging:** Mandatory outcome capture with notes appended to lead audit histories.
- **In-App Notifications:** Automatic notifications created whenever tasks are assigned or reassigned to other team members.
- **Role Permissions:**
  - `ADMIN`: Full organization scheduling, reassignment, and KPI visibility.
  - `MANAGER`: Team-scoped scheduling, team member reassignment, and workload metrics.
  - `EMPLOYEE`: Self-assigned tasks only; cannot reassign to others.
  - `SUPER_ADMIN`: Forbidden from accessing organization follow-ups (HTTP 403).

---

## 11. Dashboard & Analytics (Phase 8)

- **Role-Aware Dashboards:**
  - `ADMIN`: Global organization visibility, complete sales funnel, lead creation & verified conversion velocity, team performance, and representative workload.
  - `MANAGER`: Scoped strictly to managed teams and their active members.
  - `EMPLOYEE`: Personal sales workspace with individual pipeline distribution and task execution health.
  - `SUPER_ADMIN`: Strictly isolated from tenant sales figures (HTTP 403 Forbidden).
- **KPI Metrics:** Total accessible leads, new leads in period (with % trend vs previous period), converted deals, lost leads, overall win rate, and pending tasks (with overdue warning).
- **Visualizations:** Custom lightweight, dependency-free SVG charts including interactive Lead Trend timeline, 7-stage Funnel progression, and Task health mix.
- **Date Range Filters:** Common filter supporting `Last 7 days`, `Last 30 days`, `Last 90 days`, `This month`, `Previous month`, and validated `Custom range` (up to 1 year).

---

## 12. Phase 9: Reports & Data Export Module

- **7 Tenant Report Categories:**
  - `Lead Report`: Volume, channels, status distribution, and assigned representatives.
  - `Conversion Report`: Won opportunities, conversion rates, and sales velocity (days to close).
  - `Lost Leads Report`: Deal drop-off points and qualitative loss reasons.
  - `Follow-up Report`: Execution rates, completed vs overdue scheduled tasks.
  - `Employee Performance Report`: Individual representative pipeline volume and win rates.
  - `Team Performance Report`: Aggregated team metrics, roster size, and team conversion rates.
  - `Activity Report`: Full system audit trail of customer interactions and status transitions.
- **Platform Governance Reports (Super Admin):**
  - Tenant organization growth and status (`/platform/reports/organizations`).
  - Cross-tenant user roles and active status (`/platform/reports/users`).
  - Strict tenant boundary isolation (Super Admin forbidden with HTTP 403 from organization sales data).
- **Multi-Format Export Engine:**
  - **CSV**: Full RFC 4180 compliance, UTF-8 BOM (`\uFEFF`) for spreadsheet compatibility, and Formula Injection Defense (CWE-1236) neutralizing leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
  - **Excel (.xlsx)**: Generated via `exceljs` featuring metadata header blocks, KPI summary panels, frozen headers, styled borders, and zebra row striping.
  - **PDF**: Generated via `pdfkit` featuring clean A4 landscape tables, executive summary cards, and dynamic buffered page numbering (`Page X of Y`).
- **Synchronous Execution:** Safe in-memory stream processing bounded by a 10,000-row safety limit (`LIMIT 10000`).

---

## 13. Starting Frontend and Backend

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

## 10. Database Administration and Safe Reset

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
