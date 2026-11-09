import argon2 from 'argon2';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from '../../config/database.js';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  const defaultPassword = 'Password123!';
  const passwordHash = await argon2.hash(defaultPassword);

  await withTransaction(async (client) => {
    // ------------------------------------------------------------------------
    // 1. Demo Organization
    // ------------------------------------------------------------------------
    console.log('🏢 Seeding demo organization...');
    let orgRes = await client.query(
      `SELECT id FROM organizations WHERE slug = $1;`,
      ['acme-sales'],
    );

    let orgId;
    if (orgRes.rows.length === 0) {
      const newOrg = await client.query(
        `INSERT INTO organizations (name, slug, email, phone, website, address, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id;`,
        [
          'Acme Sales Corp',
          'acme-sales',
          'contact@acmesales.example.com',
          '+1-555-0100',
          'https://acmesales.example.com',
          '100 Market St, Suite 400, San Francisco, CA 94105',
          true,
        ],
      );
      orgId = newOrg.rows[0].id;
      console.log(`   Created organization: Acme Sales Corp (${orgId})`);
    } else {
      orgId = orgRes.rows[0].id;
      console.log(`   Organization already exists (${orgId})`);
    }

    // ------------------------------------------------------------------------
    // 2. Users (Super Admin, Admin, Manager, 2 Employees)
    // ------------------------------------------------------------------------
    console.log('👥 Seeding users...');

    // A. Platform Super Admin (organization_id is NULL)
    let superAdminRes = await client.query(
      `SELECT id FROM users WHERE email = $1 AND organization_id IS NULL;`,
      ['superadmin@platform.com'],
    );
    if (superAdminRes.rows.length === 0) {
      await client.query(
        `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
         RETURNING id;`,
        ['Super', 'Admin', 'superadmin@platform.com', passwordHash, '+1-555-0001', 'SUPER_ADMIN', true],
      );
      console.log('   Created Super Admin: superadmin@platform.com');
    } else {
      console.log('   Super Admin already exists.');
    }

    // Helper to upsert tenant users
    async function upsertTenantUser(firstName, lastName, email, role, phone) {
      const existing = await client.query(
        `SELECT id FROM users WHERE organization_id = $1 AND email = $2;`,
        [orgId, email],
      );
      if (existing.rows.length > 0) {
        return existing.rows[0].id;
      }
      const created = await client.query(
        `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, phone, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id;`,
        [orgId, firstName, lastName, email, passwordHash, phone, role, true],
      );
      console.log(`   Created ${role}: ${email}`);
      return created.rows[0].id;
    }

    const adminId = await upsertTenantUser('Sarah', 'Connor', 'admin@acme.com', 'ADMIN', '+1-555-0101');
    const managerId = await upsertTenantUser('Marcus', 'Vance', 'manager@acme.com', 'MANAGER', '+1-555-0102');
    const aliceId = await upsertTenantUser('Alice', 'Smith', 'alice@acme.com', 'EMPLOYEE', '+1-555-0103');
    const bobId = await upsertTenantUser('Bob', 'Johnson', 'bob@acme.com', 'EMPLOYEE', '+1-555-0104');

    // ------------------------------------------------------------------------
    // 3. Leads (at least 10 realistic leads across various stages)
    // ------------------------------------------------------------------------
    console.log('💼 Seeding leads...');

    const sampleLeads = [
      {
        name: 'David Miller',
        email: 'dmiller@techstart.io',
        phone: '+1-555-1001',
        company: 'TechStart Inc',
        source: 'WEBSITE',
        status: 'NEW',
        assignedToId: aliceId,
        createdById: adminId,
        description: 'Inbound inquiry requesting product demo for 50-person sales team.',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@apexlogistics.com',
        phone: '+1-555-1002',
        company: 'Apex Logistics LLC',
        source: 'COLD_CALL',
        status: 'CONTACTED',
        assignedToId: aliceId,
        createdById: aliceId,
        description: 'First call completed. Interested in automated follow-up workflows.',
      },
      {
        name: 'James Chen',
        email: 'jchen@cloudnova.net',
        phone: '+1-555-1003',
        company: 'CloudNova Systems',
        source: 'LINKEDIN',
        status: 'INTERESTED',
        assignedToId: bobId,
        createdById: managerId,
        description: 'Looking to replace outdated spreadsheets with a structured CRM.',
      },
      {
        name: 'Dr. Rachel Green',
        email: 'rgreen@biolabs.org',
        phone: '+1-555-1004',
        company: 'Global BioLabs Corp',
        source: 'REFERRAL',
        status: 'QUALIFIED',
        assignedToId: bobId,
        createdById: bobId,
        description: 'Budget confirmed ($30k annual). Key decision maker is VP of Operations.',
      },
      {
        name: 'Michael Torres',
        email: 'mtorres@vanguardretail.com',
        phone: '+1-555-1005',
        company: 'Vanguard Retail Chain',
        source: 'WEBSITE',
        status: 'PROPOSAL_SENT',
        assignedToId: aliceId,
        createdById: aliceId,
        description: 'Custom proposal sent for enterprise rollout across 12 branch offices.',
      },
      {
        name: 'Sophia Patel',
        email: 'spatel@horizonhealth.care',
        phone: '+1-555-1006',
        company: 'Horizon Health Network',
        source: 'EVENT',
        status: 'CONVERTED',
        assignedToId: bobId,
        createdById: managerId,
        description: 'Contract signed! Successfully converted after 45-day sales cycle.',
      },
      {
        name: 'Arthur Pendelton',
        email: 'apendelton@solarismedia.tv',
        phone: '+1-555-1007',
        company: 'Solaris Media Group',
        source: 'COLD_CALL',
        status: 'LOST',
        assignedToId: aliceId,
        createdById: aliceId,
        description: 'Customer opted to postpone CRM upgrades until Q4 due to budget freeze.',
      },
      {
        name: 'Lucas Wright',
        email: 'lwright@quantumrobotics.ai',
        phone: '+1-555-1008',
        company: 'Quantum Robotics Labs',
        source: 'REFERRAL',
        status: 'QUALIFIED',
        assignedToId: managerId,
        createdById: adminId,
        description: 'High-growth AI startup. Needs rapid integration and activity history.',
      },
      {
        name: 'Olivia Martinez',
        email: 'omartinez@evergreenpack.com',
        phone: '+1-555-1009',
        company: 'Evergreen Packaging Solutions',
        source: 'WEBSITE',
        status: 'CONTACTED',
        assignedToId: bobId,
        createdById: bobId,
        description: 'Requested pricing information for multi-user licenses.',
      },
      {
        name: 'Brian O’Connor',
        email: 'boconnor@summitfin.com',
        phone: '+1-555-1010',
        company: 'Summit Financial Partners',
        source: 'OTHER',
        status: 'PROPOSAL_SENT',
        assignedToId: aliceId,
        createdById: adminId,
        description: 'Proposal currently under review by compliance and legal team.',
      },
      {
        name: 'Claire Dupont',
        email: 'cdupont@pinnaclearch.com',
        phone: '+1-555-1011',
        company: 'Pinnacle Architecture Studio',
        source: 'WEBSITE',
        status: 'NEW',
        assignedToId: null,
        createdById: adminId,
        description: 'Unassigned inbound lead from website contact form.',
      },
      {
        name: 'Gregory House',
        email: 'ghouse@bluewave.io',
        phone: '+1-555-1012',
        company: 'BlueWave Marine Technologies',
        source: 'EVENT',
        status: 'INTERESTED',
        assignedToId: bobId,
        createdById: bobId,
        description: 'Met at annual trade show. Follow-up demo requested.',
      },
    ];

    const leadIdMap = {};

    for (const lead of sampleLeads) {
      const existingLead = await client.query(
        `SELECT id FROM leads WHERE organization_id = $1 AND email = $2;`,
        [orgId, lead.email],
      );

      if (existingLead.rows.length === 0) {
        const res = await client.query(
          `INSERT INTO leads (
             organization_id, name, email, phone, company, source, status,
             assigned_to_id, description, created_by_id
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id;`,
          [
            orgId,
            lead.name,
            lead.email,
            lead.phone,
            lead.company,
            lead.source,
            lead.status,
            lead.assignedToId,
            lead.description,
            lead.createdById,
          ],
        );
        leadIdMap[lead.company] = res.rows[0].id;
      } else {
        leadIdMap[lead.company] = existingLead.rows[0].id;
      }
    }
    console.log(`   Seeded ${sampleLeads.length} sample leads.`);

    // ------------------------------------------------------------------------
    // 4. Follow-ups (Pending, Overdue, Completed, Cancelled)
    // ------------------------------------------------------------------------
    console.log('📅 Seeding follow-ups...');

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const sampleFollowups = [
      {
        company: 'TechStart Inc',
        assignedToId: aliceId,
        createdById: aliceId,
        title: 'Initial Discovery Call',
        description: 'Call David to review their team size, current pain points, and schedule demo.',
        dueAt: twoDaysFromNow,
        status: 'PENDING',
        completedAt: null,
      },
      {
        company: 'Apex Logistics LLC',
        assignedToId: aliceId,
        createdById: aliceId,
        title: 'Send Custom Demo Recording',
        description: 'Overdue task: Record and email workflow walkthrough video for Elena.',
        dueAt: yesterday,
        status: 'PENDING',
        completedAt: null,
      },
      {
        company: 'CloudNova Systems',
        assignedToId: bobId,
        createdById: bobId,
        title: 'Live Product Demo with Technical Team',
        description: 'Demonstrate custom reporting and pipeline stage management via Zoom.',
        dueAt: now,
        status: 'PENDING',
        completedAt: null,
      },
      {
        company: 'Global BioLabs Corp',
        assignedToId: bobId,
        createdById: bobId,
        title: 'Send Enterprise Price Quote',
        description: 'Delivered standard quote with 30-seat tier discount.',
        dueAt: threeDaysAgo,
        status: 'COMPLETED',
        completedAt: threeDaysAgo,
      },
      {
        company: 'Vanguard Retail Chain',
        assignedToId: aliceId,
        createdById: aliceId,
        title: 'Contract Review Call with Legal',
        description: 'Follow up on MSA redlines sent by Vanguard procurement.',
        dueAt: fiveDaysFromNow,
        status: 'PENDING',
        completedAt: null,
      },
      {
        company: 'Solaris Media Group',
        assignedToId: aliceId,
        createdById: aliceId,
        title: 'Check in on Q4 Budget Reallocation',
        description: 'Customer canceled follow-up due to internal leadership restructuring.',
        dueAt: yesterday,
        status: 'CANCELLED',
        completedAt: null,
      },
    ];

    for (const item of sampleFollowups) {
      const leadId = leadIdMap[item.company];
      if (!leadId) continue;

      const existingFollowup = await client.query(
        `SELECT id FROM followups WHERE organization_id = $1 AND lead_id = $2 AND title = $3;`,
        [orgId, leadId, item.title],
      );

      if (existingFollowup.rows.length === 0) {
        await client.query(
          `INSERT INTO followups (
             organization_id, lead_id, assigned_to_id, title, description,
             due_at, status, completed_at, created_by_id
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            orgId,
            leadId,
            item.assignedToId,
            item.title,
            item.description,
            item.dueAt,
            item.status,
            item.completedAt,
            item.createdById,
          ],
        );
      }
    }
    console.log(`   Seeded ${sampleFollowups.length} sample follow-up tasks.`);

    // ------------------------------------------------------------------------
    // 5. Activities (Timeline History)
    // ------------------------------------------------------------------------
    console.log('📜 Seeding activities...');

    const sampleActivities = [
      {
        company: 'TechStart Inc',
        actorId: aliceId,
        type: 'CALL',
        description: 'Connected with David via phone. Verified budget and agreed on demo date.',
        metadata: { durationMinutes: 18, outcome: 'DEMO_SCHEDULED' },
      },
      {
        company: 'CloudNova Systems',
        actorId: bobId,
        type: 'STATUS_CHANGE',
        description: 'Lead progressed from CONTACTED to INTERESTED following positive email exchange.',
        metadata: { oldStatus: 'CONTACTED', newStatus: 'INTERESTED' },
      },
      {
        company: 'Global BioLabs Corp',
        actorId: bobId,
        type: 'FOLLOWUP_COMPLETED',
        description: 'Completed follow-up: Send Enterprise Price Quote.',
        metadata: { quoteAmount: 30000, currency: 'USD' },
      },
      {
        company: 'Vanguard Retail Chain',
        actorId: aliceId,
        type: 'NOTE',
        description: 'Client legal counsel requested standard confidentiality clause revision.',
        metadata: { priority: 'HIGH' },
      },
      {
        company: 'Horizon Health Network',
        actorId: bobId,
        type: 'STATUS_CHANGE',
        description: 'Deal closed! Moved status to CONVERTED.',
        metadata: { contractValue: 48000, billingCycle: 'ANNUAL' },
      },
    ];

    for (const act of sampleActivities) {
      const leadId = leadIdMap[act.company];
      if (!leadId) continue;

      const existingAct = await client.query(
        `SELECT id FROM activities WHERE organization_id = $1 AND lead_id = $2 AND description = $3;`,
        [orgId, leadId, act.description],
      );

      if (existingAct.rows.length === 0) {
        await client.query(
          `INSERT INTO activities (organization_id, lead_id, actor_user_id, activity_type, description, metadata)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [orgId, leadId, act.actorId, act.type, act.description, JSON.stringify(act.metadata)],
        );
      }
    }
    console.log(`   Seeded ${sampleActivities.length} sample activities.`);

    // ------------------------------------------------------------------------
    // 6. Sample Notifications
    // ------------------------------------------------------------------------
    console.log('🔔 Seeding notifications...');

    const sampleNotifications = [
      {
        userId: aliceId,
        title: 'New Lead Assigned',
        message: 'Lead "David Miller (TechStart Inc)" has been assigned to you.',
        type: 'LEAD_ASSIGNED',
        isRead: false,
      },
      {
        userId: aliceId,
        title: 'Follow-up Overdue',
        message: 'Task "Send Custom Demo Recording" for Apex Logistics LLC is overdue.',
        type: 'FOLLOWUP_OVERDUE',
        isRead: false,
      },
      {
        userId: bobId,
        title: 'Deal Won',
        message: 'Congratulations! Lead "Horizon Health Network" was successfully converted.',
        type: 'DEAL_CONVERTED',
        isRead: true,
      },
    ];

    for (const notif of sampleNotifications) {
      const existing = await client.query(
        `SELECT id FROM notifications WHERE organization_id = $1 AND user_id = $2 AND title = $3;`,
        [orgId, notif.userId, notif.title],
      );

      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO notifications (organization_id, user_id, title, message, notification_type, is_read, read_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [
            orgId,
            notif.userId,
            notif.title,
            notif.message,
            notif.type,
            notif.isRead,
            notif.isRead ? new Date() : null,
          ],
        );
      }
    }
    console.log(`   Seeded ${sampleNotifications.length} sample notifications.`);

    // ------------------------------------------------------------------------
    // 7. Audit Log Entry
    // ------------------------------------------------------------------------
    console.log('🛡️ Seeding initial audit log...');
    await client.query(
      `INSERT INTO audit_logs (organization_id, actor_user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        orgId,
        adminId,
        'DATABASE_SEED',
        'SYSTEM',
        orgId,
        JSON.stringify({ seededAt: new Date().toISOString(), status: 'SUCCESS' }),
        '127.0.0.1',
      ],
    );

    console.log('\n✨ Database seeding completed successfully!');
  });
}

// Allow direct CLI execution: node src/database/seeds/seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error seeding database:', err);
      await pool.end();
      process.exit(1);
    });
}

