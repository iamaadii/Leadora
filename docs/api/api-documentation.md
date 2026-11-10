# Complete API Endpoint Reference

This document lists all API endpoints in Leadora, who can use them, and what they do in simple words.

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Anyone | Log in with email and password. Sets secure cookie. |
| `POST` | `/auth/logout` | Logged in | Log out. Revokes session and clears cookie. |
| `GET` | `/auth/me` | Logged in | Get your own user profile and company info. |
| `POST` | `/auth/refresh` | Logged in | Rotate your login session token. |
| `PATCH` | `/auth/password` | Logged in | Change your password (requires current password). |

---

## 2. Leads (`/api/v1/leads`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leads` | Admin, Manager, Employee | Get list of leads (paginated, auto-filtered by role). |
| `POST` | `/leads` | Admin, Manager, Employee | Create a new lead. |
| `GET` | `/leads/assignees` | Admin, Manager, Employee | Get list of staff who can be assigned to leads. |
| `GET` | `/leads/:id` | Admin, Manager, Employee | Get details for one lead. |
| `PATCH` | `/leads/:id` | Admin, Manager, Employee | Update lead details, stage, or priority. |
| `PATCH` | `/leads/:id/archive` | Admin | Archive (soft-delete) a lead. |
| `PATCH` | `/leads/:id/restore` | Admin | Restore an archived lead. |
| `GET` | `/leads/:id/activities` | Admin, Manager, Employee | View timeline of notes and actions on this lead. |
| `POST` | `/leads/:id/activities` | Admin, Manager, Employee | Add a call log, meeting note, or message to a lead. |
| `GET` | `/leads/:id/followups` | Admin, Manager, Employee | Get all tasks scheduled for this lead. |

---

## 3. Follow-ups & Tasks (`/api/v1/followups`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/followups/summary` | Admin, Manager, Employee | Summary counts: total, pending, overdue, due today. |
| `GET` | `/followups` | Admin, Manager, Employee | List tasks with filters for date, type, and priority. |
| `POST` | `/followups` | Admin, Manager, Employee | Schedule a new call, email, demo, or task. |
| `GET` | `/followups/:id` | Admin, Manager, Employee | Get details for one task. |
| `PATCH` | `/followups/:id` | Admin, Manager, Employee | Reschedule or edit a task. |
| `PATCH` | `/followups/:id/complete` | Admin, Manager, Employee | Mark task completed and add notes. |
| `PATCH` | `/followups/:id/cancel` | Admin, Manager, Employee | Cancel a task. |
| `GET` | `/followups/lead/:leadId` | Admin, Manager, Employee | Get all tasks for a specific lead. |

---

## 4. Employees & Directory (`/api/v1/employees`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | Admin | List all employees, their teams, and active lead counts. |
| `POST` | `/employees` | Admin | Create a new employee with a temporary password. |
| `GET` | `/employees/:id` | Admin | Get details of one employee. |
| `PATCH` | `/employees/:id` | Admin | Update employee contact info. |
| `PATCH` | `/employees/:id/role` | Admin | Change employee role (`Admin`, `Manager`, `Employee`). |
| `PATCH` | `/employees/:id/deactivate` | Admin | Deactivate an employee and end their sessions. |
| `PATCH` | `/employees/:id/activate` | Admin | Reactivate a deactivated employee. |

---

## 5. Teams (`/api/v1/teams`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/teams` | Admin, Manager | List sales teams. |
| `GET` | `/teams/my-teams` | Admin, Manager | List teams managed by the current user. |
| `POST` | `/teams` | Admin | Create a new sales team and pick a manager. |
| `GET` | `/teams/:id` | Admin, Manager | Get team details. |
| `PATCH` | `/teams/:id` | Admin | Update team name or assigned manager. |
| `PATCH` | `/teams/:id/deactivate` | Admin | Deactivate a team. |
| `PATCH` | `/teams/:id/activate` | Admin | Reactivate a team. |
| `POST` | `/teams/:id/members` | Admin | Add an employee to a team. |
| `DELETE` | `/teams/:id/members/:employeeId` | Admin | Remove an employee from a team. |
| `GET` | `/teams/:id/roster` | Admin, Manager | List all members of a team. |
| `GET` | `/teams/:id/workload` | Admin, Manager | View lead workload and stage counts per team member. |

---

## 6. Dashboard & Analytics (`/api/v1/dashboard`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/overview` | Admin, Manager, Employee | Summary KPI cards with percentage comparisons. |
| `GET` | `/dashboard/lead-pipeline` | Admin, Manager, Employee | Lead counts and values across all 7 stages. |
| `GET` | `/dashboard/lead-trends` | Admin, Manager, Employee | Leads created over time by day, week, or month. |
| `GET` | `/dashboard/followup-analytics` | Admin, Manager, Employee | Follow-up completion rates and task types. |
| `GET` | `/dashboard/team-performance` | Admin, Manager | Compare win rates and lead volume across teams. |
| `GET` | `/dashboard/employee-performance`| Admin, Manager | Compare performance across individual reps. |
| `GET` | `/dashboard/recent-activity` | Admin, Manager, Employee | Latest feed of customer calls, notes, and events. |

---

## 7. Reports & Downloads (`/api/v1/reports`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/:reportType` | Admin, Manager, Employee | Preview report on screen (leads, conversions, tasks). |
| `GET` | `/reports/:reportType/export` | Admin, Manager, Employee | Download report as `csv`, `excel`, or `pdf`. |
| `POST` | `/reports/:reportType/export`| Admin, Manager, Employee | Download report with custom filters. |

---

## 8. In-App Notifications (`/api/v1/notifications`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Admin, Manager, Employee | View recent notifications. |
| `GET` | `/notifications/unread-count` | Admin, Manager, Employee | Number of unread alerts for the bell badge. |
| `PATCH` | `/notifications/:id/read` | Admin, Manager, Employee | Mark one notification as read. |
| `PATCH` | `/notifications/read-all` | Admin, Manager, Employee | Mark all notifications as read. |

---

## 9. Company Settings (`/api/v1/organization/settings`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/organization/settings` | Admin, Manager, Employee | View company name, currency, and timezone. |
| `PATCH` | `/organization/settings` | Admin | Change company name, currency symbol, or timezone. |

---

## 10. Platform Super Admin (`/api/v1/platform`)

| Method | Endpoint | Who Can Use | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/platform/organizations` | Super Admin | List all company workspaces on the platform. |
| `POST` | `/platform/organizations` | Super Admin | Create a new company workspace and initial Admin. |
| `GET` | `/platform/organizations/:id`| Super Admin | View details for one company. |
| `PATCH` | `/platform/organizations/:id/status` | Super Admin | Suspend or reactivate a company workspace. |
| `GET` | `/platform/reports/organizations` | Super Admin | View platform-wide growth and tenant health. |

