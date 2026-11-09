# Role-Based Access Control and Permissions

## 1. System Roles Explained

The application has 4 user roles. Each role has a specific job and clear limits:

```
+----------------------------------------------------+
|                   1. SUPER ADMIN                   |
|  Manages the entire platform and all companies     |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|                      2. ADMIN                      |
|  Manages their own company, employees and settings |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|                     3. MANAGER                     |
|  Manages their sales team, team leads and tasks    |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|                     4. EMPLOYEE                    |
|  Works on their own assigned leads and follow-ups  |
+----------------------------------------------------+
```

### 1.1 Super Admin
- **Who they are:** The platform owner or software provider.
- **What they do:**
  - Create new organization accounts for paying customers.
  - Activate or suspend an organization.
  - View high-level system statistics (how many organizations are active).
- **Limits:** Super Admins do not manage daily sales leads inside customer companies.

### 1.2 Admin
- **Who they are:** The business owner, managing director, or head of operations at a customer company.
- **What they do:**
  - Full control over their company's data.
  - Invite new employees and pick their role (Admin, Manager, Employee).
  - Create sales teams and assign managers to them.
  - View, edit, and delete any lead, task, or report inside their company.
  - Change company settings (company name, timezone, currency).
- **Limits:** An Admin can never see or touch another company's data.

### 1.3 Manager
- **Who they are:** A sales team leader or regional sales manager.
- **What they do:**
  - See all leads and follow-ups assigned to members of their team.
  - Assign or reassign leads among their team members.
  - Monitor team performance and view team reports.
  - Work on their own personal leads and follow-ups.
- **Limits:** A Manager cannot see leads from other teams. They cannot change company settings or delete employee accounts.

### 1.4 Employee
- **Who they are:** A sales representative or account executive.
- **What they do:**
  - Create new leads.
  - View and update leads assigned directly to them.
  - Move their leads through the sales pipeline (e.g. from New to Contacted to Won).
  - Schedule and complete follow-up calls, meetings, and emails for their leads.
  - Write notes and view their personal dashboard numbers.
- **Limits:** An Employee cannot see other employees' leads or reports. They cannot delete leads (only Admins can).

---

## 2. Permission Matrix

| Feature / Action | Super Admin | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: | :---: |
| **Organization Management** | | | | |
| Create new organization | YES | NO | NO | NO |
| Suspend or activate organization | YES | NO | NO | NO |
| Update organization settings (name, currency) | YES | YES | NO | NO |
| **User & Team Management** | | | | |
| Invite / create new user | YES | YES | NO | NO |
| Change user role | YES | YES | NO | NO |
| Deactivate a user | YES | YES | NO | NO |
| Create sales teams | NO | YES | NO | NO |
| View team members list | NO | YES | YES | YES (Own Team) |
| Update own profile and password | YES | YES | YES | YES |
| **Lead Management** | | | | |
| Create a new lead | NO | YES | YES | YES |
| View leads list | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Edit lead details | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Change lead pipeline stage | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Assign or reassign lead owner | NO | YES | YES (Own Team) | NO |
| Delete a lead (Soft delete) | NO | YES | NO | NO |
| **Follow-ups & Tasks** | | | | |
| Create a follow-up | NO | YES | YES | YES |
| View follow-ups list | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Mark follow-up as completed | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Reschedule a follow-up | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Delete a follow-up | NO | YES | YES (Own Team) | OWN ONLY |
| **Activity History** | | | | |
| View lead activity timeline | NO | ALL (Company) | TEAM ONLY | OWN ONLY |
| Write manual note on lead | NO | YES | YES | YES |
| **Dashboard & Reports** | | | | |
| View personal sales dashboard | NO | YES | YES | YES |
| View team performance dashboard | NO | YES | YES | NO |
| View company-wide executive dashboard | NO | YES | NO | NO |
| View and export sales reports | NO | YES | YES (Team) | NO |

---

## 3. How SQL Queries Enforce Data Privacy

Security is never checked only in the frontend. Every repository query checks the user's role and applies strict SQL filters:

### Rule 1: Always check `organization_id`
Every query for company data includes:
```sql
WHERE organization_id = $1 AND deleted_at IS NULL
```
This guarantees that no user can ever see data from another company.

### Rule 2: Role filter on Leads

- **For an Admin:**
  ```sql
  SELECT * FROM leads 
  WHERE organization_id = $1 AND deleted_at IS NULL
  ORDER BY created_at DESC;
  ```

- **For a Manager:**
  ```sql
  SELECT l.* FROM leads l
  WHERE l.organization_id = $1 
    AND l.deleted_at IS NULL
    AND (
      l.assigned_user_id = $2 
      OR l.assigned_team_id = $3
      OR l.assigned_user_id IN (
        SELECT user_id FROM team_members WHERE team_id = $3
      )
    )
  ORDER BY l.created_at DESC;
  ```

- **For an Employee:**
  ```sql
  SELECT * FROM leads 
  WHERE organization_id = $1 
    AND assigned_user_id = $2 
    AND deleted_at IS NULL
  ORDER BY created_at DESC;
  ```

---

## 4. Edge Cases Handled

1. **What if a sales rep leaves the company?**
   - The Admin deactivates their account.
   - The user cannot log in anymore (their JWT will be rejected).
   - Their active leads can be reassigned to another employee or placed into an unassigned team pool so leads are never lost.
