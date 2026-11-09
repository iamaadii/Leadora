# Follow-up & Task Management Architecture

This document describes the design, implementation, and behavior of the Follow-ups & Task Scheduling module implemented in Phase 7 of the Business CRM & Lead Management System.

---

## 1. Overview & Business Purpose

Sales deals often stall or fall through due to missed customer touchpoints. The Follow-up & Task Management module provides a systematic mechanism for sales representatives, managers, and administrators to:

- Schedule future touchpoints (phone calls, email outreach, demos/meetings, general tasks) linked to leads.
- Automatically track due dates and surface overdue warnings in real time.
- Enforce role-based boundaries on viewing, assignment, and execution.
- Maintain immutable audit activity trails on the lead whenever follow-ups are created, rescheduled, reassigned, completed, or cancelled.
- Record structured meeting takeaways and conversation outcomes upon completion.

---

## 2. Database Schema

The `followups` table provides multi-tenant task tracking with composite foreign key integrity:

```sql
CREATE TABLE followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    lead_id UUID NOT NULL,
    assigned_to_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type VARCHAR(50) DEFAULT 'CALL' NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    completed_at TIMESTAMPTZ NULL,
    completed_by_id UUID NULL,
    completion_notes TEXT NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Multi-tenant composite foreign keys
    CONSTRAINT fk_followups_org FOREIGN KEY (organization_id)
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_followups_lead FOREIGN KEY (organization_id, lead_id)
        REFERENCES leads(organization_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_followups_assignee FOREIGN KEY (organization_id, assigned_to_id)
        REFERENCES users(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_followups_completed_by FOREIGN KEY (organization_id, completed_by_id)
        REFERENCES users(organization_id, id) ON DELETE SET NULL,
    CONSTRAINT fk_followups_creator FOREIGN KEY (organization_id, created_by_id)
        REFERENCES users(organization_id, id) ON DELETE RESTRICT,

    -- Domain check constraints
    CONSTRAINT chk_followups_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_followups_type CHECK (type IN ('CALL', 'EMAIL', 'MEETING', 'TASK')),
    CONSTRAINT chk_followups_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);
```

### Key Indexes

```sql
CREATE INDEX idx_followups_org_status_due ON followups(organization_id, status, due_at);
CREATE INDEX idx_followups_assigned_due ON followups(organization_id, assigned_to_id, due_at);
CREATE INDEX idx_followups_lead ON followups(organization_id, lead_id);
CREATE INDEX idx_followups_priority ON followups(organization_id, priority);
CREATE INDEX idx_followups_type ON followups(organization_id, type);
```

---

## 3. Status Lifecycle & Terminal Immutability

```
                    ┌──────────────┐
                    │   PENDING    │
                    └───┬──────┬───┘
                        │      │
            Complete    │      │   Cancel
            Action      │      │   Action
                        ▼      ▼
         ┌───────────────┐   ┌───────────────┐
         │   COMPLETED   │   │   CANCELLED   │
         │  (Terminal)   │   │  (Terminal)   │
         └───────────────┘   └───────────────┘
```

- **PENDING**: Initial status for all scheduled follow-ups.
- **OVERDUE**: A dynamically calculated/derived status (`status = 'PENDING' AND due_at < NOW()`). Never stored as a hardcoded database status to prevent clock drift and stale background jobs.
- **COMPLETED**: Terminal state. Sets `completed_at = NOW()`, `completed_by_id = user.id`, and appends `completion_notes`.
- **CANCELLED**: Terminal state. Marked when a touchpoint is no longer required.
- **Terminal Immutability**: Any attempt to update, complete, or cancel a follow-up that is already `COMPLETED` or `CANCELLED` is rejected with HTTP 400 (`TERMINAL_STATUS`).

---

## 4. Role-Based Permissions & Isolation

