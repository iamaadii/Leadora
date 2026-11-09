# Application Workflows and User Journeys

## 1. Overview

This document explains step-by-step how users interact with the Business CRM and what happens behind the scenes.

---

## 2. Key User Journeys

### 2.1 Journey 1: User Login and Session Management

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales Rep / Admin
    participant React as React Frontend
    participant Server as Express Server
    participant DB as PostgreSQL Database

    User->>React: Enters email and password
    React->>Server: POST /api/v1/auth/login { email, password }
    Server->>DB: Query user by email (SELECT * FROM users WHERE email = $1)
    DB-->>Server: Return user row with password_hash
    Server->>Server: Verify password with Argon2
    Server->>Server: Create JWT token with { userId, organizationId, role }
    Server-->>React: 200 OK + Set HttpOnly Cookie ("token")
    React->>User: Redirect to Dashboard based on role
```

**Step-by-step:**
1. The user enters their email and password on the login screen.
2. The frontend sends `POST /api/v1/auth/login` to the backend.
3. The backend runs a parameterized SQL query to find the user.
4. The backend verifies the password using **Argon2**.
5. If valid, the backend generates a signed **JWT** containing the user's `userId`, `organizationId`, and `role`.
6. The backend sends the JWT inside a secure **HttpOnly cookie**.
7. The browser automatically includes this cookie on all future requests. JavaScript in the browser cannot read this cookie, which keeps it safe from hackers.
8. When the user logs out, the server clears the cookie.

---

### 2.2 Journey 2: Lead Creation, Assignment, and Duplicate Check

```mermaid
flowchart TD
    Start([Sales Rep Enters New Lead]) --> Form[Fill Name, Email, Phone, Company, Value]
    Form --> Submit[Click 'Create Lead']
    Submit --> Validate[Backend checks input with Zod]
    
    Validate -->|Invalid Input| ErrorMsg[Return 422: Validation Error]
    Validate -->|Valid Input| CheckDup{Check if Email exists in Organization}
    
    CheckDup -->|Email already exists| DupFound[Return 409: Lead already exists with this email]
    CheckDup -->|Email is new| TxBegin[Start Database Transaction: BEGIN]

    TxBegin --> InsertLead[Insert new row into 'leads' table]
    TxBegin --> InsertActivity[Insert row into 'activity_logs': 'Lead Created']
    TxBegin --> CheckAssigned{Is lead assigned to an employee?}

    CheckAssigned -->|Yes| InsertNotif[Insert row into 'notifications' for assigned user]
    CheckAssigned -->|No| CommitTx[Commit Transaction]
    InsertNotif --> CommitTx

    CommitTx --> Done([Return 201 Created to Frontend])
```

**Step-by-step:**
1. A sales rep or admin fills in the lead form (Name, Email, Phone, Company, Estimated Value, Source).
2. The backend validates the inputs using **Zod** (checking valid email, phone, positive value).
3. The repository checks if this email already exists in the same company:
   ```sql
   SELECT id FROM leads 
   WHERE organization_id = $1 AND email = $2 AND deleted_at IS NULL;
   ```
4. If a duplicate is found, the user is warned immediately.
5. If clean, the backend runs a **SQL transaction**:
   - `INSERT INTO leads (...) VALUES (...)`
   - `INSERT INTO activity_logs (...) VALUES (...)`
   - If an employee was assigned, `INSERT INTO notifications (...) VALUES (...)`
   - `COMMIT`
6. If any step fails, the transaction rolls back so no incomplete data is saved.

---

### 2.3 Journey 3: Pipeline Kanban Stage Transition

Sales reps manage deals visually by dragging cards between columns (or using a stage dropdown).

```mermaid
sequenceDiagram
    autonumber
    actor Rep as Sales Representative
    participant UI as Kanban Board (React)
    participant API as Express API
    participant DB as PostgreSQL

    Rep->>UI: Moves Lead from "Qualified" to "Proposal Sent"
    UI->>API: PATCH /api/v1/leads/:id/stage { stage: "PROPOSAL_SENT" }
    API->>DB: Check if Rep owns this lead
    DB-->>API: Lead found and rep is authorized
    API->>DB: BEGIN Transaction
    API->>DB: UPDATE leads SET stage = 'PROPOSAL_SENT', updated_at = NOW() WHERE id = $1
    API->>DB: INSERT INTO activity_logs (type, summary) VALUES ('STAGE_CHANGED', 'Moved from Qualified to Proposal Sent')
    API->>DB: COMMIT Transaction
    API-->>UI: 200 OK (Updated Lead)
    UI->>Rep: Show success toast and update board
