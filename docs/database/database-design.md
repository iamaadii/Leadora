# Database Design & PostgreSQL Schema

This document explains the Leadora database tables, rules, and relationships in simple words.

---

## 1. Overview

- **Database Engine:** PostgreSQL 16+
- **Driver:** `pg` (node-postgres) with parameterized queries (`$1, $2`)
- **No ORM:** All queries are pure SQL. No Prisma, TypeORM, or Sequelize.
- **Migrations:** SQL files run in numbered order (from `001` to `012`).

---

## 2. Multi-Tenant Data Protection

Leadora keeps each company's data strictly isolated at the database level:

1. Every table has an `organization_id` column.
2. Tables use **Composite Foreign Keys** like `(organization_id, id)`.
3. If an employee tries to link a lead from Company A to a user from Company B, PostgreSQL automatically blocks it with a foreign key violation error.

---

## 3. The 10 Main Tables

### 1. `organizations`
Stores each customer company workspace.
- `id`: Unique ID (UUID)
- `name`: Company name (e.g., "Acme Sales Corp")
- `slug`: URL-friendly identifier (e.g., "acme-sales")
- `currency`: Currency code (e.g., `USD`, `EUR`, `GBP`, `INR`)
- `timezone`: Local timezone (e.g., `America/New_York`)
- `is_active`: `true` if active, `false` if suspended

### 2. `users`
Stores user accounts for all roles.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID (is `NULL` only for Super Admins)
- `first_name`, `last_name`: User's name
- `email`: Login email address
- `password_hash`: Password securely hashed with Argon2
- `role`: One of `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`
- `is_active`: Whether the user can log in

### 3. `leads`
Stores sales opportunities and prospects.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `name`: Lead contact name
- `email`, `phone`, `company`: Contact information
- `source`: Where the lead came from (`WEBSITE`, `REFERRAL`, `COLD_CALL`, `EVENT`, `OTHER`)
- `status`: Sales stage (`NEW`, `CONTACTED`, `INTERESTED`, `QUALIFIED`, `PROPOSAL_SENT`, `CONVERTED`, `LOST`)
- `assigned_to_id`: Sales rep assigned to this lead
- `archived_at`: Timestamp if the lead was soft-deleted

### 4. `followups`
Scheduled tasks like phone calls, demos, or meetings.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `lead_id`: The lead this task is for
- `assigned_to_id`: The sales rep responsible
- `title`, `description`: Details of the task
- `type`: `CALL`, `EMAIL`, `MEETING`, `TASK`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `due_at`: Date and time when the task must be done
- `status`: `PENDING`, `COMPLETED`, `CANCELLED`
- `completed_at`, `completion_notes`: Details saved when finished

### 5. `activities`
Timeline of everything that happened to a lead.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `lead_id`: The lead this event belongs to
- `actor_user_id`: The user who did the action
- `activity_type`: Event type (like `LEAD_CREATED`, `STATUS_CHANGE`, `FOLLOWUP_COMPLETED`)
- `description`: Human-readable summary of the event
- `metadata`: Extra details stored as JSON

### 6. `notifications`
Alerts shown in the top navigation bell.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `user_id`: The user who receives the alert
- `title`, `message`: Alert content
- `notification_type`: Type of alert (like `LEAD_ASSIGNED`, `FOLLOWUP_REMINDER`)
- `is_read`: `true` if read, `false` if unread

### 7. `teams`
Sales groups within a company.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `name`: Team name (e.g., "Inbound Sales")
- `manager_id`: The Manager in charge of this team

### 8. `team_members`
Links employees to a team.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `team_id`: Team ID
- `employee_id`: User ID of the sales rep
- An employee can only belong to one active team at a time.

### 9. `refresh_tokens`
Stores active login sessions.
- `id`: Unique ID (UUID)
- `user_id`: User ID
- `token_hash`: Hash of the refresh token
- `expires_at`: Expiration date
- `revoked_at`: Timestamp when the user logged out

### 10. `audit_logs`
Security log of important system actions.
- `id`: Unique ID (UUID)
- `organization_id`: Company ID
- `actor_user_id`: Who performed the action
- `action`: What was done (e.g., `USER_DEACTIVATED`)
- `created_at`: Exact timestamp

---

## 4. SQL Migration Files

All database changes are saved in numbered SQL files in `apps/api/src/database/migrations/`:
- `001_create_organizations.sql`
- `002_create_users.sql`
- `003_create_leads.sql`
- `004_create_followups.sql`
- `005_create_activities.sql`
- `006_create_notifications.sql`
- `007_create_refresh_tokens.sql`
- `008_create_audit_logs.sql`
- `009_expand_activity_types.sql`
- `010_create_teams_and_employee_management.sql`
- `011_enhance_followups.sql`
- `012_add_settings_and_enhance_notifications.sql`

A special table named `schema_migrations` records which files have already run so they never run twice.

