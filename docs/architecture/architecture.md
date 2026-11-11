# System Architecture & Requirements

This document provides a comprehensive guide to the Leadora CRM system architecture, business requirements, sales pipeline lifecycle, and brand identity.

---

## 1. System Architecture Overview

Leadora is built as a **Modular Monolith** designed for developer ergonomics, multi-tenant safety, low operational overhead, and robust data integrity.

### Architectural Philosophy

- **Unified Codebase:** Backend logic resides in `apps/api` and frontend in `apps/web`.
- **Low Operational Overhead:** No microservice sprawl. Run a single Node.js backend instance, a single Vite/Nginx frontend instance, and a PostgreSQL database.
- **Transactional Consistency:** Relational actions (e.g. moving lead stages, appending activity history, updating notification counters) execute inside atomic database transactions (`BEGIN ... COMMIT`) that roll back completely on error.
- **Low Latency:** In-process service invocation eliminates internal network latency and RPC overhead.

```
+-------------------------------------------------------------------------------+
|                             REACT FRONTEND (Vite)                             |
|          React Router  |  TanStack Query  |  Tailwind CSS  |  Axios           |
+-------------------------------------------------------------------------------+
                                        |
                          HTTP / REST API (JSON)
                                        |
+-------------------------------------------------------------------------------+
|                            EXPRESS BACKEND (Node.js)                          |
|                                                                               |
|   1. ROUTES       : Match URL paths (like /api/v1/leads)                      |
|         │                                                                     |
|         ▼                                                                     |
|   2. MIDDLEWARE   : Check login cookie, check user role, validate inputs      |
|         │                                                                     |
|         ▼                                                                     |
|   3. CONTROLLERS  : Read the request, call the service, send JSON response    |
|         │                                                                     |
|         ▼                                                                     |
|   4. SERVICES     : Business rules, check permissions, handle logic           |
|         │                                                                     |
|         ▼                                                                     |
|   5. REPOSITORIES : Run raw SQL queries with safe placeholders ($1, $2)       |
|         │                                                                     |
|         ▼                                                                     |
|   6. POSTGRESQL   : Relational database with strict organization data filters |
+-------------------------------------------------------------------------------+
```

---

## 2. Backend Layered Architecture

Every backend component has a dedicated responsibility:

1. **Routes (`routes/*.js`)**
   - Connects HTTP methods and URL paths (e.g., `POST /api/v1/leads`) to relevant middleware and controllers.
   - Contains zero business logic.