```

**Special rule for "LOST" leads:**
- If the user moves a lead to `LOST`, a popup asks: *"Why did the customer decline?"*
- The reason is saved in `leads.lost_reason` and recorded in the activity timeline.

---

### 2.4 Journey 4: Follow-up Scheduling and Completion

```mermaid
flowchart TD
    CreateTask([Rep Schedules Follow-up]) --> PickType[Choose Type: Call, Meeting, Email]
    PickType --> PickDate[Select Due Date and Time]
    PickDate --> SaveTask[Save to 'follow_ups' table]
    
    SaveTask --> DayPasses[Time Passes...]
    DayPasses --> CheckDue{Is Due Date in the past and status is PENDING?}
    
    CheckDue -->|Yes| ShowOverdue[UI displays red OVERDUE badge]
    CheckDue -->|No| WaitDue[UI displays normal due date]
    
    ShowOverdue --> DoAction[Rep makes the call or meeting]
    WaitDue --> DoAction
    
    DoAction --> CompleteClick[Rep clicks 'Mark Completed']
    CompleteClick --> AddNote[Rep writes summary note of what happened]
    AddNote --> SaveDone[Update follow_up status to COMPLETED]
    SaveDone --> LogHist[Add event to Lead Activity History]
    LogHist --> Finish([Follow-up Finished])
```

---

### 2.5 Journey 5: Employee Deactivation & Session Revocation

When an employee departs the company or needs to be deactivated:
1. The **Admin** opens the Employees page and clicks **Deactivate User**.
2. Safety validations ensure:
   - The user is not the Admin themselves.
   - The user is not the last active Administrator in the organization.
   - The user is not a Manager leading active teams (must reassign teams first).
3. In a single SQL transaction:
   - User status is marked `is_active = FALSE`.
   - All active refresh tokens are revoked (`revoked_at = NOW()`).
   - Active team memberships are terminated (`removed_at = NOW()`).
   - Audit log entry `DEACTIVATE_EMPLOYEE` is recorded.
4. On the very next request, the user's access token is rejected by authentication middleware.

---

### 2.6 Journey 6: Employee Onboarding & Temporary Password Workflow

1. **Admin Creation**: Admin creates a new employee account with email, name, role (`ADMIN`, `MANAGER`, or `EMPLOYEE`), and temporary password.
2. The user is stored with `must_change_password = TRUE`.
3. Passwords are saved hashed with **Argon2**.
4. When the employee first logs in with their temporary credentials:
   - The frontend identifies `user.must_change_password = true` and prompts a mandatory password change screen before navigating into the CRM.
   - Once updated, `must_change_password` is set to `FALSE`.

---

### 2.7 Journey 7: Team Creation, Membership Assignment & Lead Scoping

1. **Team Creation**: Admin creates a team and assigns an active user with role `MANAGER`.
2. **Member Assignment**: Admin assigns employees (`role = 'EMPLOYEE'`) to the team. The system enforces the single active team membership constraint via PostgreSQL partial unique index `uq_team_members_active_employee`.
3. **Manager Workload Scoping**:
   - The Manager logs in and views `/teams`, which displays only teams they lead.
   - The Manager clicks **View Workload** to see lead counts across all pipeline stages (New, Contacted, Qualified, Proposal, Won, Lost) for each active team member.
4. **Lead Assignment Boundary**:
   - Managers can only assign leads to themselves or active members of their managed teams.
   - If a Manager attempts to assign or view leads outside their teams, the API returns `403 Forbidden` / `404 Not Found`.

---

### 2.8 Journey 8: Follow-up Scheduling, Rescheduling & Completion (Phase 7)

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales Rep / Manager / Admin
    participant Frontend as React Web App
    participant API as Express API
    participant DB as PostgreSQL Database

    User->>Frontend: Fills "Schedule Follow-up" Modal
    Frontend->>API: POST /api/v1/followups { leadId, title, type, priority, dueAt, assignedToId }
    API->>API: Verify role boundaries & assignee validity
    API->>DB: BEGIN Transaction
    API->>DB: INSERT INTO followups (...)
    API->>DB: INSERT INTO activities (activity_type = 'FOLLOWUP_CREATED')
    API->>DB: INSERT INTO notifications (if assigned to other user)
    API->>DB: COMMIT Transaction
    API-->>Frontend: 201 Created (Followup object)
    Frontend->>User: Displays scheduled task in Follow-ups table and Lead timeline

    Note over User,DB: When task is executed...
    User->>Frontend: Clicks "Complete" and inputs call notes
    Frontend->>API: PATCH /api/v1/followups/:id/complete { completionNotes }
    API->>API: Verify task is still PENDING
    API->>DB: BEGIN Transaction
    API->>DB: UPDATE followups SET status = 'COMPLETED', completed_at = NOW(), completed_by_id = user.id, completion_notes = $1
    API->>DB: INSERT INTO activities (activity_type = 'FOLLOWUP_COMPLETED')
    API->>DB: COMMIT Transaction
    API-->>Frontend: 200 OK
    Frontend->>User: Updates status to Completed and displays outcome badge
```

