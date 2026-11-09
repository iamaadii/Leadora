-- 005_create_activities.sql
-- Creates the activities table for immutable lead event and engagement history

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL,
    actor_user_id UUID NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Valid activity type check
    CONSTRAINT chk_activity_type CHECK (
        activity_type IN (
            'CALL',
            'MEETING',
            'EMAIL',
            'NOTE',
            'STATUS_CHANGE',
            'ASSIGNMENT_CHANGE',
            'FOLLOWUP_CREATED',
            'FOLLOWUP_COMPLETED'
        )
    ),

    -- Enforce that the referenced lead belongs to the SAME organization
    CONSTRAINT fk_activities_lead 
        FOREIGN KEY (organization_id, lead_id) 
        REFERENCES leads(organization_id, id) 
        ON DELETE CASCADE,

    -- Enforce that the actor user belongs to the SAME organization
    CONSTRAINT fk_activities_actor 
        FOREIGN KEY (organization_id, actor_user_id) 
        REFERENCES users(organization_id, id) 
        ON DELETE SET NULL
);

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_activities_lead_created ON activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_org_created ON activities(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_metadata ON activities USING GIN (metadata);
