-- 004_create_followups.sql
-- Creates the followups table with composite tenant foreign keys

CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL,
    assigned_to_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    completed_at TIMESTAMPTZ NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Valid status check
    CONSTRAINT chk_followup_status CHECK (
        status IN ('PENDING', 'COMPLETED', 'CANCELLED')
    ),

    -- Enforce that the referenced lead belongs to the SAME organization
    CONSTRAINT fk_followups_lead 
        FOREIGN KEY (organization_id, lead_id) 
        REFERENCES leads(organization_id, id) 
        ON DELETE CASCADE,

    -- Enforce that the assigned user belongs to the SAME organization
    CONSTRAINT fk_followups_assigned_to 
        FOREIGN KEY (organization_id, assigned_to_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE RESTRICT,

    -- Enforce that the creator user belongs to the SAME organization
    CONSTRAINT fk_followups_created_by 
        FOREIGN KEY (organization_id, created_by_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE RESTRICT
);

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_followups_org_due_at ON followups(organization_id, due_at);
CREATE INDEX IF NOT EXISTS idx_followups_org_assigned_status ON followups(organization_id, assigned_to_id, status);
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON followups(lead_id);
-- Partial index optimized for pending & overdue queries
CREATE INDEX IF NOT EXISTS idx_followups_pending_due ON followups(organization_id, status, due_at) WHERE status = 'PENDING';

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trg_followups_updated_at ON followups;
CREATE TRIGGER trg_followups_updated_at
    BEFORE UPDATE ON followups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

