# Frontend Pages and Navigation Specification

## 1. Overview

The frontend is a single-page application built with **React**, **Vite**, **Tailwind CSS**, and **React Router**.

It connects to the Express backend via REST endpoints under `/api/v1`.

---

## 2. Navigation Tree and Route Map

```
/                                       [Public Route: Modern B2B SaaS Landing Page]
/login                                  [Public Route: Authentication Sign In]
/app (DashboardLayout)                  [Protected: Authenticated Tenant & Platform Users]
  |-- /dashboard                        [Role-Scored Dashboard & Analytics]
  |-- /leads                            [Leads Table View]
  |-- /leads/kanban                     [Leads Pipeline Kanban Board]
  |-- /leads/:id                        [Lead 360 Detail View]
  |-- /follow-ups                       [Follow-up Tasks & Reminders]
  |-- /activities                       [Standalone Activity Audit Stream]
  |-- /notifications                    [In-App Notifications Feed]
  |-- /employees                        [Employee Directory - Admin Only]
  |-- /teams                            [Teams Management - Admin & Manager]
  |-- /reports                          [Analytics & Exports - All Roles Scoped]
  |-- /settings                         [Organization Settings - Admin Only]
  |-- /platform/organizations           [Platform Tenant Governance - Super Admin Only]
  |-- /profile                          [Personal Profile & Security - All Roles]
```

---

## 3. Detailed Screen Descriptions

### 3.0 Public Landing Page (`/`)
- **Purpose:** Public presentation layer for prospective organizations, marketing features, workflow explanation, and portal sign-in navigation.
- **Header:** Brand identity (`Leadora`), anchor navigation (`#features`, `#how-it-works`, `#benefits`, `#preview`, `#faq`), and "Sign In" / "Get Started" buttons linking to `/login`.
- **Hero Section:** High-impact value proposition (*"Every Lead. Every Opportunity. One Platform."*), feature pills, and realistic UI preview of pipeline kanban and sales KPIs.
- **Features Grid:** Showcases 8 actual platform capabilities: Lead Lifecycle Management, 7-Stage Pipeline & Kanban, Employee & Team Management, Follow-ups & Task Scheduling, Real-Time Sales Analytics, Reports & Data Export, Chronological Activity Feed, and Multi-Tenant Role Access.
- **How It Works:** 5-step operational progression from workspace setup to executive reporting.
- **Benefits:** Focuses on centralizing customer information, coordinating sales teams, tracking pipeline velocity, zero task neglect, and enterprise isolation.
- **Interactive Preview:** Authentic preview tab switcher between Pipeline Kanban, Executive Analytics, and Multi-Format Exports.
- **FAQ:** Accessible accordion addressing platform capabilities, tenant isolation, and role models.
- **Routing Invariants:** Unauthenticated visitors view the landing page. Authenticated users opening `/` are automatically redirected to `/dashboard`.

### 3.1 Login Page (`/login`)
- **Layout:** Centered card on a clean slate background.
- **Form Fields:** Email input, password input, and "Sign In" button.
- **Behavior:**
  - Validates inputs before sending.
  - Calls `POST /api/v1/auth/login`.
  - On success, sets user state in `AuthContext` and redirects to `/dashboard`.
  - On failure, shows a clear error message (e.g. "Invalid email or password").

### 3.2 Dashboard Page (`/dashboard`)
- **Top Metrics Cards:**
  - Total Active Leads.
  - Leads Won (This Month).
  - Total Pipeline Value ($).
  - Overdue Tasks count (highlighted in red if > 0).
- **Recent Leads Section:** Quick table of the latest 5 leads added.
- **Today's Follow-ups Section:** List of calls and meetings scheduled for today with a quick "Mark Done" button.

### 3.3 Leads List Page (`/leads`)
- **Header:** "Create Lead" primary button.
- **Search & Filters:**
  - Search box (searches by name, email, or company in real time).
  - Filter by Stage (New, Contacted, Qualified, Proposal Sent, Won, Lost).
  - Filter by Priority (Low, Medium, High).
  - Filter by Assigned Sales Rep (for Managers and Admins).
