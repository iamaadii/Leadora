# Frontend Pages & Navigation

This document explains each screen in the Leadora web app in simple words.

---

## 1. Page Map

```
/                               Public Landing Page
/login                          Login Screen
/demo                           Free Interactive Live Demo
/dashboard                      Executive Sales Dashboard
/leads                          Leads Table View
/leads/kanban                   Visual 7-Stage Pipeline Board
/leads/:id                      Lead Profile & Activity Timeline
/follow-ups                     Follow-up Tasks & Reminders
/activities                     Full Activity Log
/notifications                  In-App Notification Feed
/employees                      Staff Directory (Admin only)
/teams                          Teams & Workloads (Admin & Manager)
/reports                        Reports & 1-Click Exports
/settings                       Company Settings (Admin only)
/platform/organizations         Tenant Company Management (Super Admin only)
/profile                        Personal User Profile & Password
```

---

## 2. Screen Descriptions

### 1. Landing Page (`/`)
- Public home page explaining Leadora features, role solutions, pricing plans, and FAQs.
- Links to `/demo` and `/login`.
- Automatically forwards already-logged-in users directly to `/dashboard`.

### 2. Login Page (`/login`)
- Clean form with email, password, and show/hide password toggle.
- On success, sets the login cookie and redirects to `/dashboard`.

### 3. Dashboard (`/dashboard`)
- KPI summary cards (Total Pipeline Value, Active Leads, Win Rate, Overdue Tasks).
- Monthly performance chart.
- List of tasks due today.

### 4. Leads List & Kanban (`/leads` and `/leads/kanban`)
- Real-time search by lead name, company, or email.
- Filters by stage, source, priority, and assigned rep.
- 1-click toggle between tabular list and interactive Kanban board.

### 5. Lead Details (`/leads/:id`)
- Complete lead overview (contact info, deal value, stage).
- Action buttons to log calls, add notes, or schedule tasks.
- Chronological timeline of all past activities.

### 6. Follow-ups (`/follow-ups`)
- Calendar and list view of upcoming calls, meetings, and tasks.
- Tabs for All, Pending, Due Today, and Overdue tasks.
- Quick action to mark a task completed with outcome notes.

### 7. Reports & Exports (`/reports`)
- Screen preview of leads, conversions, lost deals, and team metrics.
- 1-click downloads for CSV, Excel (.xlsx), and PDF formats.

### 8. Employee Directory (`/employees`)
- Add new staff, assign user roles, and deactivate accounts.

### 9. Teams (`/teams`)
- Create sales teams, assign team managers, and balance team member workloads.

