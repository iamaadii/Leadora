-- 006_create_notifications.sql
-- Creates the notifications table for in-app alerts

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Enforce that the notified user belongs to the SAME organization
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (organization_id, user_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE CASCADE
);

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);