| Action | Admin | Manager | Employee | Super Admin |
| :--- | :--- | :--- | :--- | :--- |
| **View Follow-ups** | All organization follow-ups | Self + active members of managed teams | Self assigned only | **Forbidden (403)** |
| **Schedule Follow-up** | For any lead, assign to any user | For team leads, assign to self or team member | For own leads, assign to self only | **Forbidden (403)** |
| **Reschedule / Edit** | Any pending organization follow-up | Any pending team follow-up | Own pending follow-ups | **Forbidden (403)** |
| **Reassign Follow-up** | To any active organization employee | To active members of managed teams only | **Forbidden (403)** | **Forbidden (403)** |
| **Complete Follow-up** | Any pending organization follow-up | Any pending team follow-up | Own pending follow-ups | **Forbidden (403)** |
| **Cancel Follow-up** | Any pending organization follow-up | Any pending team follow-up | Own pending follow-ups | **Forbidden (403)** |
| **View KPI Summary** | Organization-wide aggregations | Team-scoped aggregations | Individual aggregations | **Forbidden (403)** |

### Strict Multi-Tenant Isolation
Platform Super Admins are strictly forbidden from accessing or scheduling tenant follow-ups (returns HTTP 403) to preserve organization confidentiality and compliance.

---

## 5. API Endpoints

All endpoints are prefixed with `/api/v1/followups` and require JWT authentication.

### `GET /api/v1/followups/summary`
Returns role-scoped follow-up counts:
```json
{
  "success": true,
  "data": {
    "total": 24,
    "pending": 15,
    "overdue": 3,
    "dueToday": 4,
    "upcoming": 8,
    "completed": 7,
    "cancelled": 2
  }
}
```

### `GET /api/v1/followups`
Query parameters:
- `page` (default 1), `limit` (default 20)
- `status`: `PENDING`, `COMPLETED`, `CANCELLED`
- `type`: `CALL`, `EMAIL`, `MEETING`, `TASK`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `isOverdue`: `true`
- `dueToday`: `true`
- `leadId`: UUID
- `assignedToId`: UUID
- `startDate`: ISO 8601 string
- `endDate`: ISO 8601 string
- `search`: string (matches title and description)
- `sortBy`: `due_at`, `priority`, `created_at`, `status`, `title` (default `due_at`)
- `sortOrder`: `ASC` or `DESC` (default `ASC`)

### `POST /api/v1/followups`
Request body:
```json
{
  "leadId": "UUID",
  "title": "Discovery Call",
  "description": "Discuss enterprise security requirements",
  "type": "CALL",
  "priority": "HIGH",
  "dueAt": "2026-11-15T14:00:00Z",
  "assignedToId": "UUID (optional, defaults to self)"
}
```

### `GET /api/v1/followups/:id`
Returns full follow-up details including lead name, company, assignee name, and completion notes.

### `PATCH /api/v1/followups/:id`
Updates title, description, type, priority, due date (reschedule), or assignee.

### `PATCH /api/v1/followups/:id/complete`
```json
{
  "completionNotes": "Client approved proposal. Transitioning lead to PROPOSAL."
}
```

### `PATCH /api/v1/followups/:id/cancel`
Cancels pending task.

### `GET /api/v1/followups/lead/:leadId` or `GET /api/v1/leads/:id/followups`
Returns all follow-up history linked to a specific lead.

---

## 6. Audit Logging & In-App Notifications

- **Activities**: Every follow-up state change generates an activity log entry on the linked lead:
  - `FOLLOWUP_CREATED`
  - `FOLLOWUP_UPDATED`
  - `FOLLOWUP_RESCHEDULED`
  - `FOLLOWUP_REASSIGNED`
  - `FOLLOWUP_COMPLETED`
  - `FOLLOWUP_CANCELLED`
- **Notifications**: When an administrator or manager assigns a follow-up to another employee, an in-app notification (`FOLLOWUP_ASSIGNED` or `FOLLOWUP_REASSIGNED`) is created for the assignee.
