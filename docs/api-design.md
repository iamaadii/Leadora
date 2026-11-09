# REST API Design Specification

## 1. API Standards and Conventions

- **Base URL:** `/api/v1`
- **Data Format:** JSON for all request bodies and responses (`Content-Type: application/json`).
- **Authentication:** A secure, `HttpOnly` cookie named `token` containing a signed JWT.
- **Language:** Plain JavaScript ES Modules.

---

## 2. Standard Response Envelopes

Every API endpoint returns a predictable JSON structure:

### 2.1 Success Response Example
```json
{
  "success": true,
  "data": {
    "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Acme Inc",
    "status": "QUALIFIED"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2.2 Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "email": "Please provide a valid email address"
    }
  }
}
```

---

## 3. Standard HTTP Status Codes

- `200 OK`: Request succeeded.
- `201 Created`: New item successfully created.
- `204 No Content`: Item deleted successfully.
- `400 Bad Request`: General bad input or missing parameters.
- `401 Unauthorized`: Not logged in or session expired.
- `403 Forbidden`: Logged in, but your role does not have permission for this action.
- `404 Not Found`: Item does not exist (or belongs to another company).
- `409 Conflict`: Item already exists (e.g. duplicate email).
- `422 Unprocessable Entity`: Zod validation failed on request body.
- `500 Internal Server Error`: Unexpected server issue.

---

## 4. Complete List of API Endpoints

### 4.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Logs in with email/password, sets HttpOnly cookie |
| `POST` | `/auth/logout` | All Logged In | Clears the auth cookie and revokes session |
| `GET` | `/auth/me` | All Logged In | Returns logged-in user profile, role, and organization info |
| `PUT` | `/auth/profile` | All Logged In | Updates current user's name and phone number |
| `PUT` | `/auth/change-password` | All Logged In | Updates password after verifying current password |

---

### 4.2 Organizations (`/api/v1/organizations`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/organizations` | Super Admin | Lists all customer organizations on the platform |
| `POST` | `/organizations` | Super Admin | Creates a new customer organization and its first Admin |
| `GET` | `/organizations/:id` | Super Admin, Admin | Gets organization profile (Admin only sees their own) |
| `PATCH` | `/organizations/:id` | Super Admin, Admin | Updates company name or status |

---

### 4.3 Users and Teams (`/api/v1/users`, `/api/v1/teams`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Admin, Manager | Lists employees in the organization |
| `POST` | `/users` | Admin | Adds a new user account (Admin, Manager, or Employee) |
| `GET` | `/users/:id` | Admin, Manager | Gets a user's details and assigned lead count |
| `PATCH` | `/users/:id` | Admin | Updates user role, team, or active/inactive status |
| `GET` | `/teams` | Admin, Manager, Employee | Lists teams in the organization |
| `POST` | `/teams` | Admin | Creates a new sales team and picks a manager |
| `POST` | `/teams/:id/members` | Admin | Adds an employee to a sales team |
| `DELETE` | `/teams/:id/members/:userId` | Admin | Removes an employee from a sales team |

---

### 4.4 Leads (`/api/v1/leads`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leads` | Admin, Manager, Employee | Lists leads (paginated, filtered by role automatically) |
| `POST` | `/leads` | Admin, Manager, Employee | Creates a new lead and logs 'LEAD_CREATED' activity |
| `GET` | `/leads/assignees` | Admin, Manager, Employee | Lists active staff in organization for assignee selection |
| `GET` | `/leads/:id` | Admin, Manager, Employee | Gets lead details, active stage, and recent activities |
| `PATCH` | `/leads/:id` | Admin, Manager, Employee | Updates lead fields, stage, or assignment with activity logging |
| `PATCH` | `/leads/:id/archive` | Admin | Soft-archives a lead (`archived_at = NOW()`) |
| `PATCH` | `/leads/:id/restore` | Admin | Restores an archived lead (`archived_at = NULL`) |
| `GET` | `/leads/:id/activities` | Admin, Manager, Employee | Returns chronological history of lead events and notes |

---

### 4.5 Follow-ups and Tasks (`/api/v1/follow-ups`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/follow-ups` | All Logged In | Lists follow-ups (filterable by status: PENDING, COMPLETED) |
| `POST` | `/follow-ups` | All Logged In | Schedules a new follow-up for a lead |
| `GET` | `/follow-ups/:id` | All Logged In | Gets follow-up details |
| `PATCH` | `/follow-ups/:id` | All Logged In | Updates due date or notes |
| `PATCH` | `/follow-ups/:id/status` | All Logged In | Marks task COMPLETED or CANCELLED with notes |
| `DELETE` | `/follow-ups/:id` | Admin, Manager, Creator | Removes a scheduled follow-up |

---

### 4.6 Activity History (`/api/v1/leads/:leadId/activities`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leads/:leadId/activities` | All Logged In | Returns chronological history of calls, stages, notes |
| `POST` | `/leads/:leadId/activities` | All Logged In | Adds a manual note or call log to a lead |

---

### 4.7 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | All Logged In | Returns notifications for the logged-in user |
| `PATCH` | `/notifications/:id/read` | All Logged In | Marks a single notification as read |
| `PATCH` | `/notifications/mark-all-read` | All Logged In | Marks all user notifications as read |

---

