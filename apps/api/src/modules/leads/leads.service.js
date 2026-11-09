import { leadsRepository } from './leads.repository.js';
import { withTransaction } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';
import { LEAD_ACTIVITY_TYPES } from './leads.constants.js';

export const leadsService = {
  /**
   * Create a new lead with audit activity in a single transaction
   */
  async createLead(user, leadData) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot create organization leads directly.',
        'FORBIDDEN',
      );
    }

    const {
      name,
      email,
      phone,
      company,
      source = 'WEBSITE',
      status = 'NEW',
      assigned_to_id,
      description,
    } = leadData;

    // Check Employee role restrictions
    if (user.role === 'EMPLOYEE' && assigned_to_id && assigned_to_id !== user.id) {
      throw AppError.forbidden(
        'Employees cannot assign leads to other team members.',
        'FORBIDDEN',
      );
    }

    // Verify assigned employee belongs to the same organization and is active
    let assigneeName = null;
    if (assigned_to_id) {
      const assignee = await leadsRepository.findActiveUserInOrg(
        assigned_to_id,
        user.organizationId,
      );
      if (!assignee) {
        throw AppError.badRequest(
          'Assigned employee was not found or is inactive in your organization.',
          'INVALID_ASSIGNEE',
        );
      }
      assigneeName = `${assignee.first_name} ${assignee.last_name}`;
    }

    return await withTransaction(async (client) => {
      // 1. Insert lead record
      const createdLead = await leadsRepository.create(
        {
          organization_id: user.organizationId,
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
          source,
          status,
          assigned_to_id: assigned_to_id || null,
          description: description || null,
          created_by_id: user.id,
        },
        client,
      );

      // 2. Record lead creation activity
      const activityDescription = assigneeName
        ? `Lead "${name}" created and assigned to ${assigneeName}`
        : `Lead "${name}" created`;

      await leadsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: createdLead.id,
          actor_user_id: user.id,
          activity_type: LEAD_ACTIVITY_TYPES.CREATED,
          description: activityDescription,
          metadata: {
            status: createdLead.status,
            source: createdLead.source,
            assigned_to_id: createdLead.assigned_to_id,
          },
        },
        client,
      );

      return createdLead;
    });
  },

  /**
   * Retrieve paginated leads with filters
   */
  async getLeads(user, queryParams) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization leads directly.',
        'FORBIDDEN',
      );
    }

    return await leadsRepository.findMany({
      ...queryParams,
      organizationId: user.organizationId,
      role: user.role,
      userId: user.id,
    });
  },

  /**
   * Get lead by ID with recent activity history
   */
  async getLeadById(user, leadId) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization leads directly.',
        'FORBIDDEN',
      );
    }

    const lead = await leadsRepository.findById(leadId, user.organizationId);

    if (!lead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Role check for Employee
    if (
      user.role === 'EMPLOYEE' &&
      lead.assigned_to_id !== user.id &&
      lead.created_by_id !== user.id
    ) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Fetch recent activities
    const recentActivities = await leadsRepository.findActivities(
      leadId,
      user.organizationId,
      { page: 1, limit: 10 },
    );

    return {
      ...lead,
      recent_activities: recentActivities.data,
    };
  },

  /**
   * Update lead fields with activity tracking
   */
  async updateLead(user, leadId, updateData) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization leads directly.',
        'FORBIDDEN',
      );
    }

    const existingLead = await leadsRepository.findById(leadId, user.organizationId);

    if (!existingLead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Role check for Employee
    if (
      user.role === 'EMPLOYEE' &&
      existingLead.assigned_to_id !== user.id &&
      existingLead.created_by_id !== user.id
    ) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Clean and sanitize input to prevent modifying protected fields
    const allowedKeys = [
      'name',
      'email',
      'phone',
      'company',
      'source',
      'status',
      'assigned_to_id',
      'description',
    ];

    const fieldsToUpdate = {};
    const changedFields = [];

    for (const key of allowedKeys) {
      if (updateData[key] !== undefined) {
        let val = updateData[key];
        if (typeof val === 'string') val = val.trim();
        if (val === '') val = null;

        // Check if actually changed
        if (val !== existingLead[key]) {
          fieldsToUpdate[key] = val;
          changedFields.push(key);
        }
      }
    }

    if (changedFields.length === 0) {
      return existingLead;
    }

    // Validate reassignment permissions
    if (
      fieldsToUpdate.assigned_to_id !== undefined &&
      fieldsToUpdate.assigned_to_id !== existingLead.assigned_to_id
    ) {
      if (user.role === 'EMPLOYEE') {
        throw AppError.forbidden(
          'Employees cannot reassign leads to other users.',
          'FORBIDDEN',
        );
      }

      if (fieldsToUpdate.assigned_to_id) {
        const assignee = await leadsRepository.findActiveUserInOrg(
          fieldsToUpdate.assigned_to_id,
          user.organizationId,
        );
        if (!assignee) {
          throw AppError.badRequest(
            'Assigned employee not found or is inactive in your organization.',
            'INVALID_ASSIGNEE',
          );
        }
      }
    }

    return await withTransaction(async (client) => {
      // 1. Update lead
      const updatedLead = await leadsRepository.update(
        leadId,
        user.organizationId,
        fieldsToUpdate,
        client,
      );

      // 2. Record status change activity if status changed
      if (fieldsToUpdate.status && fieldsToUpdate.status !== existingLead.status) {
        await leadsRepository.createActivity(
          {
            organization_id: user.organizationId,
            lead_id: leadId,
            actor_user_id: user.id,
            activity_type: LEAD_ACTIVITY_TYPES.STATUS_CHANGED,
            description: `Lead status changed from ${existingLead.status} to ${fieldsToUpdate.status}`,
            metadata: {
              old_status: existingLead.status,
              new_status: fieldsToUpdate.status,
            },
          },
          client,
        );
      }

      // 3. Record assignment change activity if assigned_to_id changed
      if (
        fieldsToUpdate.assigned_to_id !== undefined &&
        fieldsToUpdate.assigned_to_id !== existingLead.assigned_to_id
      ) {
        await leadsRepository.createActivity(
          {
            organization_id: user.organizationId,
            lead_id: leadId,
            actor_user_id: user.id,
            activity_type: LEAD_ACTIVITY_TYPES.ASSIGNED,
            description: fieldsToUpdate.assigned_to_id
              ? `Lead reassigned to employee ID ${fieldsToUpdate.assigned_to_id}`
              : `Lead unassigned`,
            metadata: {
              old_assigned_to_id: existingLead.assigned_to_id,
              new_assigned_to_id: fieldsToUpdate.assigned_to_id,
            },
          },
          client,
        );
      }

      // 4. Record general update activity for other fields
      const nonStatusNonAssignFields = changedFields.filter(
        (f) => f !== 'status' && f !== 'assigned_to_id',
      );

      if (nonStatusNonAssignFields.length > 0) {
        await leadsRepository.createActivity(
          {
            organization_id: user.organizationId,
            lead_id: leadId,
            actor_user_id: user.id,
            activity_type: LEAD_ACTIVITY_TYPES.UPDATED,
            description: `Lead details updated (${nonStatusNonAssignFields.join(', ')})`,
            metadata: {
              changed_fields: nonStatusNonAssignFields,
            },
          },
          client,
        );
      }

      return updatedLead;
    });
  },

  /**
   * Archive lead (Admin only)
   */
  async archiveLead(user, leadId) {
    if (user.role !== 'ADMIN') {
      throw AppError.forbidden(
        'Only Administrators have permission to archive leads.',
        'FORBIDDEN',
      );
    }

    const existingLead = await leadsRepository.findById(leadId, user.organizationId);

    if (!existingLead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    if (existingLead.archived_at) {
      throw AppError.badRequest('Lead is already archived', 'ALREADY_ARCHIVED');
    }

    return await withTransaction(async (client) => {
      const archivedLead = await leadsRepository.archive(
        leadId,
        user.organizationId,
        client,
      );

      await leadsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: leadId,
          actor_user_id: user.id,
          activity_type: LEAD_ACTIVITY_TYPES.ARCHIVED,
          description: `Lead was archived by ${user.firstName} ${user.lastName}`,
          metadata: {
            archived_at: archivedLead.archived_at,
          },
        },
        client,
      );

      return archivedLead;
    });
  },

  /**
   * Restore archived lead (Admin only)
   */
  async restoreLead(user, leadId) {
    if (user.role !== 'ADMIN') {
      throw AppError.forbidden(
        'Only Administrators have permission to restore archived leads.',
        'FORBIDDEN',
      );
    }

    const existingLead = await leadsRepository.findById(leadId, user.organizationId);

    if (!existingLead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    if (!existingLead.archived_at) {
      throw AppError.badRequest('Lead is not currently archived', 'NOT_ARCHIVED');
    }

    return await withTransaction(async (client) => {
      const restoredLead = await leadsRepository.restore(
        leadId,
        user.organizationId,
        client,
      );

      await leadsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: leadId,
          actor_user_id: user.id,
          activity_type: LEAD_ACTIVITY_TYPES.RESTORED,
          description: `Lead was restored by ${user.firstName} ${user.lastName}`,
          metadata: {
            restored_at: new Date().toISOString(),
          },
        },
        client,
      );

      return restoredLead;
    });
  },

  /**
   * Get paginated activity history for a lead
   */
  async getLeadActivities(user, leadId, pagination) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization leads directly.',
        'FORBIDDEN',
      );
    }

    const lead = await leadsRepository.findById(leadId, user.organizationId);

    if (!lead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Role check for Employee
    if (
      user.role === 'EMPLOYEE' &&
      lead.assigned_to_id !== user.id &&
      lead.created_by_id !== user.id
    ) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    return await leadsRepository.findActivities(leadId, user.organizationId, pagination);
  },

  /**
   * Get list of assignable employees in the organization
   */
  async getAssignableUsers(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization users directly.',
        'FORBIDDEN',
      );
    }

    return await leadsRepository.findAssignableUsers(user.organizationId);
  },
};
