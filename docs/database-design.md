# Database Design and PostgreSQL Schema Specification

## 1. Database Architecture Overview

This application uses **PostgreSQL 16+** as its relational database.
- **Access Method:** Raw SQL queries executed using the official `pg` (`node-postgres`) driver with parameterized statements (`$1, $2`).
- **Migration Method:** Versioned, idempotent SQL migration files executed sequentially by an internal runner (`apps/api/src/database/migrate.js`).
- **ORM Independence:** Zero ORMs (no Prisma, Sequelize, TypeORM, Drizzle, or Mongoose). All schema definitions, constraints, and data access are pure PostgreSQL.

---

## 2. Core Architectural Design Decisions

### 2.1 Multi-Tenant Isolation via Composite Foreign Keys
In standard multi-tenant databases, queries often filter by `organization_id`, but standard foreign keys (`REFERENCES users(id)`) cannot prevent human mistakes (e.g., assigning a Lead in Org A to an Employee in Org B).

To solve this at the database engine level without application-layer fallibility, this schema implements **Composite Foreign Keys**:
1. `users` defines `UNIQUE (organization_id, id)`.
2. `leads` defines `FOREIGN KEY (organization_id, assigned_to_id) REFERENCES users(organization_id, id)`.
3. `leads` defines `UNIQUE (organization_id, id)`.
4. `followups` defines `FOREIGN KEY (organization_id, lead_id) REFERENCES leads(organization_id, id)`.
5. `followups` defines `FOREIGN KEY (organization_id, assigned_to_id) REFERENCES users(organization_id, id)`.

**Result:** PostgreSQL itself rejects any cross-tenant relationship attempt with error `23503 foreign_key_violation`.

### 2.2 Super Admin Exemption Pattern
Platform-level Super Admins manage multiple organizations and do not belong to a single tenant company. This is enforced via check constraint:
```sql
CONSTRAINT chk_user_org_super_admin CHECK (
    (role = 'SUPER_ADMIN' AND organization_id IS NULL) OR
    (role != 'SUPER_ADMIN' AND organization_id IS NOT NULL)
)
```

### 2.3 Automatic `updated_at` Trigger
A reusable PostgreSQL function `update_updated_at_column()` automatically updates the `updated_at` timestamp on every row update before write commit.

---

## 3. Data Dictionary and Table Definitions

### 3.1 `organizations`
Stores tenant business entities.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name`: `VARCHAR(255) NOT NULL`
- `slug`: `VARCHAR(100) UNIQUE NOT NULL` (format: `^[a-z0-9-]+$`)
- `email`: `VARCHAR(255) NULL`
- `phone`: `VARCHAR(50) NULL`
- `website`: `VARCHAR(255) NULL`
- `address`: `TEXT NULL`
- `is_active`: `BOOLEAN DEFAULT TRUE NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** `idx_organizations_slug`, `idx_organizations_is_active`

