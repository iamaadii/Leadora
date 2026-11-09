# Reports & Data Export Architecture Specification

## 1. Architectural Overview

The **Reports & Data Export Module** (Phase 9) provides robust operational intelligence and compliant, multi-format tabular data extraction for the Business CRM SaaS platform.

### Core Architectural Principles
1. **Multi-Tenant Isolation**: All tenant reporting queries are scoped strictly to the requesting user's `organization_id`.
2. **Platform Super Admin Isolation**: Super Admins possess system-level governance reports (`/platform/reports/organizations`, `/platform/reports/users`) but are explicitly forbidden (HTTP 403) from accessing private organization sales data (`/reports/*`).
3. **Role-Based Scoping**:
   - `ADMIN`: Organization-wide analytics and unconstrained exports.
   - `MANAGER`: Reports strictly scoped to members of teams managed by that manager.
   - `EMPLOYEE`: Personal productivity reports scoped to assigned/created records.
4. **Synchronous Export Pipeline**:
   - Data exports (CSV, Excel, PDF) are processed synchronously in-memory using lightweight libraries (`exceljs` and `pdfkit`) with a 10,000-row safety limit (`LIMIT 10000`).
   - Zero heavyweight background workers or message queues needed.
5. **Security & Injection Mitigation**:
   - **Formula Injection Defense (CWE-1236)**: Every string cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is safely prefixed with a single quote (`'`) to neutralize dynamic formula execution in spreadsheet software.
   - **RFC 4180 Compliance**: Double quotes escaped (`""`), newline and comma delimiters safely quoted.
   - **UTF-8 BOM**: `\uFEFF` byte order mark prepended to CSV outputs ensuring clean character rendering in Microsoft Excel across operating systems.

---

## 2. Report Categories

### 2.1 Tenant Operational Reports (`/api/v1/reports/:reportType`)

| Category (`reportType`) | Title | Description | Primary Metrics |
| :--- | :--- | :--- | :--- |
| `leads` | Lead Pipeline & Acquisition | Pipeline stage distribution, channels, assigned reps | Total Leads, Stage Breakdown, Source Breakdown |
| `conversions` | Lead Conversion & Sales Velocity | Converted leads, deal velocity, days from creation to win | Total Won Leads, Overall Win Rate, Avg Days to Convert |
| `lost-leads` | Lost Deals & Drop-off Diagnostics | Lost opportunities and drop-off notes | Lost Deals, Drop-off Rate (%), Loss Notes |
| `followups` | Follow-up Tasks & Scheduling | Follow-up schedules, completed vs overdue tasks | Total Follow-ups, Completed, Overdue, Completion Rate |
| `employees` | Sales Rep Performance | Individual rep productivity and conversion ratios | Active Reps, Assigned Leads, Won Leads, Conversion Rate |
| `teams` | Team Performance & Workload | Aggregated team-level leads and win rates | Total Teams, Team Leads, Won Leads, Team Win Rate |
| `activities` | System Activity & Audit Log | Comprehensive audit trail of system events | Total Events, Actor Breakdown, Timeline |

### 2.2 Platform Governance Reports (`/api/v1/platform/reports/:reportType`)

| Category (`reportType`) | Title | Description | Primary Metrics |
| :--- | :--- | :--- | :--- |
| `organizations` | Platform Organizations & Growth | Tenant lifecycle, growth, and volume | Total Organizations, Active vs Inactive Tenants, User/Lead Counts |
| `users` | Platform Users & Role Distribution | Cross-platform user roles and security | Total Users, Role Distribution (Admin, Manager, Rep), Active Status |

---

## 3. Data Export Specifications

### 3.1 CSV Export (`format=csv`)
- **MIME Type**: `text/csv; charset=utf-8`
- **Specification**: RFC 4180
- **Prefix**: `\uFEFF` (UTF-8 BOM)
- **Formula Mitigation**: Prepends `'` to dangerous start characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Headers**:
  ```http
  Content-Type: text/csv; charset=utf-8
  Content-Disposition: attachment; filename="leads-report-2026-11-10.csv"
  ```

### 3.2 Excel Export (`format=excel`)
- **MIME Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Library**: `exceljs`
- **Features**:
  - Title & Organization header block.
  - Formatted KPI summary overview box.
  - Frozen top header row with Slate-800 (`#1E293B`) solid background and bold white typography.
  - Auto-fitted column widths (12 to 45 chars) with cell borders.
  - Alternating zebra row striping (`#FFFFFF` and `#F8FAFC`).
  - Native Excel date and percentage formatting.

### 3.3 PDF Export (`format=pdf`)
- **MIME Type**: `application/pdf`
- **Library**: `pdfkit`
- **Features**:
  - A4 Landscape layout for wide enterprise tabular grids.
  - Formal corporate title banner with organization metadata and generation timestamps.
  - Executive KPI summary card block.
  - Slate header row with crisp white text.
  - Alternating zebra row backgrounds and subtle horizontal dividers.
  - Automatic multi-page pagination with buffered "Page X of Y | Business CRM Confidential" footers.

---

## 4. API Endpoints

### 4.1 Tenant Report Endpoints
- `GET /api/v1/reports/:reportType`
  - Query parameters: `range` (`today`, `7d`, `30d`, `90d`, `this_month`, `prev_month`, `custom`), `startDate`, `endDate`, `status`, `source`, `teamId`, `assignedToId`, `page`, `limit`, `sortBy`, `sortOrder`.
  - Roles: `ADMIN`, `MANAGER`, `EMPLOYEE` (HTTP 403 for `SUPER_ADMIN`).
- `GET /api/v1/reports/:reportType/export?format=csv|excel|pdf`
  - Direct file download with appropriate `Content-Disposition`.
- `POST /api/v1/reports/:reportType/export`
  - Body payload supporting export filters and format.

### 4.2 Platform Super Admin Endpoints
- `GET /api/v1/platform/reports/organizations`
  - Roles: `SUPER_ADMIN` only (HTTP 403 for tenant users).
- `GET /api/v1/platform/reports/users`
  - Roles: `SUPER_ADMIN` only.
- `GET /api/v1/platform/reports/:reportType/export?format=csv|excel|pdf`
  - Direct binary file download for platform governance data.

---

## 5. Security & Access Control Matrix

| User Role | Tenant Reports (`/reports/*`) | Tenant Exports | Platform Reports (`/platform/reports/*`) | Data Scope |
| :--- | :---: | :---: | :---: | :--- |
| **Super Admin** | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ Full Access | Platform-wide aggregate metrics only; zero access to tenant sales. |
| **Admin** | ✅ Full Access | ✅ Full Access | ❌ 403 Forbidden | Full organization dataset. |
| **Manager** | ✅ Scoped Access | ✅ Scoped Access | ❌ 403 Forbidden | Scoped to self + active members of managed teams. |
| **Employee** | ✅ Scoped Access | ✅ Scoped Access | ❌ 403 Forbidden | Scoped strictly to assigned or created leads/tasks. |

