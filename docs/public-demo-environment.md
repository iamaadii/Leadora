# Leadora — Interactive Public Demo Environment

## 1. Overview & Objectives

The **Leadora Public Demo Environment** provides prospective customers and visitors with a zero-friction, full-fidelity preview of the Leadora CRM & Lead Management platform without requiring account registration, credit cards, or login credentials.

Visitors can explore:
- **Interactive Sales Dashboard & KPIs**: Pipeline velocity, revenue trends, conversion rates, and leaderboard.
- **7-Stage Lead Pipeline & Kanban Board**: Full visibility across all 7 stages (*New, Contacted, Interested/Qualified, Proposal Sent, Negotiation, Won, Lost*).
- **Employee Directory & Multi-Tier Teams**: Hierarchical team structures with assigned managers, roster visibility, and workload capacity.
- **Task & Follow-up Scheduling**: Discovery calls, demos, and follow-ups with overdue and due-today indicators.
- **Chronological Activity Feed**: Complete timeline of logged calls, emails, rep notes, and stage transitions.
- **Analytics & Report Previews**: Real-time structured report previews.
- **In-App Notification Center**: Unread alerts, task reminders, and stage change notifications.

---

## 2. Security Guarantees & Multi-Tenant Data Isolation

Data isolation and platform security are the highest priority. The demo environment is isolated from production tenant workspaces through multi-layered defenses:

```
[ Visitor Browser ]
       |
       v (Clicks "Explore Live Demo")
[ POST /api/v1/auth/demo-session ]
       |
       v (Issues JWT with isDemo: true, role: 'DEMO', organizationId: 'leadora-demo-uuid')
[ Authenticate Middleware ]
       |
       +--> Method != 'GET' / 'HEAD' / 'OPTIONS' --> [ 403 Forbidden: DEMO_READ_ONLY ]
       +--> Route contains '/export'            --> [ 403 Forbidden: DEMO_EXPORT_DISABLED ]
       +--> Route starts with '/platform'       --> [ 403 Forbidden: DEMO_FORBIDDEN ]
       |
       v (Allowed Read-Only Request)
[ Parameterized SQL Queries ]
  WHERE organization_id = $1 (Strictly scoped to leadora-demo)
```

### 2.1 Backend Read-Only Enforcement
1. **HTTP Method Blocking**: Any non-idempotent request (`POST`, `PUT`, `PATCH`, `DELETE`) submitted with a demo token is intercepted at `apps/api/src/middleware/authenticate.middleware.js` and immediately rejected with HTTP status **403 Forbidden** and error code `DEMO_READ_ONLY`.
2. **Export Protection**: Route paths ending in `/export` or containing `export` are blocked with HTTP status **403 Forbidden** and error code `DEMO_EXPORT_DISABLED`.
3. **Platform Administration Lockdown**: Any request attempting to access platform administration endpoints (`/api/v1/platform/*`) or organization management is blocked with HTTP status **403 Forbidden** and error code `DEMO_FORBIDDEN`.
4. **Rate Limiting**: The demo session generation endpoint (`POST /api/v1/auth/demo-session`) is throttled to 10 session creations per 15-minute window per IP to prevent session exhaustion attacks.

### 2.2 Database Tenant Isolation
- Demo records reside exclusively inside a dedicated organization record (`slug: 'leadora-demo'`).
- Raw parameterized queries across repository layers continue to enforce `WHERE organization_id = $1`.
- A demo session token cannot query, see, or touch records belonging to any other production tenant.

---

## 3. Seeded Demo Dataset (Migration 013)

The demo workspace is provisioned via migration `apps/api/src/database/migrations/013_create_demo_organization.sql`:

### 3.1 Organization & Users
- **Organization**: `Leadora Demo Workspace` (slug: `leadora-demo`, currency: `USD`).
- **Viewer User**: `demo-viewer@leadora.example.com` (role: `DEMO`).
- **Admin User**: `alex.mercer@leadora.example.com` (role: `ADMIN`, VP of Sales).
- **Manager User**: `elena.rostova@leadora.example.com` (role: `MANAGER`, Enterprise Sales Lead).
- **Sales Rep**: `liam.chen@leadora.example.com` (role: `EMPLOYEE`, Senior Account Executive).

### 3.2 Sales Teams
- **Team**: `North America Enterprise`
- **Manager**: Elena Rostova
- **Members**: Liam Chen, Elena Rostova

### 3.3 Realistic Sample Leads
10 representative B2B SaaS leads across all pipeline stages:
1. **Apex Cloud Systems** (Stage: `NEW`, Source: `WEBSITE`, Rep: Liam Chen)
2. **Bluefin Financial Corp** (Stage: `CONTACTED`, Source: `LINKEDIN`, Rep: Liam Chen)
3. **Crestview Health Tech** (Stage: `INTERESTED`, Source: `REFERRAL`, Rep: Elena Rostova)
4. **Dynamic Logistics AI** (Stage: `QUALIFIED`, Source: `GOOGLE_SEARCH`, Rep: Liam Chen)
5. **Evergreen Retail Group** (Stage: `PROPOSAL_SENT`, Source: `COLD_OUTREACH`, Rep: Elena Rostova)
6. **Frontier Media Labs** (Stage: `PROPOSAL_SENT`, Source: `CONFERENCE`, Rep: Liam Chen)
7. **Global Horizon Energy** (Stage: `CONVERTED`, Source: `REFERRAL`, Rep: Alex Mercer)
8. **Highland Manufacturing** (Stage: `CONVERTED`, Source: `PARTNER`, Rep: Elena Rostova)
9. **Ironclad Cyber Security** (Stage: `LOST`, Source: `INBOUND_CALL`, Rep: Liam Chen)
10. **Jupiter Robotics** (Stage: `QUALIFIED`, Source: `WEBSITE`, Rep: Liam Chen)

