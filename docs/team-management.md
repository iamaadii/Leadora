# Team and Employee Management Architecture (Phase 6)

## 1. Overview

Phase 6 implements multi-tenant Employee Directory Administration and Sales Team Management. It enforces role-based access control (RBAC), multi-tenant data isolation, and team-scoped lead visibility and assignment.

---

## 2. Cardinality and Structural Invariants

1. **Organization Data Isolation**: Every user, team, and team membership is strictly scoped to an `organization_id`.
2. **Team Leadership**:
   - A team has at most one designated manager (`manager_id` on `teams`).
   - Only users with role `MANAGER` can be assigned as team managers.
   - A single manager may manage multiple teams.
3. **Single Active Team Membership**:
   - Regular employees (`role = 'EMPLOYEE'`) can only belong to **one active team at a time**.
   - Enforced by PostgreSQL partial unique index:
     ```sql
     CREATE UNIQUE INDEX uq_team_members_active_employee
     ON team_members (organization_id, employee_id)
     WHERE removed_at IS NULL;
     ```
   - Only users with role `EMPLOYEE` can be added to `team_members`.
   - When an employee is removed or reassigned, `removed_at` is set to `NOW()`.

---

## 3. Account and Role Safety Protections

1. **Self-Action Protections**:
   - Administrators cannot deactivate their own user account (`HTTP 400 Bad Request`).
   - Administrators cannot change or demote their own role (`HTTP 400 Bad Request`).
2. **Last Active Admin Invariant**:
   - An administrator cannot be deactivated or demoted if they are the last active administrator in the organization.
3. **Active Team Manager Protection**:
   - A manager who currently leads active sales teams cannot be demoted or deactivated without first reassigning team leadership (`HTTP 400 Bad Request`).
4. **Immediate Session Invalidation on Deactivation**:
   - Deactivating an employee marks `is_active = FALSE`.
   - Revokes all active refresh tokens in `refresh_tokens`.
   - Sets `removed_at = NOW()` on all active team memberships.
   - Access tokens are rejected on the next API call because authentication middleware verifies `is_active = TRUE` against PostgreSQL on each request.
5. **Temporary Password Onboarding**:
   - New employees are created with `must_change_password = TRUE`.
   - Passwords are encrypted with Argon2.

---

## 4. Manager Team-Scoped Lead Boundaries

Phase 6 enforces team-scoped boundaries for Managers:

| Capability | Administrator | Manager | Employee |
|---|---|---|---|
| View Employees Directory | Organization-wide | Forbidden (403) | Forbidden (403) |
| Manage Employees (Create, Role, Status) | Organization-wide | Forbidden (403) | Forbidden (403) |
| Create / Edit / Deactivate Teams | Organization-wide | Forbidden (403) | Forbidden (403) |
| Add / Remove Team Members | Organization-wide | Forbidden (403) | Forbidden (403) |
| View Team Roster & Workload | All Teams | Managed Teams Only | Forbidden (403) |
| View Leads | Organization-wide | Assigned to self, created by self, or assigned to active team members | Assigned to self or created by self |
| Assign / Reassign Leads | Any active user in org | Self or active members of managed teams | Self only |

If a Manager attempts to assign a lead to an employee belonging to another team (or unassigned), the API rejects the request with `HTTP 403 Forbidden` (`Managers can only assign leads to members of their managed teams.`).

---

## 5. API Endpoints

### Employee Management (`/api/v1/employees`) — Admin Only
- `GET /api/v1/employees`: List paginated employees (filters: search, role, isActive, sortBy, sortOrder).
- `POST /api/v1/employees`: Create employee with temporary password.
- `GET /api/v1/employees/:id`: Get employee details with team and active lead count.
- `PATCH /api/v1/employees/:id`: Update employee contact info (firstName, lastName, phone).
- `PATCH /api/v1/employees/:id/role`: Change employee role.
- `PATCH /api/v1/employees/:id/deactivate`: Deactivate employee and revoke sessions.
- `PATCH /api/v1/employees/:id/activate`: Reactivate employee account.

### Team Management (`/api/v1/teams`)
- `GET /api/v1/teams`: List teams (Admin: all org teams; Manager: managed teams only).
- `GET /api/v1/teams/my-teams`: List teams managed by caller.
- `POST /api/v1/teams`: Create team (Admin only).
- `GET /api/v1/teams/:id`: Get team details (Admin, or team's Manager).
- `PATCH /api/v1/teams/:id`: Update team (Admin only).
- `PATCH /api/v1/teams/:id/deactivate`: Deactivate team and unassign active members (Admin only).
- `PATCH /api/v1/teams/:id/activate`: Reactivate team (Admin only).
- `POST /api/v1/teams/:id/members`: Add member to team (Admin only; enforces single active team membership).
- `DELETE /api/v1/teams/:id/members/:employeeId`: Remove member from team (Admin only).
- `GET /api/v1/teams/:id/roster`: View active team roster (Admin, or team's Manager).
- `GET /api/v1/teams/:id/workload`: View member lead counts and stage distribution (Admin, or team's Manager).
