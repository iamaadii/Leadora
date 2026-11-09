-- 013_create_demo_organization.sql
-- Dedicated isolated demo organization for public interactive read-only exploration

DO $$
DECLARE
    v_demo_org_id UUID;
    v_manager_id UUID;
    v_elena_id UUID;
    v_liam_id UUID;
    v_viewer_id UUID;
    v_team_id UUID;
    v_lead_horizon UUID;
    v_lead_apex UUID;
    v_lead_cyberdyne UUID;
    v_lead_nexus UUID;
    v_lead_vantage UUID;
    v_lead_pinnacle UUID;
    v_lead_bluewave UUID;
BEGIN
    -- 1. Create or get Demo Organization
    SELECT id INTO v_demo_org_id FROM organizations WHERE slug = 'leadora-demo';
    IF v_demo_org_id IS NULL THEN
        INSERT INTO organizations (name, slug, email, phone, website, address, is_active, currency, timezone)
        VALUES (
            'Leadora Showcase Demo',
            'leadora-demo',
            'demo@leadora.example.com',
            '+1-555-0900',
            'https://leadora.example.com',
            '500 Technology Way, Suite 300, Austin, TX 78701',
            TRUE,
            'USD',
            'America/Chicago'
        )
        RETURNING id INTO v_demo_org_id;
    END IF;

    -- 2. Create Users for Demo Org
    -- A. Demo Manager: Alex Mercer
    SELECT id INTO v_manager_id FROM users WHERE organization_id = v_demo_org_id AND email = 'alex.mercer@leadora.example.com';
    IF v_manager_id IS NULL THEN
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
        VALUES (v_demo_org_id, 'Alex', 'Mercer', 'alex.mercer@leadora.example.com', '!LOCKED_DEMO_ACCOUNT!', '+1-555-0901', 'MANAGER', TRUE)
        RETURNING id INTO v_manager_id;
    END IF;

    -- B. Enterprise Rep: Elena Rostova
    SELECT id INTO v_elena_id FROM users WHERE organization_id = v_demo_org_id AND email = 'elena.rostova@leadora.example.com';
    IF v_elena_id IS NULL THEN
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
        VALUES (v_demo_org_id, 'Elena', 'Rostova', 'elena.rostova@leadora.example.com', '!LOCKED_DEMO_ACCOUNT!', '+1-555-0902', 'EMPLOYEE', TRUE)
        RETURNING id INTO v_elena_id;
    END IF;

    -- C. Inbound SDR: Liam Chen
    SELECT id INTO v_liam_id FROM users WHERE organization_id = v_demo_org_id AND email = 'liam.chen@leadora.example.com';
    IF v_liam_id IS NULL THEN
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
        VALUES (v_demo_org_id, 'Liam', 'Chen', 'liam.chen@leadora.example.com', '!LOCKED_DEMO_ACCOUNT!', '+1-555-0903', 'EMPLOYEE', TRUE)
        RETURNING id INTO v_liam_id;
    END IF;

    -- D. Public Demo Viewer: Demo Visitor
    SELECT id INTO v_viewer_id FROM users WHERE organization_id = v_demo_org_id AND email = 'demo-viewer@leadora.example.com';
    IF v_viewer_id IS NULL THEN
        INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
        VALUES (v_demo_org_id, 'Demo', 'Visitor', 'demo-viewer@leadora.example.com', '!LOCKED_DEMO_ACCOUNT!', '+1-555-0904', 'EMPLOYEE', TRUE)
        RETURNING id INTO v_viewer_id;
    END IF;

    -- 3. Team: North America Enterprise
    SELECT id INTO v_team_id FROM teams WHERE organization_id = v_demo_org_id AND name = 'North America Enterprise';
    IF v_team_id IS NULL THEN
        INSERT INTO teams (organization_id, name, description, manager_id, is_active)
        VALUES (v_demo_org_id, 'North America Enterprise', 'High-velocity B2B enterprise software sales and client partnerships.', v_manager_id, TRUE)
        RETURNING id INTO v_team_id;

        -- Assign team members
        INSERT INTO team_members (organization_id, team_id, employee_id)
        VALUES 
            (v_demo_org_id, v_team_id, v_elena_id),
            (v_demo_org_id, v_team_id, v_liam_id),
            (v_demo_org_id, v_team_id, v_viewer_id);
    END IF;

    -- 4. Leads across all pipeline stages
    -- Lead 1: NEW
    SELECT id INTO v_lead_horizon FROM leads WHERE organization_id = v_demo_org_id AND name = 'Sarah Jenkins';
    IF v_lead_horizon IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Sarah Jenkins', 'sjenkins@horizonhealth.example.com', '+1-555-2001', 'Horizon Health Tech', 'Estimated ARR: $28,000. Clinical SaaS workflow solution.', 'NEW', 'WEBSITE', v_elena_id, v_manager_id)
        RETURNING id INTO v_lead_horizon;
    END IF;

    -- Lead 2: CONTACTED
    SELECT id INTO v_lead_apex FROM leads WHERE organization_id = v_demo_org_id AND name = 'Marcus Cole';
    IF v_lead_apex IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Marcus Cole', 'mcole@apexfin.example.com', '+1-555-2002', 'Apex Financial Systems', 'Estimated ARR: $54,000. Seeking core CRM & team assignment.', 'CONTACTED', 'LINKEDIN', v_elena_id, v_manager_id)
        RETURNING id INTO v_lead_apex;
    END IF;

    -- Lead 3: QUALIFIED
    SELECT id INTO v_lead_cyberdyne FROM leads WHERE organization_id = v_demo_org_id AND name = 'T-800 Procurement';
    IF v_lead_cyberdyne IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'T-800 Procurement', 'procure@cyberdyne.example.com', '+1-555-2003', 'Cyberdyne Automations', 'Estimated ARR: $85,000. Hardware and automation telemetry.', 'QUALIFIED', 'REFERRAL', v_liam_id, v_manager_id)
        RETURNING id INTO v_lead_cyberdyne;
    END IF;

    -- Lead 4: PROPOSAL_SENT
    SELECT id INTO v_lead_nexus FROM leads WHERE organization_id = v_demo_org_id AND name = 'Julian Vance';
    IF v_lead_nexus IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Julian Vance', 'jvance@nexusretail.example.com', '+1-555-2004', 'Nexus Retail AI', 'Estimated ARR: $62,000. Proposal sent with multi-seat discount.', 'PROPOSAL_SENT', 'EVENT', v_liam_id, v_manager_id)
        RETURNING id INTO v_lead_nexus;
    END IF;

    -- Lead 5: INTERESTED (Negotiation)
    SELECT id INTO v_lead_vantage FROM leads WHERE organization_id = v_demo_org_id AND name = 'Rachel Adams';
    IF v_lead_vantage IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Rachel Adams', 'radams@vantagecloud.example.com', '+1-555-2005', 'Vantage Cloud Systems', 'Estimated ARR: $120,000. Custom SLA and security compliance review.', 'INTERESTED', 'WEBSITE', v_elena_id, v_manager_id)
        RETURNING id INTO v_lead_vantage;
    END IF;

    -- Lead 6: CONVERTED (Won)
    SELECT id INTO v_lead_pinnacle FROM leads WHERE organization_id = v_demo_org_id AND name = 'Arthur Pendelton';
    IF v_lead_pinnacle IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Arthur Pendelton', 'apendelton@pinnacle.example.com', '+1-555-2006', 'Pinnacle Energy Partners', 'Estimated ARR: $150,000. Deal won and multi-year contract signed.', 'CONVERTED', 'COLD_CALL', v_elena_id, v_manager_id)
        RETURNING id INTO v_lead_pinnacle;
    END IF;

    -- Lead 7: LOST
    SELECT id INTO v_lead_bluewave FROM leads WHERE organization_id = v_demo_org_id AND name = 'Gregory House';
    IF v_lead_bluewave IS NULL THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Gregory House', 'ghouse@bluewave.example.com', '+1-555-2007', 'BlueWave Oceanics', 'Lost to competitor due to legacy on-premise requirement.', 'LOST', 'OTHER', v_liam_id, v_manager_id)
        RETURNING id INTO v_lead_bluewave;
    END IF;

    -- Additional leads for rich pipeline analytics
    IF NOT EXISTS (SELECT 1 FROM leads WHERE organization_id = v_demo_org_id AND name = 'Dr. Robert Lang') THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Dr. Robert Lang', 'rlang@starlightbio.example.com', '+1-555-2008', 'Starlight BioPharma', 'Estimated ARR: $95,000. Qualified pipeline deal.', 'QUALIFIED', 'REFERRAL', v_liam_id, v_manager_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM leads WHERE organization_id = v_demo_org_id AND name = 'Capt. Victoria Chase') THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Capt. Victoria Chase', 'vchase@quantumaero.example.com', '+1-555-2009', 'Quantum Aerospace', 'Estimated ARR: $140,000. Proposal sent.', 'PROPOSAL_SENT', 'EVENT', v_elena_id, v_manager_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM leads WHERE organization_id = v_demo_org_id AND name = 'Kendra Shaw') THEN
        INSERT INTO leads (organization_id, name, email, phone, company, description, status, source, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, 'Kendra Shaw', 'kshaw@silverline.example.com', '+1-555-2010', 'Silverline Logistics', 'Estimated ARR: $75,000. Converted customer.', 'CONVERTED', 'WEBSITE', v_liam_id, v_manager_id);
    END IF;

    -- 5. Follow-ups
    -- Overdue
    IF NOT EXISTS (SELECT 1 FROM followups WHERE organization_id = v_demo_org_id AND title = 'Executive Contract Review with Vantage Cloud') THEN
        INSERT INTO followups (organization_id, lead_id, title, description, type, priority, status, due_at, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, v_lead_vantage, 'Executive Contract Review with Vantage Cloud', 'Final review of security SLA and payment milestones.', 'CALL', 'HIGH', 'PENDING', NOW() - INTERVAL '2 days', v_elena_id, v_manager_id);
    END IF;

    -- Due Today
    IF NOT EXISTS (SELECT 1 FROM followups WHERE organization_id = v_demo_org_id AND title = 'Pricing & Architecture Deep Dive with Nexus Retail') THEN
        INSERT INTO followups (organization_id, lead_id, title, description, type, priority, status, due_at, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, v_lead_nexus, 'Pricing & Architecture Deep Dive with Nexus Retail', 'Technical demo of multi-store POS connector with Julian Vance.', 'MEETING', 'HIGH', 'PENDING', NOW() + INTERVAL '2 hours', v_liam_id, v_manager_id);
    END IF;

    -- Upcoming
    IF NOT EXISTS (SELECT 1 FROM followups WHERE organization_id = v_demo_org_id AND title = 'Discovery & Needs Analysis with Horizon Health') THEN
        INSERT INTO followups (organization_id, lead_id, title, description, type, priority, status, due_at, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, v_lead_horizon, 'Discovery & Needs Analysis with Horizon Health', 'Initial discovery call to qualify clinical workflow requirements.', 'CALL', 'MEDIUM', 'PENDING', NOW() + INTERVAL '1 day', v_elena_id, v_manager_id);
    END IF;

    -- Completed
    IF NOT EXISTS (SELECT 1 FROM followups WHERE organization_id = v_demo_org_id AND title = 'Initial Proposal Walkthrough with Pinnacle Energy') THEN
        INSERT INTO followups (organization_id, lead_id, title, description, type, priority, status, due_at, completed_at, completion_notes, assigned_to_id, created_by_id)
        VALUES (v_demo_org_id, v_lead_pinnacle, 'Initial Proposal Walkthrough with Pinnacle Energy', 'Walk through Q4 commercial terms with Arthur Pendelton.', 'MEETING', 'HIGH', 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'Customer approved enterprise annual agreement. Contract signed.', v_elena_id, v_manager_id);
    END IF;

    -- 6. Activities Feed
    IF NOT EXISTS (SELECT 1 FROM activities WHERE organization_id = v_demo_org_id) THEN
        INSERT INTO activities (organization_id, lead_id, actor_user_id, activity_type, description, created_at)
        VALUES
            (v_demo_org_id, v_lead_pinnacle, v_elena_id, 'STATUS_CHANGE', 'Advanced deal status to CONVERTED ($150,000 ARR signed).', NOW() - INTERVAL '3 days'),
            (v_demo_org_id, v_lead_vantage, v_elena_id, 'STATUS_CHANGE', 'Moved opportunity to INTERESTED negotiation stage.', NOW() - INTERVAL '4 days'),
            (v_demo_org_id, v_lead_nexus, v_liam_id, 'CALL', 'Completed product walkthrough demo call with Julian Vance.', NOW() - INTERVAL '1 day'),
            (v_demo_org_id, v_lead_horizon, v_elena_id, 'NOTE', 'Inbound lead captured from marketing website.', NOW() - INTERVAL '5 days');
    END IF;

    -- 7. Notifications
    IF NOT EXISTS (SELECT 1 FROM notifications WHERE organization_id = v_demo_org_id) THEN
        INSERT INTO notifications (organization_id, user_id, title, message, notification_type, is_read, created_at)
        VALUES
            (v_demo_org_id, v_viewer_id, 'Welcome to Leadora Live Demo', 'You are currently viewing an interactive read-only demonstration workspace.', 'SYSTEM', FALSE, NOW()),
            (v_demo_org_id, v_viewer_id, 'Opportunity Assigned', 'Elena Rostova assigned Horizon Health Tech to your team roster.', 'LEAD_ASSIGNED', FALSE, NOW() - INTERVAL '1 day');
    END IF;

END $$;
