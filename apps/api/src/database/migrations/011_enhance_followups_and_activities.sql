-- 011_enhance_followups_and_activities.sql
-- Enhances followups table with type, priority, completed_by_id, and completion_notes
-- Expands activities check constraint for all followup lifecycle event types

-- 1. Add type column to followups
ALTER TABLE followups 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'CALL' NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_followup_type'
    ) THEN
        ALTER TABLE followups 
        ADD CONSTRAINT chk_followup_type 
        CHECK (type IN ('CALL', 'EMAIL', 'MEETING', 'TASK'));
    END IF;
END $$;

-- 2. Add priority column to followups
ALTER TABLE followups 
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_followup_priority'
    ) THEN
        ALTER TABLE followups 
        ADD CONSTRAINT chk_followup_priority 
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'));
    END IF;
END $$;

-- 3. Add completed_by_id and completion_notes to followups
ALTER TABLE followups 
ADD COLUMN IF NOT EXISTS completed_by_id UUID NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_followups_completed_by'
    ) THEN
        ALTER TABLE followups 
        ADD CONSTRAINT fk_followups_completed_by 
        FOREIGN KEY (organization_id, completed_by_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE followups 
ADD COLUMN IF NOT EXISTS completion_notes TEXT NULL;

-- 4. Additional fast query indexes for followups
CREATE INDEX IF NOT EXISTS idx_followups_org_priority ON followups(organization_id, priority);
CREATE INDEX IF NOT EXISTS idx_followups_org_type ON followups(organization_id, type);

-- 5. Expand activity types check constraint in activities table
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activity_type;

ALTER TABLE activities ADD CONSTRAINT chk_activity_type CHECK (
    activity_type IN (
        -- Communication & notes
        'CALL',
        'MEETING',
        'EMAIL',
        'NOTE',
        'STATUS_CHANGE',
        'ASSIGNMENT_CHANGE',
        -- Follow-up lifecycle events (Phase 7)
        'FOLLOWUP_CREATED',
        'FOLLOWUP_UPDATED',
        'FOLLOWUP_REASSIGNED',
        'FOLLOWUP_COMPLETED',
        'FOLLOWUP_CANCELLED',
        'FOLLOWUP_RESCHEDULED',
        -- Lead lifecycle events (Phase 5)
        'LEAD_CREATED',
        'LEAD_UPDATED',
        'LEAD_ASSIGNED',
        'LEAD_STATUS_CHANGED',
        'LEAD_ARCHIVED',
        'LEAD_RESTORED'
    )
);