### 4.8 Dashboard & Reports (`/api/v1/dashboard`, `/api/v1/reports`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/metrics` | All Logged In | Returns KPI cards (total leads, won value, overdue tasks) |
| `GET` | `/reports/sales-performance` | Admin, Manager | Rep-by-rep closed deals and revenue generated |
| `GET` | `/reports/lead-sources` | Admin, Manager | Win rate breakdown by source (Website, Referral, etc.) |

---

### 4.9 Organization Settings (`/api/v1/settings`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/settings/organization` | Admin | Returns company name, currency, and timezone |
| `PUT` | `/settings/organization` | Admin | Updates organization settings |

---

### 4.10 Employee Administration (`/api/v1/employees`) — Phase 6

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | Admin | List paginated staff with team info & active lead counts |
| `POST` | `/employees` | Admin | Create employee with temporary password (`must_change_password=true`) |
| `GET` | `/employees/:id` | Admin | Get employee details by ID |
| `PATCH` | `/employees/:id` | Admin | Update employee contact details (firstName, lastName, phone) |
| `PATCH` | `/employees/:id/role` | Admin | Change employee role (enforces safety checks) |
| `PATCH` | `/employees/:id/deactivate` | Admin | Deactivate employee, revoke sessions, and remove team memberships |
| `PATCH` | `/employees/:id/activate` | Admin | Reactivate employee account |

---

### 4.11 Team Management (`/api/v1/teams`) — Phase 6

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/teams` | Admin, Manager | List teams (Admin: all org teams; Manager: managed teams only) |
| `GET` | `/teams/my-teams` | Admin, Manager | List teams managed by the caller |
| `POST` | `/teams` | Admin | Create new sales team and assign manager |
| `GET` | `/teams/:id` | Admin, Manager | Get team details (Manager restricted to managed team) |
| `PATCH` | `/teams/:id` | Admin | Update team name, description, and manager |
| `PATCH` | `/teams/:id/deactivate` | Admin | Deactivate team and unassign active members |
| `PATCH` | `/teams/:id/activate` | Admin | Reactivate team |
| `POST` | `/teams/:id/members` | Admin | Add employee to team (enforces single active team invariant) |
| `DELETE` | `/teams/:id/members/:employeeId` | Admin | Remove employee from team |
| `GET` | `/teams/:id/roster` | Admin, Manager | Get active team roster |
| `GET` | `/teams/:id/workload` | Admin, Manager | Get team member workload breakdown and pipeline stage counts |

### 4.5 Follow-ups & Task Scheduling Endpoints (Phase 7)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/followups/summary` | Admin, Manager, Employee | Get role-scoped metric counts (total, pending, overdue, due_today, completed, cancelled) |
| `GET` | `/followups` | Admin, Manager, Employee | List paginated follow-ups with role scoping, status, type, priority, and date filters |
| `POST` | `/followups` | Admin, Manager, Employee | Schedule new follow-up (Admin: any org user; Manager: team members; Employee: self only) |
| `GET` | `/followups/:id` | Admin, Manager, Employee | Get single follow-up details (role-scoped, returns 404 if inaccessible) |
| `PATCH` | `/followups/:id` | Admin, Manager, Employee | Update follow-up details, priority, or reschedule due date |
| `PATCH` | `/followups/:id/complete`| Admin, Manager, Employee | Mark task COMPLETED and record completion notes |
| `PATCH` | `/followups/:id/cancel` | Admin, Manager, Employee | Cancel task |
| `GET` | `/followups/lead/:leadId`| Admin, Manager, Employee | Get all follow-ups linked to a lead |
| `GET` | `/leads/:id/followups` | Admin, Manager, Employee | Alternate REST resource endpoint for lead follow-ups |

### 4.6 Dashboard & Analytics Endpoints (Phase 8)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/overview` | Admin, Manager, Employee | KPI summary cards with date range filtering and previous period delta comparisons |
| `GET` | `/dashboard/lead-pipeline` | Admin, Manager, Employee | Aggregated counts and percentage breakdown across all 7 pipeline stages |
| `GET` | `/dashboard/lead-trends` | Admin, Manager, Employee | Time-series lead creation and historical conversions by day/week/month bucket |
| `GET` | `/dashboard/followup-analytics` | Admin, Manager, Employee | Status distribution, activity type mix, and overall execution rate |
| `GET` | `/dashboard/team-performance` | Admin, Manager | Team member count, active leads, won/lost counts, pending tasks, win rate (403 for Employee) |
| `GET` | `/dashboard/employee-performance` | Admin, Manager | Individual representative pipeline volume, follow-ups, and conversion rate (403 for Employee)|
| `GET` | `/dashboard/recent-activity` | Admin, Manager, Employee | Latest customer engagements stream scoped to permitted leads |

---

## 5. Request Validation Using Zod

Before a request hits business logic, Express middleware validates it with Zod.

Example schema for creating a lead:
```javascript
import { z } from 'zod';

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().email('Invalid email address').optional().nullable(),
    phone: z.string().trim().max(50).optional().nullable(),
    companyName: z.string().trim().max(200).optional().nullable(),
    jobTitle: z.string().trim().max(150).optional().nullable(),
    source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EVENT', 'OTHER']).default('WEBSITE'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    estimatedValue: z.number().nonnegative('Value must be 0 or greater').default(0),
    assignedUserId: z.string().uuid().optional().nullable(),
  }),
});
```

