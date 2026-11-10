# Leadora — Business CRM & Lead Management SaaS

> **Every Lead. Every Opportunity. One Platform.**

**Leadora** is a clean, modern CRM platform for small and medium-sized businesses. It helps sales teams track prospective buyers, move deals through a visual 7-stage sales board, schedule follow-up calls, and download executive reports.

Multiple companies can use Leadora at the same time. Each company's data is completely separated, private, and secure.

---

## 1. Quickstart Guide (Run Locally in 4 Steps)

### Step 1: Install Required Software
Ensure you have installed on your computer:
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker Desktop**: With Docker Compose running
- **Git**

### Step 2: Install Project Dependencies
In your terminal, run:
```bash
npm install
```

### Step 3: Start the Database & Seed Sample Data
```bash
# 1. Start the PostgreSQL database container
npm run db:up

# 2. Run database migrations
npm run db:migrate

# 3. Add sample demo accounts, leads, and follow-ups
npm run db:seed
```

### Step 4: Start the Applications
```bash
npm run dev
```
- **Web App:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API:** Running at [http://localhost:5000](http://localhost:5000).

---

## 2. Sample Demo Accounts

The seed script creates ready-to-use demo accounts:

| Role | Email | Password | What You Can See |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@platform.com` | `Password123!` | Manages all tenant companies on the platform. |
| **Admin** | `admin@acme.com` | `Password123!` | Full company access (employees, teams, leads, settings). |
| **Manager** | `manager@acme.com` | `Password123!` | Oversees the sales team, leads, and member workloads. |
| **Employee** | `alice@acme.com` | `Password123!` | Works on their own assigned leads and tasks. |
| **Employee** | `bob@acme.com` | `Password123!` | Works on their own assigned leads and tasks. |

You can also test the system without logging in by opening the free **Interactive Live Demo** at [http://localhost:5173/demo](http://localhost:5173/demo).

---

## 3. Project Structure

```
business-crm/
├── apps/
│   ├── api/             # Backend Express server (Node.js ES Modules)
│   │   ├── src/
│   │   │   ├── config/  # Database connection and environment validation
│   │   │   ├── database/# SQL migrations and seed scripts
│   │   │   ├── modules/ # Business modules (auth, leads, teams, reports, etc.)
│   │   │   └── server.js# API entry point
│   │   └── tests/       # 13 automated test suites (166 passing tests)
│   │
│   └── web/             # Frontend React app (Vite + Tailwind CSS)
│       └── src/
│           ├── components/ # Reusable buttons, cards, modals, tables
│           ├── features/   # Feature components and state
│           ├── pages/      # Application screens (Kanban, Leads, Teams)
│           └── services/   # API communication (Axios)
│
├── docs/                # Organized Documentation Directory
│   ├── architecture/    # System design, requirements, and branding
│   ├── database/        # Tables, ERD diagram, and backup runbook
│   ├── api/             # API reference, endpoints, and workflows
│   ├── features/        # Leads, Kanban, Teams, Reports, Notifications
│   ├── frontend/        # Design system, pages map, and UI audit
│   ├── security/        # Role permissions matrix and hardening guide
│   └── operations/      # Deployment checklist and audit report
│
├── infrastructure/      # Docker Compose setup for PostgreSQL
├── .env.example         # Template for environment settings
├── package.json         # Root workspace scripts
└── README.md            # This quickstart guide
```

---

## 4. Key Features Explained

1. **Leads & 7-Stage Kanban Board:** Move opportunities from `New` to `Won` with simple drag-and-drop or dropdown menus.
2. **Follow-ups & Task Scheduling:** Schedule phone calls, meetings, demos, and tasks with automatic due-today and overdue badges.
3. **Teams & Workload Balancing:** Group sales reps into teams with dedicated managers to ensure fair lead distribution.
4. **Dashboard & Analytics:** Real-time KPI summary cards, win rates, and pipeline conversion trends.
5. **1-Click File Downloads:** Instant report downloads in **CSV**, **Excel (.xlsx)**, and **PDF** formats.
6. **In-App Notifications:** Real-time bell alerts when leads are assigned or follow-ups are due today.
7. **Company Settings:** Easily configure your company name, currency symbol (`$`, `€`, `£`, `₹`), and timezone.

---

## 5. Security Highlights

- **Multi-Tenant Privacy:** Every database query strictly filters by the user's verified company ID. One company can never see another company's data.
- **Protected Cookies:** Login sessions are stored in `HttpOnly` cookies so browser JavaScript cannot steal them.
- **Argon2 Passwords:** Passwords are never saved in plain text.
- **SQL Injection Defense:** All queries use safe parameterized placeholders (`$1, $2`).
- **Instant Cut-Off:** Deactivating an employee ends their active login session immediately.

---

## 6. Testing & Quality Checks

Run all automated checks with these commands:

```bash
# 1. Check code quality and formatting
npm run lint

# 2. Run the complete backend test suite (166 tests)
npm --workspace=apps/api test

# 3. Test building the frontend for production
npm run build:web
```

---

## 7. Documentation Directory

Detailed technical guides are organized in the [`docs/`](docs/README.md) folder:

- **Architecture:**
  - [System Architecture](docs/architecture/overview.md)
  - [Functional Requirements](docs/architecture/functional-requirements.md)
  - [Brand Identity & Style Guide](docs/architecture/branding.md)
- **Database:**
  - [Database Design & Schema](docs/database/database-design.md)
  - [Entity-Relationship Diagram (ERD)](docs/database/database-erd.md)
  - [Database Backup & Recovery Runbook](docs/database/backup-and-recovery.md)
- **API:**
  - [API Design & Conventions](docs/api/api-design.md)
  - [Complete API Endpoint Reference](docs/api/api-documentation.md)
  - [Application Workflows](docs/api/application-workflows.md)
- **Features:**
  - [Leads & Kanban Board](docs/features/lead-kanban.md)
  - [Follow-ups & Tasks](docs/features/followup-management.md)
  - [Teams & Employees](docs/features/team-management.md)
  - [Activity History](docs/features/activity-management.md)
  - [Dashboard & Analytics](docs/features/dashboard-analytics.md)
  - [Reports & Data Exports](docs/features/reporting-and-exports.md)
  - [In-App Notifications](docs/features/notifications.md)
  - [Organization Settings](docs/features/organization-settings.md)
  - [Platform Super Admin Management](docs/features/platform-management.md)
  - [Public Live Demo](docs/features/public-demo-environment.md)
- **Frontend:**
  - [Frontend Design System](docs/frontend/design-system.md)
  - [Frontend Pages & Navigation](docs/frontend/pages.md)
  - [UI & Accessibility Audit](docs/frontend/ui-audit.md)
- **Security:**
  - [Role Permissions Matrix](docs/security/role-permissions.md)
  - [Security Hardening Guide](docs/security/security-hardening.md)
- **Operations:**
  - [Environment Configuration Guide](docs/operations/environment-configuration.md)
  - [Production Deployment Checklist](docs/operations/production-deployment-checklist.md)
  - [Production Readiness Audit](docs/operations/production-readiness-audit.md)

---

## 8. Resetting the Database

If you ever want to completely reset and start fresh with sample data:

```bash
# 1. Stop and remove the database container and volume
docker compose -f infrastructure/docker/docker-compose.yml down -v

# 2. Start a fresh database container
npm run db:up

# 3. Apply all SQL migrations
npm run db:migrate

# 4. Seed demo accounts and sample data
npm run db:seed
```
