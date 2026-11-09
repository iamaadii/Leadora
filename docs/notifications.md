# In-App Notifications Module Documentation

## 1. Overview & Architecture

The In-App Notifications system provides real-time situational awareness for CRM representatives, managers, and administrators without introducing external message brokers (such as Redis or RabbitMQ) or persistent background daemon processes.

Notifications are driven by:
1. **Direct Event Triggers**: Emitted immediately upon state mutations (e.g., when a lead or follow-up task is assigned/reassigned to another user).
2. **Idempotent Reminders (Self-Healing On-Access)**: Generated synchronously and idempotently when a user queries their notifications feed or unread count.

---

## 2. Database Schema

The `notifications` table stores user notifications with tenant isolation and metadata:

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

-- Partial unique index ensuring daily reminders are generated only once per target per calendar day (UTC)
CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_daily_reminder
ON notifications (user_id, notification_type, entity_id, (DATE(created_at AT TIME ZONE 'UTC')))
WHERE entity_id IS NOT NULL;
```

---

## 3. Notification Triggers

| Trigger | Notification Type | Entity Type | Timing |
|---|---|---|---|
| Lead Assigned / Reassigned | `LEAD_ASSIGNED` | `LEAD` | Instantaneous on `createLead` or `updateLead` |
| Follow-up Assigned | `FOLLOWUP_REMINDER` | `FOLLOW_UP` | Instantaneous on `createFollowup` |
| Follow-up Due Today | `FOLLOWUP_DUE_TODAY` | `FOLLOW_UP` | Synchronous idempotent evaluation on feed request |
| Follow-up Overdue | `FOLLOWUP_OVERDUE` | `FOLLOW_UP` | Synchronous idempotent evaluation on feed request |

---

## 4. API Endpoints

All notification endpoints require an authenticated tenant user (`ADMIN`, `MANAGER`, `EMPLOYEE`). Super Admins receive `HTTP 403 Forbidden` because tenant operational data is isolated.

### `GET /api/v1/notifications`
- **Query Params**:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
  - `status` (`ALL` | `UNREAD` | `READ`, default `ALL`)
- **Response**: Paginated list of notifications with metadata.

### `GET /api/v1/notifications/unread-count`
- **Response**: `{ success: true, data: { unreadCount: 3 } }`

### `PATCH /api/v1/notifications/:id/read`
- **Path Params**: `id` (UUID)
- **Response**: `{ success: true, message: 'Notification marked as read', data: { ... } }`

### `PATCH /api/v1/notifications/read-all`
- **Response**: `{ success: true, message: 'All notifications marked as read', data: { count: 4 } }`

---

## 5. Frontend Integration

1. **Topbar Bell Indicator**:
   - Polling unread count query (`refetchInterval: 30000`).
   - Badge with count (or `99+`) if `unreadCount > 0`.
   - Dropdown panel showing top 5 latest notifications, "Mark all read", and direct links to target leads/follow-ups.
2. **Notifications Page (`/notifications`)**:
   - Filter tabs: `All Notifications` vs `Unread`.
   - "Mark all read" global action button.
   - Individual "Mark read" button per card.
   - Click navigation to lead detail or follow-up list based on `entity_type`.
