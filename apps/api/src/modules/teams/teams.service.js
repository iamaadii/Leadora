import { teamsRepository } from './teams.repository.js';
import { employeesRepository } from '../employees/employees.repository.js';
import { withTransaction } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';

export const teamsService = {
  /**
   * List paginated teams:
   * - ADMIN sees all teams in organization
   * - MANAGER sees only teams they manage
   */
  async listTeams(actor, query) {
    if (actor.role === 'ADMIN') {
      return teamsRepository.findMany(actor.organizationId, query, null);
    }
    if (actor.role === 'MANAGER') {
      return teamsRepository.findMany(actor.organizationId, query, actor.id);
    }
    throw AppError.forbidden('You do not have permission to view teams.');
  },

  /**
   * Get teams managed by current user
   */
  async getMyTeams(actor, query) {
    if (actor.role !== 'MANAGER' && actor.role !== 'ADMIN') {
      throw AppError.forbidden('Only Managers and Admins can view managed teams.');
    }
    return teamsRepository.findMany(actor.organizationId, query, actor.id);
  },

  /**
   * Get team by ID with role check
   */
  async getTeamById(actor, id) {
    const team = await teamsRepository.findById(id, actor.organizationId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (actor.role === 'MANAGER' && team.manager_id !== actor.id) {
      throw AppError.forbidden('You do not have permission to view this team.');
    }

    return team;
  },

  /**
   * Create a new team (Admin only)
   */
  async createTeam(actor, data, ipAddress) {
    const organizationId = actor.organizationId;

    const existingName = await teamsRepository.findByName(data.name, organizationId);
    if (existingName) {
      throw AppError.conflict('A team with this name already exists in your organization.');
    }

    const managerId = data.managerId || data.manager_id || null;
    if (managerId) {
      const manager = await employeesRepository.findById(managerId, organizationId);
      if (!manager || manager.role !== 'MANAGER' || !manager.is_active) {
        throw AppError.badRequest('Assigned team manager must be an active user with role MANAGER.');
      }
    }

    return withTransaction(async (client) => {
      const created = await teamsRepository.create(
        {
          organization_id: organizationId,
          name: data.name,
          description: data.description || null,
          manager_id: managerId,
        },
        client,
      );

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'CREATE_TEAM',
          entity_type: 'TEAM',
          entity_id: created.id,
          old_values: null,
          new_values: {
            name: created.name,
            description: created.description,
            manager_id: created.manager_id,
          },
          ip_address: ipAddress,
        },
        client,
      );

      return created;
    });
  },

  /**
   * Update team (Admin only)
   */
  async updateTeam(actor, id, data, ipAddress) {
    const organizationId = actor.organizationId;

    const existing = await teamsRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    const fieldsToUpdate = {};

    if (data.name !== undefined && data.name !== existing.name) {
      const nameConflict = await teamsRepository.findByName(data.name, organizationId);
      if (nameConflict && nameConflict.id !== id) {
        throw AppError.conflict('A team with this name already exists in your organization.');
      }
      fieldsToUpdate.name = data.name;
    }

    if (data.description !== undefined) {
      fieldsToUpdate.description = data.description || null;
    }

    const managerId = data.managerId !== undefined ? data.managerId : data.manager_id;
    if (managerId !== undefined) {
      if (managerId !== null) {
        const manager = await employeesRepository.findById(managerId, organizationId);
        if (!manager || manager.role !== 'MANAGER' || !manager.is_active) {
          throw AppError.badRequest('Assigned team manager must be an active user with role MANAGER.');
        }
      }
      fieldsToUpdate.manager_id = managerId;
    }

    return withTransaction(async (client) => {
      const updated = await teamsRepository.update(id, organizationId, fieldsToUpdate, client);

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'UPDATE_TEAM',
          entity_type: 'TEAM',
          entity_id: id,
          old_values: {
            name: existing.name,
            description: existing.description,
            manager_id: existing.manager_id,
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
   * Deactivate team (Admin only)
   */
  async deactivateTeam(actor, id, ipAddress) {
    const organizationId = actor.organizationId;

    const existing = await teamsRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    if (!existing.is_active) {
      return existing;
    }

    return withTransaction(async (client) => {
      const updated = await teamsRepository.setActiveStatus(id, organizationId, false, client);

      // Unassign active members so they can join another active team
      await teamsRepository.removeActiveMembersForTeam(id, organizationId, client);

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'DEACTIVATE_TEAM',
          entity_type: 'TEAM',
          entity_id: id,
          old_values: { is_active: true },
          new_values: { is_active: false },
          ip_address: ipAddress,
        },
        client,
      );

      return updated;
    });
  },

  /**
   * Activate team (Admin only)
   */
  async activateTeam(actor, id, ipAddress) {
    const organizationId = actor.organizationId;

    const existing = await teamsRepository.findById(id, organizationId);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    if (existing.is_active) {
      return existing;
    }

    return withTransaction(async (client) => {
      const updated = await teamsRepository.setActiveStatus(id, organizationId, true, client);

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'ACTIVATE_TEAM',
          entity_type: 'TEAM',
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

  /**
   * Add member to team (Admin only)
   */
  async addMember(actor, teamId, data, ipAddress) {
    const organizationId = actor.organizationId;
    const employeeId = data.employeeId || data.employee_id;

    const team = await teamsRepository.findById(teamId, organizationId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (!team.is_active) {
      throw AppError.badRequest('Cannot add members to an inactive team.');
    }

    const employee = await employeesRepository.findById(employeeId, organizationId);
    if (!employee) {
      throw AppError.notFound('Employee not found');
    }

    if (!employee.is_active) {
      throw AppError.badRequest('Cannot add an inactive employee to a team.');
    }

    if (employee.role !== 'EMPLOYEE') {
      throw AppError.badRequest('Only users with role EMPLOYEE can be added to teams.');
    }

    // Check existing active team membership
    const activeMembership = await teamsRepository.findActiveMembershipForEmployee(
      employeeId,
      organizationId,
    );

    if (activeMembership) {
      if (activeMembership.team_id === teamId) {
        throw AppError.badRequest('Employee is already an active member of this team.');
      }
      throw AppError.conflict(
        `Employee is already an active member of team "${activeMembership.team_name}". Remove them from that team first.`,
      );
    }

    return withTransaction(async (client) => {
      const added = await teamsRepository.addMember(teamId, employeeId, organizationId, client);

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'ADD_TEAM_MEMBER',
          entity_type: 'TEAM',
          entity_id: teamId,
          old_values: null,
          new_values: {
            employee_id: employeeId,
            employee_name: `${employee.first_name} ${employee.last_name}`,
          },
          ip_address: ipAddress,
        },
        client,
      );

      return added;
    });
  },

  /**
   * Remove member from team (Admin only)
   */
  async removeMember(actor, teamId, employeeId, ipAddress) {
    const organizationId = actor.organizationId;

    const team = await teamsRepository.findById(teamId, organizationId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    return withTransaction(async (client) => {
      const removed = await teamsRepository.removeMember(teamId, employeeId, organizationId, client);
      if (!removed) {
        throw AppError.notFound('Employee is not an active member of this team.');
      }

      await teamsRepository.logAudit(
        {
          organization_id: organizationId,
          actor_user_id: actor.id,
          action: 'REMOVE_TEAM_MEMBER',
          entity_type: 'TEAM',
          entity_id: teamId,
          old_values: { employee_id: employeeId },
          new_values: null,
          ip_address: ipAddress,
        },
        client,
      );

      return removed;
    });
  },

  /**
   * Get team active roster (Admin or Team Manager)
   */
  async getTeamRoster(actor, teamId) {
    const team = await this.getTeamById(actor, teamId);
    const members = await teamsRepository.getRoster(teamId, actor.organizationId);
    return {
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        is_active: team.is_active,
        manager: team.manager_id
          ? {
              id: team.manager_id,
              firstName: team.manager_first_name,
              lastName: team.manager_last_name,
              email: team.manager_email,
            }
          : null,
      },
      members,
    };
  },

  /**
   * Get team workload (Admin or Team Manager)
   */
  async getTeamWorkload(actor, teamId) {
    const team = await this.getTeamById(actor, teamId);
    const workload = await teamsRepository.getWorkload(teamId, actor.organizationId);
    return {
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        is_active: team.is_active,
      },
      ...workload,
    };
  },
};
