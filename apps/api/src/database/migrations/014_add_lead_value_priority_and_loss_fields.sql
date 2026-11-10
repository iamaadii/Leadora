-- 014_add_lead_value_priority_and_loss_fields.sql
-- Adds estimated_value, priority, loss_reason, and loss_notes to leads table

-- 1. Add estimated_value (NUMERIC(14, 2) to prevent floating-point inaccuracy)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(14, 2) NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_lead_estimated_value_non_negative'
    ) THEN
        ALTER TABLE leads 
        ADD CONSTRAINT chk_lead_estimated_value_non_negative 
        CHECK (estimated_value IS NULL OR estimated_value >= 0);
    END IF;
END $$;

-- 2. Add priority (LOW, MEDIUM, HIGH, URGENT, defaulting to MEDIUM)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_lead_priority'
    ) THEN
        ALTER TABLE leads 
        ADD CONSTRAINT chk_lead_priority 
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));
    END IF;
END $$;

-- 3. Add loss_reason and loss_notes for mandatory loss tracking
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS loss_reason VARCHAR(255) NULL;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS loss_notes TEXT NULL;

-- 4. Add query performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_priority 
ON leads(organization_id, priority) 
WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_org_estimated_value 
ON leads(organization_id, estimated_value DESC) 
WHERE archived_at IS NULL;
