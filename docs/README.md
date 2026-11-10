# Leadora Documentation Directory

Welcome to the Leadora documentation. All technical guides and specifications are organized into simple, related folders below.

---

## 1. System Architecture & Requirements (`/docs/architecture/`)
Guides explaining how the application is designed and what it does.

- [System Architecture Overview](architecture/overview.md): How the backend, frontend, and database connect.
- [Functional Requirements](architecture/functional-requirements.md): What the CRM does and who uses it.
- [Brand Identity & Style Guide](architecture/branding.md): Brand colors, logo files, and typography.

---

## 2. Database & Schema (`/docs/database/`)
Everything about PostgreSQL tables, relationships, and data safety.

- [Database Design & Tables](database/database-design.md): All 10 tables, column definitions, and migration files.
- [Entity-Relationship Diagram (ERD)](database/database-erd.md): Visual diagram showing how tables connect.
- [Database Backup & Recovery Runbook](database/backup-and-recovery.md): How to back up and restore the database with `pg_dump`.

---

## 3. REST API Reference (`/docs/api/`)
Endpoints, response formats, and status codes.

- [API Design & Conventions](api/api-design.md): JSON response format, error envelopes, and status codes.
- [Complete API Endpoint Reference](api/api-documentation.md): List of all endpoints with allowed roles.
- [Application Workflows](api/application-workflows.md): Step-by-step flows for login, lead creation, and pipelines.

---

## 4. Features & Modules (`/docs/features/`)
How each business feature works.

- [Leads & Kanban Board](features/lead-kanban.md): Moving leads across the 7 visual sales stages.
- [Follow-ups & Task Scheduling](features/followup-management.md): Scheduling calls, meetings, and tracking overdue tasks.
- [Team & Employee Management](features/team-management.md): Managing sales staff, teams, and workloads.
- [Activity History & Audit Feed](features/activity-management.md): Automatic and manual timelines on leads.
- [Dashboard & Sales Analytics](features/dashboard-analytics.md): KPI metrics, win rates, and pipeline funnels.
- [Reports & Data Exports](features/reporting-and-exports.md): 1-click downloads for CSV, Excel (.xlsx), and PDF.
- [In-App Notifications](features/notifications.md): Alert bell for new lead assignments and task reminders.
- [Organization Settings](features/organization-settings.md): Setting company name, currency, and timezone.
- [Platform Super Admin Management](features/platform-management.md): Managing tenant company workspaces.
- [Public Live Demo](features/public-demo-environment.md): Free interactive demo mode without signing in.

---

## 5. Frontend & UI (`/docs/frontend/`)
The web user interface.

- [Frontend Design System](frontend/design-system.md): Colors, buttons, modals, and responsive layout rules.
- [Frontend Pages & Navigation](frontend/pages.md): Route map and screen descriptions.
- [Frontend UI & Accessibility Audit](frontend/ui-audit.md): Mobile responsiveness and accessibility checks.

---

## 6. Security & Permissions (`/docs/security/`)
Security rules, access control, and tokens.

- [Role Permissions Matrix](security/role-permissions.md): What Super Admins, Admins, Managers, and Reps can do.
- [Security Hardening Guide](security/security-hardening.md): Cookies, Argon2, token rotation, and SQL injection defense.

---

## 7. Operations & Deployment (`/docs/operations/`)
How to configure, test, and deploy Leadora.

- [Environment Configuration Guide](operations/environment-configuration.md): All `.env` settings explained.
- [Production Deployment Checklist](operations/production-deployment-checklist.md): Step-by-step launch checklist.
- [Production Readiness Audit](operations/production-readiness-audit.md): Comprehensive module health and security audit.

