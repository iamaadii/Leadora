# Features & Functional Modules Handbook

This document serves as the comprehensive user and engineering handbook for all functional modules in Leadora.

---

## 1. Leads & Visual Kanban Pipeline

The Kanban board provides an interactive 7-stage visualization of active sales deals.

### The 7 Canonical Sales Stages

1. **New:** Newly ingested leads awaiting initial contact.
2. **Contacted:** Outreach initiated via phone, email, or message.
3. **Interested:** Prospect expressed interest or shared requirements.
4. **Qualified:** Budget, authority, need, and timeline (BANT) confirmed.
5. **Proposal Sent:** Quote, pitch deck, or formal agreement delivered.
6. **Converted:** Deal won! Customer signed or onboarded.
7. **Lost:** Deal closed without conversion. **Requires mandatory Loss Reason and optional notes.**

### User Interactions

- **Drag & Drop:** Move cards between columns. Triggers optimistic UI update and background API synchronization.
- **Card Stage Dropdown:** Keyboard and mobile-accessible alternative to drag-and-drop.
- **Quick Filters & Search:** Instantly filter cards by lead name, company, assignee, source, and priority.
- **Toggle View:** 1-click toggle between the visual Kanban board (`/leads/kanban`) and the tabular data list (`/leads`).

---

## 2. Follow-ups & Task Scheduling

The Follow-ups module guarantees sales prospects never slip through the cracks.

### Task Specifications

- **Type:** `CALL` (phone), `EMAIL` (outreach), `MEETING` (demo/in-person), `TASK` (general to-do).
- **Priority:** `LOW`, `MEDIUM`, `HIGH`.
- **Due Date:** Absolute timestamp.
- **Assigned Rep:** Salesperson responsible for completion.

### Dynamic Task Queues

- **All:** Complete list of scheduled tasks with date filters.
- **Due Today:** Tasks scheduled for today, highlighted for priority completion.
- **Overdue:** Tasks whose `due_at` has passed without completion, prominently flagged with red warning badges.
- **Completed:** Read-only archive of completed tasks with mandatory outcome notes.

### Completion Workflow

To complete a task, users click **Complete** and record an outcome note (e.g., _"Demo successful; customer requested pricing proposal for 25 seats"_). Completed and cancelled tasks are locked from further editing.

---

## 3. Team & Employee Management

Enables organizations to structure their sales hierarchy and enforce management boundaries.

### Employee Management

- **Invite Staff:** Add users with name, email, and system role (`ADMIN`, `MANAGER`, `EMPLOYEE`).
- **Temporary Passwords:** Newly created accounts receive a temporary password and must set a personal password upon first login.
- **Role Elevation:** Admins can promote employees or reassign roles.
- **Instant Deactivation:** Revokes user sessions immediately, terminating API access across all devices.

### Team Structures

- Admins can create named teams (e.g., _"Enterprise Sales"_, _"Inbound SDRs"_) and assign a Manager.
- **One Active Team per Employee:** PostgreSQL constraints ensure an employee can belong to at most one active team at a time.
- **Manager Data Isolation:** Managers can only view leads, follow-ups, and members belonging to their designated team.

---

## 4. Activity History & Audit Feed

Maintains an immutable chronological timeline of every interaction on a lead.

### Automated Events

The system automatically logs:

- Lead creation and initial assignment
- Stage transitions (with previous and new status)
- Reassignment events between reps
- Follow-up creation, completion (with notes), and cancellation
- Soft-deletion (archiving) and restoration

### Manual Touchpoint Logging

Sales reps can record real-time interaction notes:

- **Call Note:** Call duration, discussion summary, and outcome.
- **Meeting Note:** Attendees, demo takeaways, and action items.
- **Email Note:** Summary of email exchanges.
- **General Note:** Internal background context.

---

## 5. Dashboard & Sales Analytics

Provides real-time visibility into pipeline velocity, deal values, and sales performance.

