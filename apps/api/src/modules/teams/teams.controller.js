import { teamsService } from './teams.service.js';

export const teamsController = {
  /**
   * GET /api/v1/teams
   */
  async listTeams(req, res, next) {
    try {
      const result = await teamsService.listTeams(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/teams/my-teams
   */
  async getMyTeams(req, res, next) {
    try {
      const result = await teamsService.getMyTeams(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/teams/:id
   */
  async getTeamById(req, res, next) {
    try {
      const team = await teamsService.getTeamById(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/teams
   */
  async createTeam(req, res, next) {
    try {
      const team = await teamsService.createTeam(
        req.user,
        req.body,
        req.ip || req.socket.remoteAddress,
      );
      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/teams/:id
   */
  async updateTeam(req, res, next) {
    try {
      const team = await teamsService.updateTeam(
        req.user,
        req.params.id,
        req.body,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Team updated successfully',
        data: team,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/teams/:id/deactivate
   */
  async deactivateTeam(req, res, next) {
    try {
      const team = await teamsService.deactivateTeam(
        req.user,
        req.params.id,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Team deactivated successfully',
        data: team,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/teams/:id/activate
   */
  async activateTeam(req, res, next) {
    try {
      const team = await teamsService.activateTeam(
        req.user,
        req.params.id,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Team activated successfully',
        data: team,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/teams/:id/members
   */
  async addMember(req, res, next) {
    try {
      const member = await teamsService.addMember(
        req.user,
        req.params.id,
        req.body,
        req.ip || req.socket.remoteAddress,
      );
      res.status(201).json({
        success: true,
        message: 'Member added to team successfully',
        data: member,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/teams/:id/members/:employeeId
   */
  async removeMember(req, res, next) {
    try {
      await teamsService.removeMember(
        req.user,
        req.params.id,
        req.params.employeeId,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Member removed from team successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/teams/:id/roster
   */
  async getTeamRoster(req, res, next) {
    try {
      const roster = await teamsService.getTeamRoster(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: roster,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/teams/:id/workload
   */
  async getTeamWorkload(req, res, next) {
    try {
      const workload = await teamsService.getTeamWorkload(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: workload,
      });
    } catch (err) {
      next(err);
    }
  },
};