### 3.2 `users`
Accounts across all platform and tenant roles.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `first_name`: `VARCHAR(100) NOT NULL`
- `last_name`: `VARCHAR(100) NOT NULL`
- `email`: `VARCHAR(255) NOT NULL`
- `password_hash`: `VARCHAR(255) NOT NULL` (Argon2id hash)
- `phone`: `VARCHAR(50) NULL`
- `role`: `VARCHAR(50) NOT NULL` (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`)
- `is_active`: `BOOLEAN DEFAULT TRUE NOT NULL`
- `last_login_at`: `TIMESTAMPTZ NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Constraints:**
  - `chk_user_role`: Restricts role to valid enum strings.
  - `chk_user_org_super_admin`: Restricts `organization_id` to `NULL` for `SUPER_ADMIN` and `NOT NULL` for all other roles.
  - `uq_users_org_id`: Unique constraint on `(organization_id, id)`.
- **Indexes:**
  - `uq_users_org_email`: Unique index on `(organization_id, LOWER(email))` for tenant users.
  - `uq_users_superadmin_email`: Unique index on `LOWER(email)` where `organization_id IS NULL`.
  - `idx_users_org_role`, `idx_users_is_active`.

### 3.3 `leads`
Prospects and sales pipeline opportunities.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `name`: `VARCHAR(255) NOT NULL`
- `email`: `VARCHAR(255) NULL`
- `phone`: `VARCHAR(50) NULL`
- `company`: `VARCHAR(255) NULL`
- `source`: `VARCHAR(50) DEFAULT 'WEBSITE' NOT NULL`
- `status`: `VARCHAR(50) DEFAULT 'NEW' NOT NULL` (`NEW`, `CONTACTED`, `INTERESTED`, `QUALIFIED`, `PROPOSAL_SENT`, `CONVERTED`, `LOST`)
- `assigned_to_id`: `UUID NULL` (FK to `users(organization_id, id)`)
- `description`: `TEXT NULL`
- `created_by_id`: `UUID NULL` (FK to `users(organization_id, id)`)
- `archived_at`: `TIMESTAMPTZ NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:**
  - `idx_leads_org_status`: Filtered by `archived_at IS NULL` for active pipeline lookups.
  - `idx_leads_org_assigned`: Fast filtering by sales rep.
  - `idx_leads_org_created_at`: Reverse-chronological lead list sorting.
  - `idx_leads_email`: Fast duplicate search by email.

### 3.4 `followups`
Scheduled customer interactions (calls, meetings, emails, tasks). Enhanced in Phase 7 via Migration `011`.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `lead_id`: `UUID NOT NULL` (FK to `leads(organization_id, id)`)
- `assigned_to_id`: `UUID NOT NULL` (FK to `users(organization_id, id)`)
- `title`: `VARCHAR(255) NOT NULL`
- `description`: `TEXT NULL`
- `type`: `VARCHAR(50) DEFAULT 'CALL' NOT NULL` (`CALL`, `EMAIL`, `MEETING`, `TASK`)
- `priority`: `VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL` (`LOW`, `MEDIUM`, `HIGH`)
- `due_at`: `TIMESTAMPTZ NOT NULL`
- `status`: `VARCHAR(50) DEFAULT 'PENDING' NOT NULL` (`PENDING`, `COMPLETED`, `CANCELLED`)
- `completed_at`: `TIMESTAMPTZ NULL`
- `completed_by_id`: `UUID NULL` (FK to `users(organization_id, id) ON DELETE SET NULL`)
- `completion_notes`: `TEXT NULL`
- `created_by_id`: `UUID NOT NULL` (FK to `users(organization_id, id)`)
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:**
  - `idx_followups_org_due_at`: Calendar and scheduling range filters.
  - `idx_followups_pending_due`: Partial index for rapid overdue calculation (`WHERE status = 'PENDING'`).
  - `idx_followups_lead_id`: Foreign key lookup.
  - `idx_followups_priority`: Fast priority filtering.
  - `idx_followups_type`: Fast activity type filtering.

### 3.5 `activities`
Append-only chronological timeline of events on each lead.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `lead_id`: `UUID NOT NULL` (FK to `leads(organization_id, id)`)
- `actor_user_id`: `UUID NULL` (FK to `users(organization_id, id)`)
- `activity_type`: `VARCHAR(50) NOT NULL` (`CALL`, `MEETING`, `EMAIL`, `NOTE`, `STATUS_CHANGE`, `ASSIGNMENT_CHANGE`, `FOLLOWUP_CREATED`, `FOLLOWUP_UPDATED`, `FOLLOWUP_RESCHEDULED`, `FOLLOWUP_REASSIGNED`, `FOLLOWUP_COMPLETED`, `FOLLOWUP_CANCELLED`, `LEAD_CREATED`, `LEAD_UPDATED`, `LEAD_ASSIGNED`, `LEAD_STATUS_CHANGED`, `LEAD_ARCHIVED`, `LEAD_RESTORED`)
- `description`: `TEXT NOT NULL`
- `metadata`: `JSONB DEFAULT '{}'::jsonb NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:**
  - `idx_activities_lead_created`: Fast reverse-chronological timeline rendering for lead profiles.
  - `idx_activities_metadata`: GIN index for querying structured metadata attributes.

### 3.6 `notifications`
User alert feeds.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL` (FK to `users(organization_id, id)`)
- `title`: `VARCHAR(255) NOT NULL`
- `message`: `TEXT NOT NULL`
- `notification_type`: `VARCHAR(50) NOT NULL`
- `is_read`: `BOOLEAN DEFAULT FALSE NOT NULL`
- `read_at`: `TIMESTAMPTZ NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** `idx_notifications_user_read`, `idx_notifications_org_id`.

### 3.7 `refresh_tokens`
Encrypted sessions for rotating JWT authentication.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `token_hash`: `VARCHAR(255) UNIQUE NOT NULL`
- `expires_at`: `TIMESTAMPTZ NOT NULL`
- `revoked_at`: `TIMESTAMPTZ NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** `idx_refresh_tokens_user_id`, `idx_refresh_tokens_expires_at`.

### 3.8 `audit_logs`
Security and administrative governance history.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `actor_user_id`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
- `action`: `VARCHAR(100) NOT NULL`
- `entity_type`: `VARCHAR(100) NOT NULL`
- `entity_id`: `VARCHAR(100) NULL`
- `old_values`: `JSONB NULL`
- `new_values`: `JSONB NULL`
- `ip_address`: `VARCHAR(45) NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** `idx_audit_logs_org_created`, `idx_audit_logs_entity`.

### 3.9 `teams`
Sales and marketing teams within an organization.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `name`: `VARCHAR(100) NOT NULL`
- `description`: `TEXT NULL`
- `manager_id`: `UUID NULL` (FK to `users(organization_id, id)`)
- `is_active`: `BOOLEAN DEFAULT TRUE NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Constraints:** `CONSTRAINT uq_teams_org_name UNIQUE (organization_id, name)`, `CONSTRAINT uq_teams_org_id UNIQUE (organization_id, id)`.
- **Indexes:** `idx_teams_org_id`, `idx_teams_manager_id`.

### 3.10 `team_members`
Staff membership assignment to sales teams.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- `team_id`: `UUID NOT NULL` (FK to `teams(organization_id, id)`)
- `employee_id`: `UUID NOT NULL` (FK to `users(organization_id, id)`)
- `joined_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `removed_at`: `TIMESTAMPTZ NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Constraints / Partial Unique Index:**
  ```sql
  CREATE UNIQUE INDEX uq_team_members_active_employee
  ON team_members (organization_id, employee_id)
  WHERE removed_at IS NULL;
  ```
  *(Enforces that an employee can belong to at most one active team at any given time).*

---

## 4. Migration Execution Structure

Migrations are organized as versioned files under `apps/api/src/database/migrations/`:
1. `001_create_organizations.sql`
2. `002_create_users.sql`
3. `003_create_leads.sql`
4. `004_create_followups.sql`
5. `005_create_activities.sql`
6. `006_create_notifications.sql`
7. `007_create_refresh_tokens.sql`
8. `008_create_audit_logs.sql`
9. `009_expand_activity_types.sql`
10. `010_create_teams_and_employee_management.sql`

A dedicated tracking table `schema_migrations` prevents re-execution.
