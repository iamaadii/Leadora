-- 009_expand_activity_types.sql
-- Expand activities check constraint to support lead lifecycle activity events

ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activity_type;

ALTER TABLE activities ADD CONSTRAINT chk_activity_type CHECK (
    activity_type IN (
        -- Original interaction types
        'CALL',
        'MEETING',
        'EMAIL',
        'NOTE',
        'STATUS_CHANGE',
        'ASSIGNMENT_CHANGE',
        'FOLLOWUP_CREATED',
        'FOLLOWUP_COMPLETED',
        -- Phase 5 lead lifecycle event types
        'LEAD_CREATED',
        'LEAD_UPDATED',
        'LEAD_ASSIGNED',
        'LEAD_STATUS_CHANGED',
        'LEAD_ARCHIVED',
        'LEAD_RESTORED'
    )
);