### 3.4 Scheduled Follow-ups
- **Overdue Action**: Contract Redline Review with Apex Cloud Systems.
- **Due Today Action**: Product Architecture Walkthrough with Crestview Health Tech.
- **Upcoming Action**: Security Assessment & SOC2 Review with Dynamic Logistics AI.
- **Completed Action**: Executive Discovery Call with Global Horizon Energy.

---

## 4. Frontend Experience & UX Polish

### 4.1 Landing Page CTAs
Visitors can access the demo from three high-visibility points on `apps/web/src/pages/LandingPage.jsx`:
- **Top Navigation Bar**: Emerald-tinted button `"Explore Live Demo"`.
- **Hero Section**: Primary emerald action `"Explore Live Demo"`.
- **Bottom Call to Action Banner**: Highlighted button `"Explore Live Demo"`.
- **Mobile Drawer**: Quick access demo button.

### 4.2 Persistent Demo Banner
Every page rendered in demo mode displays a high-visibility amber banner at the top of the viewport:
```
[ DEMO MODE ] DEMO MODE: You are exploring a sample Leadora workspace. Changes are disabled and no real customer information is displayed.  [ Exit Demo ]
```
- Clicking **Exit Demo** immediately invokes `logout()`, purges memory tokens and TanStack Query cache, and routes the visitor cleanly back to `/`.

### 4.3 Dedicated Demo Route Tree (`/demo/*`)
Visitors explore the demo at isolated URLs matching standard CRM modules:
- `/demo` — Demo Dashboard & KPIs
- `/demo/leads` — Lead Table View
- `/demo/leads/kanban` — Interactive 7-Stage Kanban Board
- `/demo/leads/:id` — Lead Details, Timeline & Touchpoints
- `/demo/employees` — Employee Directory
- `/demo/teams` — Team Management
- `/demo/teams/:id` — Team Workload & Roster
- `/demo/follow-ups` — Follow-up Task List & Due Today Filters
- `/demo/activities` — Real-Time Activity Feed
- `/demo/notifications` — Notification Center
- `/demo/reports` — Analytics & Report Previews

### 4.4 User Action Feedback
When visitors attempt a create, update, delete, or export action:
- Frontend handlers and the centralized Axios response interceptor (`apps/web/src/services/api.js`) intercept the action.
- A toast notification is displayed:
  > **Demo Mode (Read-Only)**  
  > *"Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo."*

---

## 5. Verification & Automated Test Suite

A dedicated automated test suite is implemented in `apps/api/tests/demo-environment.test.js`:
- **Test 1**: Visitor can initialize demo session without credentials (`POST /api/v1/auth/demo-session` -> 200).
- **Test 2**: Demo visitor can read leads within demo organization (`GET /api/v1/leads` -> 200).
- **Test 3**: Demo visitor can read dashboard overview analytics (`GET /api/v1/dashboard/overview` -> 200).
- **Test 4**: Demo visitor can view employee directory and teams (`GET /api/v1/employees`, `GET /api/v1/teams` -> 200).
- **Test 5**: Demo visitor can read follow-ups and activities (`GET /api/v1/followups`, `GET /api/v1/activities` -> 200).
- **Test 6**: Demo visitor can preview reports (`GET /api/v1/reports/leads` -> 200).
- **Test 7**: Backend strictly blocks lead creation in demo mode (`POST /api/v1/leads` -> 403 `DEMO_READ_ONLY`).
- **Test 8**: Backend strictly blocks lead updates in demo mode (`PATCH /api/v1/leads/:id` -> 403 `DEMO_READ_ONLY`).
- **Test 9**: Backend strictly blocks lead deletion in demo mode (`DELETE /api/v1/leads/:id` -> 403 `DEMO_READ_ONLY`).
- **Test 10**: Backend strictly blocks employee and team creation in demo mode (`POST /api/v1/employees`, `POST /api/v1/teams` -> 403 `DEMO_READ_ONLY`).
- **Test 11**: Backend strictly blocks settings and profile modifications (`PATCH /api/v1/organization/settings` -> 403 `DEMO_READ_ONLY`).
- **Test 12**: Backend strictly blocks report data export (`GET /api/v1/reports/leads/export` -> 403 `DEMO_EXPORT_DISABLED`).
- **Test 13**: Backend strictly blocks platform administration (`GET /api/v1/platform/organizations` -> 403 `DEMO_FORBIDDEN`).
- **Test 14**: Regular production user permissions remain completely intact.

Run tests:
```bash
node --test apps/api/tests/demo-environment.test.js
```

