-- 003_create_leads.sql
-- Creates the leads table with composite tenant foreign keys

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    company VARCHAR(255) NULL,
    source VARCHAR(50) DEFAULT 'WEBSITE' NOT NULL,
    status VARCHAR(50) DEFAULT 'NEW' NOT NULL,
    assigned_to_id UUID NULL,
    description TEXT NULL,
    created_by_id UUID NULL,
    archived_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Valid lead status check
    CONSTRAINT chk_lead_status CHECK (
        status IN ('NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST')
    ),

    -- Enforce that assigned user belongs to the SAME organization
    CONSTRAINT fk_leads_assigned_user 
        FOREIGN KEY (organization_id, assigned_to_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE SET NULL,

    -- Enforce that creator user belongs to the SAME organization
    CONSTRAINT fk_leads_created_by 
        FOREIGN KEY (organization_id, created_by_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE SET NULL,

    -- Multi-tenant referential integrity anchor for followups and activities
    CONSTRAINT uq_leads_org_id UNIQUE (organization_id, id)
);

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_status ON leads(organization_id, status) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_org_assigned ON leads(organization_id, assigned_to_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_org_created_at ON leads(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(organization_id, LOWER(email));
CREATE INDEX IF NOT EXISTS idx_leads_archived_at ON leads(organization_id, archived_at);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