- **Table Columns:** Lead Name, Company, Email/Phone, Status Badge, Estimated Value, Assigned Rep, Created Date, Actions Menu.
- **Pagination:** Simple Next/Previous controls with items count (e.g., "Showing 1 - 20 of 84 leads").

### 3.4 Leads Kanban Board (`/leads/kanban`)
- **Layout:** Horizontal scrolling board with 7 columns:
  1. New
  2. Contacted
  3. Qualified
  4. Proposal Sent
  5. Negotiation
  6. Won (Green header)
  7. Lost (Gray/Red header)
- **Cards:** Shows Lead Name, Company, Estimated Deal Value, Priority Tag, and Rep Avatar.
- **Interactions:**
  - Drag and drop card between columns to update stage immediately (optimistic UI update).
  - Dropping on "Lost" opens a small modal asking for the loss reason.
  - Clicking any card opens the Lead Detail Page.

### 3.5 Lead 360 Detail Page (`/leads/:id`)
- **Left Column (Customer Profile):**
  - Contact information (Name, Email, Phone, Company, Job Title).
  - Quick Stage Changer dropdown.
  - Deal Value and Source.
  - Assigned Sales Rep (editable by Manager or Admin).
  - "Edit Lead" and "Delete Lead" (Admin only) buttons.
- **Right Column (Activity & Follow-ups Tabs):**
  - **Tab 1: Activity Timeline:** Reverse-chronological feed showing when the lead was created, stage changes, and historical notes.
  - **Tab 2: Follow-up Tasks:** List of pending and completed calls/meetings with a button to "Schedule New Follow-up".
  - **Tab 3: Add Note:** Text box to write notes from a phone call or meeting.

### 3.6 Follow-ups Page (`/follow-ups`)
- **Tabs:** "Pending Follow-ups" and "Completed Follow-ups".
- **Filters:** All, Overdue, Due Today, Due This Week.
- **Task Card Details:** Lead name (clickable link), Type icon (Phone for Call, Envelope for Email, Calendar for Meeting), Due Date & Time, Overdue warning badge, and "Complete" button.

### 3.7 Employee & Team Management (`/users`, `/teams`)
- **Users Table:** Name, Email, Role badge (Admin, Manager, Employee), Team name, Status (Active/Inactive), and "Deactivate" action.
- **Invite User Modal:** Form with First Name, Last Name, Email, Password, and Role selector.
- **Teams View:** Cards for each team showing Manager name, Member list, and "Create Team" button.

### 3.8 Reports Page (`/reports`)
- **Performance by Sales Rep:** Table showing Rep Name, Assigned Leads, Deals Won, Win Rate %, Total Revenue.
- **Lead Source Breakdown:** Table showing Source channel (Website, Referral, Cold Call, Event), Total Leads, Deals Won, Revenue Generated.

### 3.9 Settings Page (`/settings`)
- **Organization Tab (Admin Only):** Update company name, default currency code (USD, EUR, GBP, CAD, etc.), and business timezone.

### 3.10 User Profile Page (`/profile`)
- **Profile Details (All Users):** View organization, role, and email; edit first name, last name, and phone.
- **Security:** Change password form with current password validation.

### 3.11 Standalone Activity Feed (`/activities`)
- **Audit Timeline (Admin, Manager, Employee):** Chronological log of sales actions, calls, emails, notes, stage transitions, and tasks.
- **Filters:** By activity type (`STATUS_CHANGED`, `NOTE_ADDED`, `CALL_LOGGED`, `EMAIL_SENT`, `FOLLOWUP_CREATED`, etc.).

### 3.12 Notifications Page (`/notifications`)
- **Alerts Feed (Admin, Manager, Employee):** Real-time notifications for lead assignments, due-today tasks, and overdue items.
- **Tabs & Actions:** Filter by All vs Unread, Mark All Read, and individual mark read.

### 3.13 Platform Organizations Page (`/platform/organizations`)
- **Tenant Governance (Super Admin Only):** Searchable list of all multi-tenant organizations with currency, timezone, and active status.
- **Actions:** Provision New Organization modal (creates tenant and initial Admin) and Suspend / Reactivate action dialogs (session revocation).

