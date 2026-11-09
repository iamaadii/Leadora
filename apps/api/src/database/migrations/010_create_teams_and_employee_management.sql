-- 010_create_teams_and_employee_management.sql
-- Adds must_change_password to users, creates teams and team_members tables

-- 1. Add must_change_password to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    manager_id UUID NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Enforce that manager belongs to the SAME organization
    CONSTRAINT fk_teams_manager
        FOREIGN KEY (organization_id, manager_id)
        REFERENCES users(organization_id, id)
        ON DELETE SET NULL,

    -- Unique team name per organization
    CONSTRAINT uq_teams_org_name UNIQUE (organization_id, name),

    -- Multi-tenant referential anchor for team_members
    CONSTRAINT uq_teams_org_id UNIQUE (organization_id, id)
);

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(organization_id, manager_id) WHERE is_active = TRUE;

-- Auto-update updated_at trigger for teams
DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    removed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Enforce that team belongs to the SAME organization
    CONSTRAINT fk_team_members_team
        FOREIGN KEY (organization_id, team_id)
        REFERENCES teams(organization_id, id)
        ON DELETE CASCADE,

    -- Enforce that employee belongs to the SAME organization
    CONSTRAINT fk_team_members_employee
        FOREIGN KEY (organization_id, employee_id)
        REFERENCES users(organization_id, id)
        ON DELETE CASCADE
);

-- Rule: One active team membership per employee at any given time
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_members_active_employee
    ON team_members (organization_id, employee_id)
    WHERE removed_at IS NULL;

-- Query indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members (team_id) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_org ON team_members (organization_id);

