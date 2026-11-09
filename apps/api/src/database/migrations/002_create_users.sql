-- 002_create_users.sql
-- Creates the users table with role and tenant isolation constraints

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Role valid values
    CONSTRAINT chk_user_role CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')),
    
    -- Super Admin has NULL organization_id; all other roles MUST have an organization_id
    CONSTRAINT chk_user_org_super_admin CHECK (
        (role = 'SUPER_ADMIN' AND organization_id IS NULL) OR
        (role != 'SUPER_ADMIN' AND organization_id IS NOT NULL)
    ),

    -- Multi-tenant referential integrity anchor: allows child tables to reference (organization_id, user_id)
    CONSTRAINT uq_users_org_id UNIQUE (organization_id, id)
);

-- Unique email per organization for regular users
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_org_email 
    ON users(organization_id, LOWER(email)) 
    WHERE organization_id IS NOT NULL;

-- Unique email for platform super admin (where organization_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_superadmin_email 
    ON users(LOWER(email)) 
    WHERE organization_id IS NULL;

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(organization_id, is_active);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

