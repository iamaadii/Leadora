import argon2 from 'argon2';
import { employeesRepository } from './employees.repository.js';
import { withTransaction } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';

export const employeesService = {
  /**
   * List paginated employees in an organization
   */
  async listEmployees(organizationId, params) {
    return employeesRepository.findMany(organizationId, params);
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id, organizationId) {
    const employee = await employeesRepository.findById(id, organizationId);
    if (!employee) {
      throw AppError.notFound('Employee not found');
    }
    return employee;
  },

  /**
   * Create a new employee with temporary password
   */
  async createEmployee(actor, data, ipAddress) {
    const organizationId = actor.organizationId;
    const existing = await employeesRepository.findByEmail(data.email, organizationId);
    if (existing) {
      throw AppError.conflict('An employee with this email already exists in your organization.');
    }

    const firstName = data.first_name || data.firstName;
    const lastName = data.last_name || data.lastName;
    const rawPassword = data.password || data.temporaryPassword;

    const passwordHash = await argon2.hash(rawPassword);

    return withTransaction(async (client) => {
      const created = await employeesRepository.create(
        {
          organization_id: organizationId,
          first_name: firstName,
          last_name: lastName,
          email: data.email,
          password_hash: passwordHash,
          phone: data.phone || null,
          role: data.role,
        },
        client,
      );

      await employeesRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'CREATE_EMPLOYEE',
          entity_type: 'USER',
          entity_id: created.id,
          old_values: null,
          new_values: {
            first_name: created.first_name,
            last_name: created.last_name,
            email: created.email,
            role: created.role,
            is_active: created.is_active,
            must_change_password: created.must_change_password,
          },
          ip_address: ipAddress,
        },
        client,
      );

      return created;
    });
  },

  /**
   * Update employee details (name, phone)
   */
  async updateEmployee(actor, id, data, ipAddress) {
    const organizationId = actor.organizationId;
    const existing = await employeesRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Employee not found');
    }

    const fieldsToUpdate = {};
    const firstName = data.first_name !== undefined ? data.first_name : data.firstName;
    const lastName = data.last_name !== undefined ? data.last_name : data.lastName;

    if (firstName !== undefined) fieldsToUpdate.first_name = firstName;
    if (lastName !== undefined) fieldsToUpdate.last_name = lastName;
    if (data.phone !== undefined) fieldsToUpdate.phone = data.phone;

    return withTransaction(async (client) => {
      const updated = await employeesRepository.update(id, organizationId, fieldsToUpdate, client);

      await employeesRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'UPDATE_EMPLOYEE',
          entity_type: 'USER',
          entity_id: id,
          old_values: {
            first_name: existing.first_name,
            last_name: existing.last_name,
            phone: existing.phone,
          },
          new_values: fieldsToUpdate,
          ip_address: ipAddress,
        },
        client,
      );

      return updated;
    });
  },

  /**
   * Change employee role
   */
  async changeRole(actor, id, newRole, ipAddress) {
    const organizationId = actor.organizationId;

    if (actor.id === id) {
      throw AppError.badRequest('You cannot change your own role.');
    }

    const existing = await employeesRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Employee not found');
    }

    if (existing.role === newRole) {
      return existing;
    }

    // Safety: check if last active admin is being demoted
    if (existing.role === 'ADMIN' && newRole !== 'ADMIN') {
      const activeAdminsCount = await employeesRepository.countActiveAdmins(organizationId);
      if (activeAdminsCount <= 1) {
        throw AppError.badRequest('Cannot change role of the last active administrator in the organization.');
      }
    }

    // Safety: check if active manager leading teams is being demoted
    if (existing.role === 'MANAGER' && newRole !== 'MANAGER') {
      const ledTeams = await employeesRepository.getActiveTeamsLedByManager(id, organizationId);
      if (ledTeams.length > 0) {
        throw AppError.badRequest(
          `Cannot change role of a manager who currently leads active teams (${ledTeams.map((t) => t.name).join(', ')}). Reassign team manager first.`,
        );
      }
    }

    return withTransaction(async (client) => {
      const updated = await employeesRepository.updateRole(id, organizationId, newRole, client);

      await employeesRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'CHANGE_EMPLOYEE_ROLE',
          entity_type: 'USER',
          entity_id: id,
          old_values: { role: existing.role },
          new_values: { role: newRole },
          ip_address: ipAddress,
        },
        client,
      );

      return updated;
    });
  },

  /**
   * Get employee workload metrics prior to deactivation
   */
  async getEmployeeWorkload(actor, id) {
    const organizationId = actor.organizationId;
    const existing = await employeesRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Employee not found');
    }

    const workload = await employeesRepository.getWorkload(id, organizationId);
    return {
      employee: {
        id: existing.id,
        name: `${existing.first_name} ${existing.last_name}`,
        email: existing.email,
        role: existing.role,
        isActive: existing.is_active,
      },
      ...workload,
    };
  },

  /**
   * Deactivate employee with atomic workload reassignment
   */
  async deactivateEmployee(actor, id, reassignmentData = {}, ipAddress) {
    const organizationId = actor.organizationId;
    const { reassignLeadsToId, reassignFollowupsToId, leaveUnassigned = false } = reassignmentData;

    const existing = await employeesRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Employee not found');
    }

    if (actor.id === id) {
      throw AppError.badRequest('You cannot deactivate your own account.');
    }

    if (!existing.is_active) {
      return existing;
    }

    // Safety: check if last active admin is being deactivated
    if (existing.role === 'ADMIN') {
      const activeAdminsCount = await employeesRepository.countActiveAdmins(organizationId);
      if (activeAdminsCount <= 1) {
        throw AppError.badRequest('Cannot deactivate the last active administrator in the organization.');
      }
    }

    // Safety: check if manager leading active teams is being deactivated
    if (existing.role === 'MANAGER') {
      const ledTeams = await employeesRepository.getActiveTeamsLedByManager(id, organizationId);
      if (ledTeams.length > 0) {
        throw AppError.badRequest(
          `Cannot deactivate a manager who currently leads active teams (${ledTeams.map((t) => t.name).join(', ')}). Reassign team manager first.`,
        );
      }
    }

    // Inspect workload
    const workload = await employeesRepository.getWorkload(id, organizationId);

    // Validate lead reassignment targets if leads exist
    let targetLeadUser = null;
    if (workload.activeLeadsCount > 0) {
      if (reassignLeadsToId) {
        if (reassignLeadsToId === id) {
          throw AppError.badRequest('Cannot reassign leads to the employee being deactivated.');
        }
        targetLeadUser = await employeesRepository.findById(reassignLeadsToId, organizationId);
        if (!targetLeadUser || !targetLeadUser.is_active) {
          throw AppError.badRequest('Target employee for lead reassignment is invalid or inactive.');
        }
      } else if (!leaveUnassigned) {
        throw AppError.badRequest(
          `Employee has ${workload.activeLeadsCount} assigned lead(s). Please specify a reassignment recipient or choose to leave unassigned.`,
          'REASSIGNMENT_REQUIRED',
        );
      }
    }

    // Validate follow-up reassignment targets if follow-ups exist
    let targetFollowupUser = null;
    if (workload.pendingFollowupsCount > 0) {
      if (reassignFollowupsToId) {
        if (reassignFollowupsToId === id) {
          throw AppError.badRequest('Cannot reassign follow-ups to the employee being deactivated.');
        }
        targetFollowupUser = await employeesRepository.findById(reassignFollowupsToId, organizationId);
        if (!targetFollowupUser || !targetFollowupUser.is_active) {
          throw AppError.badRequest('Target employee for follow-up reassignment is invalid or inactive.');
        }
      } else if (!leaveUnassigned) {
        throw AppError.badRequest(
          `Employee has ${workload.pendingFollowupsCount} pending follow-up task(s). Please specify a reassignment recipient or choose to cancel them.`,
          'REASSIGNMENT_REQUIRED',
        );
      }
    }

    return withTransaction(async (client) => {
      // 1. Reassign or unassign leads
      let reassignedLeads = [];
      if (workload.activeLeadsCount > 0) {
        if (reassignLeadsToId) {
          reassignedLeads = await employeesRepository.reassignLeads(
            id,
            reassignLeadsToId,
            organizationId,
            client,
          );
        } else if (leaveUnassigned) {
          reassignedLeads = await employeesRepository.unassignLeads(id, organizationId, client);
        }
      }

      // 2. Reassign or cancel pending follow-ups
      let reassignedFollowups = [];
      if (workload.pendingFollowupsCount > 0) {
        if (reassignFollowupsToId) {
          reassignedFollowups = await employeesRepository.reassignFollowups(
            id,
            reassignFollowupsToId,
            organizationId,
            client,
          );
        } else if (leaveUnassigned) {
          reassignedFollowups = await employeesRepository.cancelFollowups(
            id,
            organizationId,
            `Cancelled automatically due to deactivation of ${existing.first_name} ${existing.last_name}`,
            client,
          );
        }
      }

      // 3. Remove active team memberships
      await employeesRepository.removeActiveTeamMemberships(id, organizationId, client);

      // 4. Set employee status to inactive
      const updated = await employeesRepository.setActiveStatus(id, organizationId, false, client);

      // 5. Invalidate all active user sessions and refresh tokens immediately
      await employeesRepository.revokeAllSessions(id, client);

      // 6. Log audit entry
      await employeesRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'DEACTIVATE_EMPLOYEE',
          entity_type: 'USER',
          entity_id: id,
          old_values: {
            is_active: true,
            active_leads_count: workload.activeLeadsCount,
            pending_followups_count: workload.pendingFollowupsCount,
          },
          new_values: {
            is_active: false,
            reassigned_leads_count: reassignedLeads.length,
            reassign_leads_to_id: reassignLeadsToId || null,
            reassigned_followups_count: reassignedFollowups.length,
            reassign_followups_to_id: reassignFollowupsToId || null,
            left_unassigned: leaveUnassigned,
          },
          ip_address: ipAddress,
        },
        client,
      );

      return {
        ...updated,
        reassignedLeadsCount: reassignedLeads.length,
        reassignedFollowupsCount: reassignedFollowups.length,
      };
    });
  },

  /**
   * Activate employee
   */
  async activateEmployee(actor, id, ipAddress) {
    const organizationId = actor.organizationId;

    const existing = await employeesRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Employee not found');
    }

    if (existing.is_active) {
      return existing;
    }

    return withTransaction(async (client) => {
      const updated = await employeesRepository.setActiveStatus(id, organizationId, true, client);

      await employeesRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'ACTIVATE_EMPLOYEE',
          entity_type: 'USER',
          entity_id: id,
          old_values: { is_active: false },
          new_values: { is_active: true },
          ip_address: ipAddress,
        },
        client,
      );

      return updated;
    });
  },
};
