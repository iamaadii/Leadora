import { followupsRepository } from './followups.repository.js';
import { leadsRepository } from '../leads/leads.repository.js';
import { withTransaction } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';
import { FOLLOWUP_ACTIVITY_TYPES } from './followups.constants.js';

export const followupsService = {
  /**
   * Create a new follow-up and log activity
   */
  async createFollowup(user, data) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot create organization follow-ups.',
        'FORBIDDEN',
      );
    }

    const leadId = data.leadId || data.lead_id;
    const lead = await leadsRepository.findById(leadId, user.organizationId);
    if (!lead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Role check: Employee can only create follow-ups for leads assigned to or created by them
    if (
      user.role === 'EMPLOYEE' &&
      lead.assigned_to_id !== user.id &&
      lead.created_by_id !== user.id
    ) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    // Role check: Manager must have access to lead within their team scope
    if (user.role === 'MANAGER') {
      const isAccessible = await leadsRepository.isLeadAccessibleByManager(
        leadId,
        user.id,
        user.organizationId,
      );
      if (!isAccessible) {
        throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
      }
    }

    // Assignee validation & permission checks
    const targetAssigneeId = data.assignedToId || data.assigned_to_id || user.id;

    if (user.role === 'EMPLOYEE' && targetAssigneeId !== user.id) {
      throw AppError.forbidden(
        'Employees can only assign follow-ups to themselves.',
        'FORBIDDEN',
      );
    }

    if (user.role === 'MANAGER' && targetAssigneeId !== user.id) {
      const isMember = await leadsRepository.isEmployeeInManagerTeams(
        targetAssigneeId,
        user.id,
        user.organizationId,
      );
      if (!isMember) {
        throw AppError.forbidden(
          'Managers can only assign follow-ups to members of their managed teams.',
          'FORBIDDEN',
        );
      }
    }

    const assignee = await leadsRepository.findActiveUserInOrg(
      targetAssigneeId,
      user.organizationId,
    );
    if (!assignee) {
      throw AppError.badRequest(
        'Assigned employee not found or is inactive in your organization.',
        'INVALID_ASSIGNEE',
      );
    }

    // Date validation
    const rawDue = data.dueAt || data.scheduledAt || data.due_at;
    const dueAt = new Date(rawDue);
    if (isNaN(dueAt.getTime())) {
      throw AppError.badRequest('Invalid scheduled date and time format', 'INVALID_DATE');
    }

    return await withTransaction(async (client) => {
      // 1. Insert follow-up record
      const created = await followupsRepository.create(
        {
          organization_id: user.organizationId,
          lead_id: lead.id,
          assigned_to_id: targetAssigneeId,
          title: data.title,
          description: data.description || null,
          type: data.type || 'CALL',
          priority: data.priority || 'MEDIUM',
          due_at: dueAt,
          created_by_id: user.id,
        },
        client,
      );

      // 2. Record activity in lead history
      await followupsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: lead.id,
          actor_user_id: user.id,
          activity_type: FOLLOWUP_ACTIVITY_TYPES.CREATED,
          description: `Follow-up (${created.type}) "${created.title}" scheduled for ${dueAt.toISOString()}`,
          metadata: {
            followup_id: created.id,
            title: created.title,
            type: created.type,
            priority: created.priority,
            due_at: created.due_at,
            assigned_to_id: created.assigned_to_id,
          },
        },
        client,
      );

      // 3. Create in-app notification if assigned to another user
      if (targetAssigneeId !== user.id) {
        await followupsRepository.createNotification(
          {
            organization_id: user.organizationId,
            user_id: targetAssigneeId,
            title: 'New Follow-up Assigned',
            message: `You were assigned a ${created.type} task: "${created.title}" for lead "${lead.name}".`,
            notification_type: 'FOLLOWUP_ASSIGNED',
          },
          client,
        );
      }

      return await followupsRepository.findById(created.id, user.organizationId, client);
    });
  },

  /**
   * List paginated follow-ups with role-scoped filtering
   */
  async listFollowups(user, params) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization follow-ups.',
        'FORBIDDEN',
      );
    }

    return await followupsRepository.findMany(
      user.organizationId,
      user.role,
      user.id,
      params,
    );
  },

  /**
   * Get single follow-up details by ID with role check
   */
  async getFollowupById(user, id) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization follow-ups.',
        'FORBIDDEN',
      );
    }

    const followup = await followupsRepository.findById(id, user.organizationId);
    if (!followup) {
      throw AppError.notFound('Follow-up not found', 'FOLLOWUP_NOT_FOUND');
    }

    // Role check: Employee can only view their own assigned follow-ups
    if (user.role === 'EMPLOYEE' && followup.assigned_to_id !== user.id) {
      throw AppError.notFound('Follow-up not found', 'FOLLOWUP_NOT_FOUND');
    }

    // Role check: Manager can only view follow-ups assigned to self or managed team members
    if (user.role === 'MANAGER' && followup.assigned_to_id !== user.id) {
      const isMember = await leadsRepository.isEmployeeInManagerTeams(
        followup.assigned_to_id,
        user.id,
        user.organizationId,
      );
      if (!isMember) {
        throw AppError.notFound('Follow-up not found', 'FOLLOWUP_NOT_FOUND');
      }
    }

    return followup;
  },

  /**
   * Update follow-up details and reschedule
   */
  async updateFollowup(user, id, data) {
    const existing = await this.getFollowupById(user, id);

    if (existing.status !== 'PENDING') {
      throw AppError.badRequest(
        `Cannot update a follow-up that is already ${existing.status.toLowerCase()}.`,
        'TERMINAL_STATUS',
      );
    }

    const fieldsToUpdate = {};
    const changedFields = [];

    if (data.title !== undefined && data.title !== existing.title) {
      fieldsToUpdate.title = data.title;
      changedFields.push('title');
    }

    if (data.description !== undefined && data.description !== existing.description) {
      fieldsToUpdate.description = data.description || null;
      changedFields.push('description');
    }

    if (data.type !== undefined && data.type !== existing.type) {
      fieldsToUpdate.type = data.type;
      changedFields.push('type');
    }

    if (data.priority !== undefined && data.priority !== existing.priority) {
      fieldsToUpdate.priority = data.priority;
      changedFields.push('priority');
    }

    // Rescheduling check
    const rawDue = data.dueAt || data.scheduledAt || data.due_at;
    let isRescheduled = false;
    if (rawDue) {
      const parsedDue = new Date(rawDue);
      if (isNaN(parsedDue.getTime())) {
        throw AppError.badRequest('Invalid scheduled date and time format', 'INVALID_DATE');
      }
      if (parsedDue.getTime() !== new Date(existing.due_at).getTime()) {
        fieldsToUpdate.due_at = parsedDue;
        changedFields.push('due_at');
        isRescheduled = true;
      }
    }

    // Reassignment check
    const targetAssigneeId = data.assignedToId !== undefined ? data.assignedToId : data.assigned_to_id;
    let isReassigned = false;
    if (targetAssigneeId && targetAssigneeId !== existing.assigned_to_id) {
      if (user.role === 'EMPLOYEE') {
        throw AppError.forbidden(
          'Employees cannot reassign follow-ups.',
          'FORBIDDEN',
        );
      }

      if (user.role === 'MANAGER' && targetAssigneeId !== user.id) {
        const isMember = await leadsRepository.isEmployeeInManagerTeams(
          targetAssigneeId,
          user.id,
          user.organizationId,
        );
        if (!isMember) {
          throw AppError.forbidden(
            'Managers can only assign follow-ups to members of their managed teams.',
            'FORBIDDEN',
          );
        }
      }

      const assignee = await leadsRepository.findActiveUserInOrg(
        targetAssigneeId,
        user.organizationId,
      );
      if (!assignee) {
        throw AppError.badRequest(
          'Assigned employee not found or is inactive in your organization.',
          'INVALID_ASSIGNEE',
        );
      }

      fieldsToUpdate.assigned_to_id = targetAssigneeId;
      changedFields.push('assigned_to_id');
      isReassigned = true;
    }

    if (changedFields.length === 0) {
      return existing;
    }

    return await withTransaction(async (client) => {
      await followupsRepository.update(id, user.organizationId, fieldsToUpdate, client);

      // Determine activity type
      let activityType = FOLLOWUP_ACTIVITY_TYPES.UPDATED;
      let activityDesc = `Follow-up "${existing.title}" updated`;

      if (isReassigned) {
        activityType = FOLLOWUP_ACTIVITY_TYPES.REASSIGNED;
        activityDesc = `Follow-up "${existing.title}" reassigned to user ID ${fieldsToUpdate.assigned_to_id}`;
      } else if (isRescheduled) {
        activityType = FOLLOWUP_ACTIVITY_TYPES.RESCHEDULED;
        activityDesc = `Follow-up "${existing.title}" rescheduled to ${fieldsToUpdate.due_at.toISOString()}`;
      }

      await followupsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: existing.lead_id,
          actor_user_id: user.id,
          activity_type: activityType,
          description: activityDesc,
          metadata: {
            followup_id: id,
            changes: fieldsToUpdate,
          },
        },
        client,
      );

      // Notify new assignee if reassigned
      if (isReassigned && fieldsToUpdate.assigned_to_id !== user.id) {
        await followupsRepository.createNotification(
          {
            organization_id: user.organizationId,
            user_id: fieldsToUpdate.assigned_to_id,
            title: 'Follow-up Reassigned to You',
            message: `Follow-up task "${existing.title}" has been reassigned to you.`,
            notification_type: 'FOLLOWUP_REASSIGNED',
          },
          client,
        );
      }

      return await followupsRepository.findById(id, user.organizationId, client);
    });
  },

  /**
   * Complete follow-up with optional completion notes
   */
  async completeFollowup(user, id, completionNotes) {
    const existing = await this.getFollowupById(user, id);

    if (existing.status !== 'PENDING') {
      throw AppError.badRequest(
        `Cannot complete follow-up that is already ${existing.status.toLowerCase()}.`,
        'TERMINAL_STATUS',
      );
    }

    return await withTransaction(async (client) => {
      const completed = await followupsRepository.complete(
        id,
        user.organizationId,
        user.id,
        completionNotes,
        client,
      );

      const notesSnippet = completionNotes ? `: "${completionNotes}"` : '';
      await followupsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: existing.lead_id,
          actor_user_id: user.id,
          activity_type: FOLLOWUP_ACTIVITY_TYPES.COMPLETED,
          description: `Follow-up "${existing.title}" completed${notesSnippet}`,
          metadata: {
            followup_id: id,
            completed_by_id: user.id,
            completed_at: completed.completed_at,
            completion_notes: completionNotes || null,
          },
        },
        client,
      );

      return await followupsRepository.findById(id, user.organizationId, client);
    });
  },

  /**
   * Cancel follow-up
   */
  async cancelFollowup(user, id) {
    const existing = await this.getFollowupById(user, id);

    if (existing.status !== 'PENDING') {
      throw AppError.badRequest(
        `Cannot cancel follow-up that is already ${existing.status.toLowerCase()}.`,
        'TERMINAL_STATUS',
      );
    }

    return await withTransaction(async (client) => {
      await followupsRepository.cancel(id, user.organizationId, client);

      await followupsRepository.createActivity(
        {
          organization_id: user.organizationId,
          lead_id: existing.lead_id,
          actor_user_id: user.id,
          activity_type: FOLLOWUP_ACTIVITY_TYPES.CANCELLED,
          description: `Follow-up "${existing.title}" was cancelled`,
          metadata: {
            followup_id: id,
            cancelled_by_id: user.id,
          },
        },
        client,
      );

      return await followupsRepository.findById(id, user.organizationId, client);
    });
  },

  /**
   * Get role-scoped summary counts
   */
  async getSummary(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization follow-up summaries.',
        'FORBIDDEN',
      );
    }

    return await followupsRepository.getSummary(
      user.organizationId,
      user.role,
      user.id,
    );
  },

  /**
   * Get follow-ups for a specific lead
   */
  async getLeadFollowups(user, leadId) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization lead follow-ups.',
        'FORBIDDEN',
      );
    }

    const lead = await leadsRepository.findById(leadId, user.organizationId);
    if (!lead) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    if (
      user.role === 'EMPLOYEE' &&
      lead.assigned_to_id !== user.id &&
      lead.created_by_id !== user.id
    ) {
      throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
    }

    if (user.role === 'MANAGER') {
      const isAccessible = await leadsRepository.isLeadAccessibleByManager(
        leadId,
        user.id,
        user.organizationId,
      );
      if (!isAccessible) {
        throw AppError.notFound('Lead not found', 'LEAD_NOT_FOUND');
      }
    }

    return await followupsRepository.findByLeadId(leadId, user.organizationId);
  },
};
