# Leadora Documentation Directory

Welcome to the Leadora documentation directory. The documentation has been consolidated into 7 comprehensive domain guides for clarity, fast navigation, and streamlined maintenance.

---

## 1. [System Architecture & Requirements](architecture/architecture.md)

Comprehensive technical overview of Leadora:

- **Modular Monolith Architecture**: Clean separation between React frontend (`apps/web`) and Express backend (`apps/api`).
- **Transactional Consistency**: Multi-table atomic operations with `withTransaction()`.
- **Multi-Tenant Isolation**: Database-level and token-derived tenant boundaries.
- **Pipeline Lifecycle**: The 7 canonical stages and mandatory Loss Reason workflows.
- **Brand Identity & Style Guide**: Logo assets, color codes, and reusable React brand components.

---

## 2. [Database Design, Schema & Operations](database/database.md)

Complete relational schema specifications and database runbooks:

- **The 10 Core Tables**: Detailed column definitions, constraints, and composite foreign keys.
- **Entity-Relationship Diagram (ERD)**: Visual Mermaid diagram mapping system relationships.
- **SQL Migrations Reference**: Sequential migration history (`001` to `012`).
- **Backup & Recovery Runbook**: Instant `pg_dump` backup, `pg_restore`, and daily automated cron backup script.

---

## 3. [REST API Design & Complete Reference](api/api-reference.md)

Full backend API reference:

- **Conventions & Standards**: Base URL, HTTP status codes, standard success/error JSON response envelopes.
- **Application Workflows**: Sequence and flowchart diagrams for authentication and lead creation.
- **Endpoint Reference Matrix**: Complete route tables for Auth, Leads, Follow-ups, Employees, Teams, Dashboard, Reports, Notifications, Settings, and Super Admin.

---

## 4. [Features & Functional Modules Handbook](features/features.md)

In-depth specifications for all business modules:

- **Leads & Kanban Pipeline**: Interactive 7-stage visual board with drag-and-drop and filter controls.
- **Follow-ups & Task Scheduling**: Real-time Overdue and Due Today tracking with outcome notes.
- **Team & Employee Management**: Organizational hierarchy, manager boundaries, and single-team membership rules.
- **Activity History & Audit Feed**: Automated event tracking and manual touchpoint logging.
- **Dashboard & Sales Analytics**: Executive KPI cards, funnel metrics, and team leaderboards.
- **Reports & 1-Click Exports**: Streaming downloads in CSV (formula injection safe), Excel (.xlsx), and PDF.
- **Real-Time Notifications (SSE)**: Server-Sent Events stream with 25-second heartbeat keepalive.
- **Organization Settings & Demo Mode**: Workspace configuration and sandboxed public demo mode.

---

## 5. [Frontend Design System, Pages & UI Guide](frontend/frontend.md)

Frontend user experience and design reference:

- **Visual Design Tokens**: High-contrast color palette, font scales, and semantic styling tokens.
- **Reusable UI Components**: Modals, buttons, form controls, badges, and page headers.
- **Application Route Map**: Complete screen routing and navigation breakdown.
- **Responsive & Accessibility Standards**: Screen breakpoints (mobile, tablet, desktop) and WCAG AA compliance.

---

## 6. [Security, Authentication & Role Permissions Guide](security/security.md)

Security controls and authorization specifications:

- **Token Architecture**: 10-minute in-memory access tokens, HttpOnly refresh cookies, and automatic rotation.
- **Cryptographic Protection**: Argon2id password hashing, timing-attack resistance, and parameterized SQL.
- **Multi-Tenant Protection**: Strict tenant isolation derived from cryptographically verified claims.
- **Role Permissions Matrix (RBAC)**: Detailed capabilities matrix across Super Admin, Admin, Manager, and Employee.

---

## 7. [Operations, Deployment & Administration Guide](operations/operations.md)

Operational deployment and administration runbook:

- **Environment Configuration**: Complete `.env` variable reference and cryptographic secret generation.
- **Super Admin Provisioning CLI**: Interactive and non-interactive `npm run admin:create` bootstrap instructions.
- **Production Docker Guide**: Multi-container Docker Compose architecture and Nginx reverse proxy configuration.
- **Production Readiness Audit**: Verification status across all 10 core system modules.
- **Deployment Checklist**: Step-by-step pre-flight, launch, and smoke-testing procedures.
