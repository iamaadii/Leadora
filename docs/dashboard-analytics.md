# Dashboard & Analytics Architecture Specification

This document details the design, role-based scoping, query aggregation methodology, and KPI definitions implemented in Phase 8 of the Business CRM & Lead Management System.

---

## 1. Architecture Overview

The Dashboard and Analytics module converts existing CRM operational data (leads, follow-ups, teams, employees, and activities) into actionable business intelligence.

- **Server-Driven Calculations**: All metric calculations, stage counts, and time-series aggregations occur inside PostgreSQL via parameterized queries using native functions (`COUNT`, `FILTER`, `DATE_TRUNC`, and joins). No raw CRM rows are loaded into Node.js simply to count records.
- **Strict Multi-Tenant Isolation**: Every database aggregation is parameterized with `organization_id = $1`.
- **Role-Aware Scoping**: The backend dynamically enforces distinct boundaries based on `req.user.role`:
  - `SUPER_ADMIN`: Forbidden from accessing organization sales data (HTTP 403).
  - `ADMIN`: Organization-wide analytics across all teams, employees, leads, and follow-ups.
  - `MANAGER`: Strictly bounded to active teams they manage and leads assigned to them or their team members.
  - `EMPLOYEE`: Personal sales workspace; restricted to self-assigned or self-created leads and tasks. Team and employee performance endpoints return HTTP 403 Forbidden.

---

## 2. Role-Specific Dashboard Views

### 2.1 Platform Super Admin (`SUPER_ADMIN`)
Super Admins manage the multi-tenant SaaS platform and do not participate in tenant sales pipelines.
- Organization dashboard endpoints return HTTP 403 (`FORBIDDEN`).
- The frontend presents an administrative governance notice confirming that tenant sales data is isolated and provides navigation to tenant management.

### 2.2 Organization Administrator (`ADMIN`)
Executive dashboard tracking organization-wide sales health:
- **Global KPI Cards**: Total active leads, new leads in period (with % trend vs previous period), converted leads, lost leads, overall conversion rate, and pending follow-ups (with overdue warning).
- **Pipeline Funnel**: Complete lifecycle stage distribution across all 7 stages (`NEW`, `CONTACTED`, `INTERESTED`, `QUALIFIED`, `PROPOSAL_SENT`, `CONVERTED`, `LOST`).
- **Lead & Conversion Trends**: Date-based time-series chart showing lead creation velocity alongside verified historical conversion events.
- **Task Health**: Overall completion rate, touchpoint mix (Calls, Emails, Meetings, Tasks), and overdue task warning.
- **Team Performance**: Roster of all organization teams with member count, total active leads, won deals, lost deals, pending tasks, overdue tasks, and win rate.
- **Representative Performance**: Workload breakdown for all active organization sales reps.
- **Recent Engagements**: Chronological stream of the latest customer interactions across the company.

### 2.3 Sales Team Manager (`MANAGER`)
Operational command center scoped exclusively to teams led by the manager:
- **Team KPIs**: Metrics calculated strictly across members of active teams where `teams.manager_id = req.user.id`.
- **Team Pipeline Funnel**: Lead counts by stage within the manager's team scope.
- **Team Workload & Representative Breakdown**: Workload and win rates for active team members.
- **Boundary Invariants**: Managers cannot view other managers' teams, unmanaged teams, or organization-wide performance totals.

### 2.4 Sales Representative (`EMPLOYEE`)
Personal sales workspace:
- **Personal KPIs**: My active leads, my new leads created in period, my converted deals, my win rate, and my pending/overdue tasks.
- **Personal Pipeline**: My individual pipeline distribution.
- **Personal Task Health**: My task completion rate and upcoming touchpoints.
- **Access Restrictions**: Endpoints `/dashboard/team-performance` and `/dashboard/employee-performance` return HTTP 403 Forbidden. Other representatives' private performance is never exposed.

---

## 3. KPI Definitions & Mathematical Formulas