2. **What if a Manager tries to reassign a lead to someone in another team?**
   - The backend checks if the new employee belongs to the Manager's team. If not, the API returns `403 Forbidden` ("You can only assign leads to your own team members").
3. **What if an Employee guesses another lead's ID in the URL?**
   - The SQL query checks both `id = $1` AND `assigned_user_id = $2`. If the lead belongs to someone else, the database returns 0 rows, and the API returns `404 Not Found`.

---

## 5. Follow-ups & Task Scheduling Permissions (Phase 7)

### Permission Matrix

| Operation | Super Admin | Admin | Manager | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **List Follow-ups** | 403 Forbidden | Org-wide | Managed Teams + Self | Assigned to Self only |
| **Schedule Follow-up** | 403 Forbidden | Any org lead/user | Team leads/members | Own leads / Self only |
| **View Follow-up Details** | 403 Forbidden | Full access | Team scope (404 otherwise) | Own scope (404 otherwise) |
| **Reschedule / Edit** | 403 Forbidden | Any pending task | Pending team tasks | Own pending tasks |
| **Reassign Follow-up** | 403 Forbidden | Any active org user | Active team members | 403 Forbidden |
| **Complete Follow-up** | 403 Forbidden | Any pending task | Pending team tasks | Own pending tasks |
| **Cancel Follow-up** | 403 Forbidden | Any pending task | Pending team tasks | Own pending tasks |
| **KPI Summary Aggregates**| 403 Forbidden | Org-wide counts | Team-scoped counts | Personal counts |

### Terminal Status Invariance
Follow-ups in terminal status (`COMPLETED` or `CANCELLED`) cannot be modified, completed, or cancelled by any role (returns HTTP 400).

---

## 6. Dashboard & Analytics Permissions (Phase 8)

### Permission Matrix

| Dashboard Endpoint | Super Admin | Admin | Manager | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **GET /dashboard/overview** | 403 Forbidden | Org-wide KPIs | Managed Teams Scope | Personal Scope |
| **GET /dashboard/lead-pipeline** | 403 Forbidden | Org-wide Stages | Managed Teams Scope | Personal Scope |
| **GET /dashboard/lead-trends** | 403 Forbidden | Org-wide Velocity | Managed Teams Scope | Personal Scope |
| **GET /dashboard/followup-analytics** | 403 Forbidden | Org-wide Tasks | Managed Teams Scope | Personal Scope |
| **GET /dashboard/team-performance** | 403 Forbidden | Org Teams | Managed Teams Only | **403 Forbidden** |
| **GET /dashboard/employee-performance**| 403 Forbidden | Org Reps | Managed Reps Only | **403 Forbidden** |
| **GET /dashboard/recent-activity** | 403 Forbidden | Org Stream | Team Stream | Personal Stream |

---

## 7. Reports & Data Export Permissions (Phase 9)

### Permission Matrix

| Report & Export Operation | Super Admin | Admin | Manager | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **GET /reports/leads** | 403 Forbidden | Org-wide | Managed Teams Scope | Personal Scope |
| **GET /reports/conversions** | 403 Forbidden | Org-wide | Managed Teams Scope | Personal Scope |
| **GET /reports/lost-leads** | 403 Forbidden | Org-wide | Managed Teams Scope | Personal Scope |
| **GET /reports/followups** | 403 Forbidden | Org-wide | Managed Teams Scope | Personal Scope |
| **GET /reports/employees** | 403 Forbidden | Org Reps | Managed Reps Scope | Personal Scope |
| **GET /reports/teams** | 403 Forbidden | Org Teams | Managed Teams Only | **403 Forbidden** |
| **GET /reports/activities** | 403 Forbidden | Org Log | Team Audit Stream | Personal Scope |
| **Export Reports (CSV/Excel/PDF)**| 403 Forbidden | Org-wide Export | Managed Teams Scope | Personal Scope |
| **GET /platform/reports/organizations**| Full Access | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| **GET /platform/reports/users**| Full Access | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| **Platform Exports (CSV/Excel/PDF)**| Full Access | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |

---

## 8. CRM Feature Completion & Missing Modules Permissions (Phase 10A)

### Permission Matrix

| Operation | Super Admin | Admin | Manager | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **GET /notifications** | 403 Forbidden | Personal notifications | Personal notifications | Personal notifications |
| **GET /notifications/unread-count** | 403 Forbidden | Personal count | Personal count | Personal count |
| **PATCH /notifications/:id/read** | 403 Forbidden | Own notifications | Own notifications | Own notifications |
| **PATCH /notifications/read-all** | 403 Forbidden | Own notifications | Own notifications | Own notifications |
| **GET /organization/settings** | 403 Forbidden | Org settings | Org settings | Org settings |
| **PATCH /organization/settings** | 403 Forbidden | **Allowed** | **403 Forbidden** | **403 Forbidden** |
| **GET /users/profile** | Own Profile | Own Profile | Own Profile | Own Profile |
| **PATCH /users/profile** | Own Profile | Own Profile | Own Profile | Own Profile |
| **GET /platform/organizations** | **Full Access** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| **POST /platform/organizations** | **Full Access** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| **PATCH /platform/organizations/:id/status** | **Full Access** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| **GET /activities** | 403 Forbidden | Org-wide Feed | Team Feed | Personal Feed |
| **Leads Kanban Board (/leads/kanban)** | 403 Forbidden | Org-wide Leads | Team Leads | Own Assigned Leads |





