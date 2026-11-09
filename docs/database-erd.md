# Database Entity-Relationship Diagram (ERD)

This diagram documents the complete PostgreSQL relational schema implemented in Phase 2 for the **Business CRM & Lead Management System**.

---

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has_members"
    ORGANIZATIONS ||--o{ LEADS : "owns"
    ORGANIZATIONS ||--o{ FOLLOWUPS : "owns"
    ORGANIZATIONS ||--o{ ACTIVITIES : "records"
    ORGANIZATIONS ||--o{ NOTIFICATIONS : "delivers"
    ORGANIZATIONS ||--o{ AUDIT_LOGS : "logs"

    USERS ||--o{ LEADS : "assigned_to (fk_leads_assigned_user)"
    USERS ||--o{ LEADS : "created_by (fk_leads_created_by)"
    USERS ||--o{ FOLLOWUPS : "assigned_to (fk_followups_assigned_to)"
    USERS ||--o{ FOLLOWUPS : "created_by (fk_followups_created_by)"
    USERS ||--o{ ACTIVITIES : "acted_by (fk_activities_actor)"
    USERS ||--o{ NOTIFICATIONS : "received_by (fk_notifications_user)"
    USERS ||--o{ REFRESH_TOKENS : "owns (fk_tokens_user)"
    USERS ||--o{ AUDIT_LOGS : "performed_by (actor_user_id)"

    LEADS ||--o{ FOLLOWUPS : "has_tasks (fk_followups_lead)"
    LEADS ||--o{ ACTIVITIES : "tracks_history (fk_activities_lead)"

    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar slug UK
        varchar email
        varchar phone
        varchar website
        text address
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar password_hash
        varchar phone
        varchar role
        boolean is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    LEADS {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar email
        varchar phone
        varchar company
        varchar source
        varchar status
        uuid assigned_to_id FK
        text description
        uuid created_by_id FK
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }

    FOLLOWUPS {
        uuid id PK
        uuid organization_id FK
        uuid lead_id FK
        uuid assigned_to_id FK
        varchar title
        text description
        timestamptz due_at
        varchar status
        timestamptz completed_at
        uuid created_by_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    ACTIVITIES {
        uuid id PK
        uuid organization_id FK
        uuid lead_id FK
        uuid actor_user_id FK
        varchar activity_type
        text description
        jsonb metadata
        timestamptz created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar title
        text message
        varchar notification_type
        boolean is_read
        timestamptz read_at
        timestamptz created_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid organization_id FK
        uuid actor_user_id FK
        varchar action
        varchar entity_type
        varchar entity_id
        jsonb old_values
        jsonb new_values
        varchar ip_address
        timestamptz created_at
    }
```

---

## Multi-Tenant Referential Integrity Feature

A critical design achievement in this schema is **Composite Foreign Key Isolation**:
- `leads` references `(organization_id, assigned_to_id)` -> `users(organization_id, id)`
- `followups` references `(organization_id, lead_id)` -> `leads(organization_id, id)`
- `followups` references `(organization_id, assigned_to_id)` -> `users(organization_id, id)`
- `activities` references `(organization_id, lead_id)` -> `leads(organization_id, id)`

This guarantees that a lead or follow-up can **never** be associated with a user or entity from a different organization, enforced directly by PostgreSQL engine constraints.