2. **Middleware (`middleware/*.js`)**
   - `authenticate.middleware.js`: Validates the JWT cookie and attaches user context (`userId`, `organizationId`, `role`).
   - `authorize.middleware.js`: Enforces role-based permissions (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`).
   - `rate-limit.middleware.js`: Protects authentication and public endpoints from brute-force attempts.
   - `error.middleware.js`: Global error trap returning structured error envelopes without leaking stack traces.
3. **Controllers (`controllers/*.js`)**
   - Extracts request parameters, body, and query filters.
   - Delegates execution to the domain Service.
   - Returns standardized JSON envelopes. Never executes SQL.
4. **Services (`services/*.js`)**
   - Core domain business logic.
   - Enforces access boundaries (e.g., Managers restricted to their team; Reps restricted to assigned leads).
   - Manages multi-table database transactions.
5. **Repositories (`repositories/*.js`)**
   - Sole layer containing raw SQL queries.
   - Strictly utilizes parameterized queries (`$1, $2`) to guarantee SQL injection immunity.
6. **Database Configuration (`config/database.js`)**
   - Manages PostgreSQL connection pooling via `pg`.
   - Provides `withTransaction(callback)` for atomic commit/rollback workflows.

---

## 3. Database Transactions Pattern

Multi-step mutations execute within transactions:

```javascript
export async function createLeadWithActivity(leadData, user) {
  return await withTransaction(async (client) => {
    // 1. Create the lead
    const lead = await leadRepository.create(client, leadData);

    // 2. Append creation log to activities
    await activityRepository.create(client, {
      organizationId: user.organizationId,
      leadId: lead.id,
      actorUserId: user.id,
      activityType: "LEAD_CREATED",
      description: `Lead created by ${user.firstName} ${user.lastName}`,
    });

    // 3. Dispatch in-app notification if assigned to another user
    if (lead.assignedToId && lead.assignedToId !== user.id) {
      await notificationRepository.create(client, {
        organizationId: user.organizationId,
        userId: lead.assignedToId,
        title: "New Lead Assigned",
        message: `You were assigned lead "${lead.name}".`,
        notificationType: "LEAD_ASSIGNED",
      });
    }

    return lead;
  });
}
```

---

## 4. Multi-Tenant Isolation Architecture

Data security between companies is enforced at multiple layers:

1. **Database Schema Enforcement**: Every business table contains an `organization_id` column.
2. **Token-Derived Isolation**: When an authenticated user makes an API request, `organization_id` is read from their cryptographically signed JWT token—never trusted from user request bodies or query params.
3. **Repository Filter Guardrails**: All SQL queries append `WHERE organization_id = $1`.
4. **Cross-Tenant Constraint Checks**: Foreign keys validate composite references `(organization_id, id)` so records from one tenant cannot link to entities of another.

---

## 5. Functional Requirements

### 1. User Roles & Personas

- **Platform Super Admin:** Oversees the entire SaaS installation, provisions customer organizations, and reviews cross-tenant system health. Has `organization_id = NULL`.
- **Tenant Administrator:** Manages company profile, invites employees, assigns roles, defines teams, and accesses company-wide reports.
- **Sales Manager:** Manages team roster, monitors team member lead distribution, reviews pipeline conversion rates, and tracks follow-up tasks.
- **Sales Representative (Employee):** Manages assigned leads, logs activities, schedules and completes follow-ups, and updates deal progress through the Kanban board.

### 2. Core Functional Modules

- **Authentication & Security:** Cookie-based JWT sessions, Argon2 password hashing, token rotation, and rate-limiting.
- **Lead & Pipeline Management:** 7-stage visual Kanban pipeline, full lead directory with filters, and detail timeline view.
- **Follow-up & Task Tracking:** Call/meeting/task scheduler with real-time Overdue and Due Today tracking.
- **Team Management:** Hierarchical team structures with manager boundaries.
- **Reports & 1-Click Exports:** Native streaming downloads for CSV, Excel (.xlsx), and PDF formats with spreadsheet formula injection protection.
- **Real-Time Notifications:** Server-Sent Events (SSE) notification stream backed by an in-app alert center.

---

## 6. Pipeline Lifecycle & Canonical Stages

The sales pipeline follows 7 strict canonical stages enforced by database constraints (`chk_lead_status`):

```
NEW ──> CONTACTED ──> INTERESTED ──> QUALIFIED ──> PROPOSAL_SENT ──> CONVERTED
  │         │              │             │              │
  └───-─────┴──────────────┴─────────────┴──────────────┴───────────────> LOST
```

### Stage Definitions

1. **`NEW`**: Inbound lead or newly sourced contact awaiting initial outreach.
2. **`CONTACTED`**: Initial outreach completed (call logged, email sent).
3. **`INTERESTED`**: Lead has expressed requirement or positive intent.
4. **`QUALIFIED`**: Budget, Authority, Need, and Timeline (BANT) validated.
5. **`PROPOSAL_SENT`**: Formal quotation or proposal delivered.
6. **`CONVERTED`**: Deal won! Customer signed or contract closed.
7. **`LOST`**: Deal lost. **Requires mandatory Loss Reason selection and optional notes.**

### Mandatory Loss Reason Workflow

When a lead is moved to `LOST` (via Kanban drag-and-drop or status selector):

- The UI presents the `MarkLeadAsLostModal`.
- The user must select a standardized loss reason (e.g., _Price too high_, _Chose competitor_, _Budget unavailable_, _Other_).
- If _Other_ is selected, an explanatory note is mandatory.
- The reason and notes are transactionally stored in `leads.loss_reason`, `leads.loss_notes`, and logged as an immutable `LEAD_STATUS_CHANGED` activity entry.

---

## 7. Brand Identity & Style Guide

- **Brand Name:** Leadora
- **Tagline:** Every Lead. Every Opportunity. One Platform.
- **Brand Purpose:** A clean, responsive, enterprise-ready CRM platform engineered for high-velocity sales teams.

### Logo & Brand Assets

- **Full Logo:** `/brand/leadora-logo.svg` (Navigation headers, login screen, email headers)
- **Small Icon:** `/brand/leadora-icon.svg` (Mobile header, collapsed sidebar)
- **Browser Favicon:** `/brand/favicon.svg` (Browser tab icon)

### Brand Color Palette

| Color Name        | Hex Code  | Purpose                                                       |
| :---------------- | :-------: | :------------------------------------------------------------ |
| **Royal Blue**    | `#2563EB` | Primary CTA buttons, active navigation states, key highlights |
| **Indigo**        | `#4F46E5` | Gradient headers and brand badges                             |
| **Emerald Green** | `#10B981` | Converted deals, success banners, live demo indicators        |
| **Dark Navy**     | `#0F172A` | Landing page backdrop, dark mode chrome, primary typography   |
| **Light Slate**   | `#F8FAFC` | Main application background                                   |
| **Pure White**    | `#FFFFFF` | Cards, modals, data tables                                    |
| **Slate Gray**    | `#64748B` | Secondary descriptions, timestamps, metadata                  |
| **Border Slate**  | `#E2E8F0` | Dividers, table borders, input outlines                       |

### React Brand Component Usage

```jsx
import { BrandLogo } from "../components/brand/BrandLogo.jsx";

// Full dark theme logo with subtitle
<BrandLogo
  variant="full"
  size="md"
  theme="dark"
  showSubtitle={true}
  subtitleText="CRM & Pipeline Platform"
/>;
```