**Step-by-step Execution:**
1. **Scheduling**: User fills the schedule modal from either the global Follow-ups workspace or the Lead details page.
2. **Access Control**:
   - Admins can assign to any user.
   - Managers can assign to themselves or members of their managed teams.
   - Employees can only schedule tasks assigned to themselves.
3. **Rescheduling / Reassignment**:
   - If the due date is altered, an activity log entry `FOLLOWUP_RESCHEDULED` is created.
   - If reassigned, `FOLLOWUP_REASSIGNED` is logged and the new assignee receives an in-app notification.
4. **Completion**:
   - Rep logs notes and clicks Complete.
   - Record transitions to `COMPLETED` and becomes immutable.
   - Activity entry `FOLLOWUP_COMPLETED` appends notes into the lead's chronological audit trail.

---

### 2.9 Journey 9: Role-Aware Dashboard & Analytics Workflow (Phase 8)

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin / Manager / Rep
    participant React as Dashboard Page
    participant API as Express API
    participant DB as PostgreSQL Database

    User->>React: Navigates to /dashboard (or changes date filter)
    React->>API: GET /api/v1/dashboard/overview?range=30d
    React->>API: GET /api/v1/dashboard/lead-pipeline
    React->>API: GET /api/v1/dashboard/lead-trends?range=30d
    React->>API: GET /api/v1/dashboard/followup-analytics

    alt Admin or Manager Role
        React->>API: GET /api/v1/dashboard/team-performance
        React->>API: GET /api/v1/dashboard/employee-performance?range=30d
    end

    API->>DB: Run optimized SQL aggregations with role-scoped WHERE clauses
    DB-->>API: Return aggregated counts, stage metrics, and time-series
    API-->>React: Return JSON envelopes with computed statistics
    React->>User: Renders KPI cards, SVG trend charts, pipeline funnel, and performance tables
```

**Step-by-step Execution:**
1. **Authentication & Role Discovery**: The React application reads `user.role` from the active session.
2. **Scoping**:
   - For an **Admin**, queries aggregate across the entire organization.
   - For a **Manager**, queries filter by teams where `t.manager_id = user.id` and active members of those teams.
   - For an **Employee**, queries filter by `l.assigned_to_id = user.id` or `l.created_by_id = user.id`. Team and employee performance widgets are hidden on the UI and forbidden by the backend (HTTP 403).
3. **Date Filtering**: Changing the date range filter (7d, 30d, 90d, this month, previous month, or custom) triggers query invalidation and updates time-series trends and period-based KPI indicators.
4. **Interactive Navigation**: Clicking on any stage in the Pipeline Funnel navigates to `/leads?status=:stage` with the appropriate status pre-filtered.