### KPI Summary Cards

- **Total Pipeline Value:** Sum of estimated values across all active deals.
- **Active Leads:** Total unarchived leads in progress.
- **Win Rate:** Percentage of closed deals that were won (`Won / (Won + Lost)`).
- **Follow-ups Due Today:** Real-time count of tasks requiring action today.

### Visual Analytics

- **Pipeline Funnel:** Deal count and cumulative dollar value across each stage.
- **Lead Trends:** Inbound lead volume tracked over time by day, week, or month.
- **Follow-up Metrics:** On-time versus overdue task completion distribution.
- **Team Leaderboard:** (Admins & Managers) Comparative performance metrics across reps and teams.

---

## 6. Reports & 1-Click Data Exports

Enables instant preview and streaming downloads of CRM datasets.

### Available Reports

- **Leads Directory:** All leads with source, stage, estimated value, and assigned rep.
- **Conversions:** Won deals with contract value and time-to-close metrics.
- **Lost Deals:** Closed-lost opportunities including recorded loss reasons.
- **Follow-up Tasks:** Completed and overdue tasks by team member.
- **Employee Directory:** Roster with role, team membership, and open deal load.
- **Team Performance:** Aggregated win rates and pipeline value per sales unit.

### 1-Click Download Formats

1. **CSV (.csv):** Sanitized plain-text export with built-in formula injection defenses (escapes `=`, `+`, `-`, `@`).
2. **Excel (.xlsx):** Professional spreadsheet with dark navy header styling, auto-fitted columns, and currency formatting.
3. **PDF (.pdf):** Clean executive document with summary statistic cards, corporate headers, and formatted tables.

---

## 7. Real-Time & In-App Notifications

Keeps sales teams synchronized across concurrent sessions.

### In-App Notification Center

- **Bell Icon:** Displays unread notification badge count in the top navigation.
- **Instant Alerts:** Triggers on lead assignment, task due reminders, and deal conversions.
- **Read State:** 1-click single-item read or mark-all-read.

### Server-Sent Events (SSE) Streaming

- **Connection:** Browser establishes a persistent connection via `GET /api/v1/notifications/stream`.
- **Zero Polling:** Instant notifications dispatched directly over `text/event-stream`.
- **Heartbeat:** 25-second keepalive comments prevent proxy timeouts (Nginx/Cloudflare).
- **Graceful Fallback:** If SSE is blocked by corporate firewalls, the frontend seamlessly degrades to 30-second background polling.

---

## 8. Organization Settings

Allows Tenant Admins to configure company workspace preferences:

- **Company Name:** Display name shown across the app and exported reports.
- **Workspace Slug:** Unique organization subdomain or identifier.
- **Currency:** Primary currency symbol and code (`USD`, `EUR`, `GBP`, `INR`, etc.).
- **Timezone:** Local timezone for timestamp presentation and task due-date notifications.

---

## 9. Platform Super Admin Management

Dedicated administrative console for SaaS platform operators (`role = 'SUPER_ADMIN'`).

### Platform Controls

- **Organization Provisioning:** Create new customer workspaces and provision their initial Administrator in a single operation.
- **Workspace Suspension:** Temporarily suspend delinquent or cancelled accounts, immediately terminating all active user sessions for that tenant.
- **Reactivation:** Instantly restore suspended workspaces and user access.
- **Platform Analytics:** Global metrics across all tenant organizations (total organizations, total platform users, active deals).

---

## 10. Public Live Demo Environment

A zero-friction, sandbox mode accessible at `/demo`.

### Demo Capabilities

- **Explore Full Feature Set:** Interact with sample leads, drag Kanban cards, schedule follow-ups, and preview reports.
- **Role Switcher:** Switch between Admin, Manager, and Employee personas with one click to observe role-based permissions in real-time.
- **Sandboxed Isolation:** Dedicated demo workspace ensures public exploration never touches or leaks production tenant data.
