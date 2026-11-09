-- 012_add_settings_and_enhance_notifications.sql
-- Phase 10: Organization settings localization and notifications enhancements

-- 1. Add currency and timezone to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD' NOT NULL;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/New_York' NOT NULL;

-- 2. Enhance notifications table with entity links and metadata
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) NULL;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS entity_id UUID NULL;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

-- 3. Idempotent index: Prevent duplicate daily reminder alerts for the same entity
CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_daily_reminder 
ON notifications (user_id, notification_type, entity_id, (DATE(created_at AT TIME ZONE 'UTC'))) 
WHERE entity_id IS NOT NULL;

-- Fast index for looking up notifications by related entity
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications (entity_type, entity_id);