| KPI | Meaning | Database Formula / Source |
| :--- | :--- | :--- |
| **Total Leads** | Active non-archived leads in scope | `COUNT(*) FILTER (WHERE l.archived_at IS NULL)` |
| **New Leads** | Leads created within selected date range | `COUNT(*) FILTER (WHERE l.archived_at IS NULL AND l.created_at >= $start AND l.created_at <= $end)` |
| **Converted Deals** | Currently won leads in scope | `COUNT(*) FILTER (WHERE l.archived_at IS NULL AND l.status = 'CONVERTED')` |
| **Lost Leads** | Currently lost leads in scope | `COUNT(*) FILTER (WHERE l.archived_at IS NULL AND l.status = 'LOST')` |
| **Conversion Rate (%)** | Ratio of converted to total active leads | `(convertedLeads / totalLeads) * 100` (rounded to 1 decimal place; `0%` if `totalLeads = 0`) |
| **Period Conversions** | Verified conversion events logged in period | `COUNT(*) FROM activities WHERE activity_type = 'LEAD_STATUS_CHANGED' AND metadata->>'to' = 'CONVERTED' AND created_at >= $start AND created_at <= $end` |
| **Pending Tasks** | Authorized open follow-ups | `COUNT(*) FROM followups WHERE status = 'PENDING'` |
| **Overdue Tasks** | Tasks whose scheduled time has passed | `COUNT(*) FROM followups WHERE status = 'PENDING' AND due_at < NOW()` |
| **Due Today Tasks** | Tasks scheduled for current calendar day | `COUNT(*) FROM followups WHERE status = 'PENDING' AND due_at >= CURRENT_DATE AND due_at < CURRENT_DATE + INTERVAL '1 day'` |
| **Completed Tasks** | Tasks finished in selected period | `COUNT(*) FROM followups WHERE status = 'COMPLETED' AND completed_at >= $start AND completed_at <= $end` |
| **Task Completion Rate**| Execution efficiency percentage | `(completed / totalTasks) * 100` |

### Period Comparison & Trend Calculation
When evaluating period metrics against the previous equivalent window $[start - duration, start]$:
$$\text{Trend } (\%) = \frac{\text{Current Period} - \text{Previous Period}}{\text{Previous Period}} \times 100$$
If the previous period is `0`: returns `+100%` if current $> 0$, or `0%` if current $= 0$.

---

## 4. Date Range & Timezone Handling

- **UTC Boundary Enforcement**: All query boundaries (`startDate`, `endDate`) are normalized to UTC `TIMESTAMPTZ` values.
- **Supported Ranges**:
  - `7d`: `NOW() - INTERVAL '7 days'` to `NOW()`
  - `30d` (default): `NOW() - INTERVAL '30 days'` to `NOW()`
  - `90d`: `NOW() - INTERVAL '90 days'` to `NOW()`
  - `this_month`: `DATE_TRUNC('month', NOW())` to `NOW()`
  - `prev_month`: Start of previous month to end of previous month.
  - `custom`: Client provides ISO dates. Validated by Zod middleware: requires `startDate <= endDate` and max duration of 366 days.
- **Interval Aggregation**:
  - Daily buckets: `DATE_TRUNC('day', ...)`
  - Weekly buckets: `DATE_TRUNC('week', ...)`
  - Monthly buckets: `DATE_TRUNC('month', ...)`

---

## 5. API Endpoints

All endpoints are mounted at `/api/v1/dashboard` and require authentication.

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/overview` | Admin, Manager, Employee | Role-scoped KPI summary cards and period trends |
| `GET` | `/lead-pipeline` | Admin, Manager, Employee | Distribution across all 7 pipeline stages |
| `GET` | `/lead-trends` | Admin, Manager, Employee | Time-series lead creation and historical conversions |
| `GET` | `/followup-analytics` | Admin, Manager, Employee | Status, type, and priority follow-up metrics |
| `GET` | `/team-performance` | Admin, Manager | Team-level workload, member count, and conversion rates |
| `GET` | `/employee-performance` | Admin, Manager | Representative workload and performance |
| `GET` | `/recent-activity` | Admin, Manager, Employee | Chronological audit engagement feed |

