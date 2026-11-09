import { apiClient } from '../../../services/api.js';

export const teamsService = {
  /**
   * Fetch paginated teams:
   * - Admin sees all
   * - Manager sees their managed teams
   */
  async getTeams(params = {}) {
    const res = await apiClient.get('/v1/teams', { params });
    return res.data;
  },

  /**
   * Fetch teams managed by caller
   */
  async getMyTeams(params = {}) {
    const res = await apiClient.get('/v1/teams/my-teams', { params });
    return res.data;
  },

  /**
   * Fetch team by ID
   */
  async getTeamById(id) {
    const res = await apiClient.get(`/v1/teams/${id}`);
    return res.data;
  },

  /**
   * Create new team (Admin)
   */
  async createTeam(data) {
    const res = await apiClient.post('/v1/teams', data);
    return res.data;
  },

  /**
   * Update team details (Admin)
   */
  async updateTeam(id, data) {
    const res = await apiClient.patch(`/v1/teams/${id}`, data);
    return res.data;
  },

  /**
   * Deactivate team (Admin)
   */
  async deactivateTeam(id) {
    const res = await apiClient.patch(`/v1/teams/${id}/deactivate`);
    return res.data;
  },

  /**
   * Activate team (Admin)
   */
  async activateTeam(id) {
    const res = await apiClient.patch(`/v1/teams/${id}/activate`);
    return res.data;
  },

  /**
   * Add member to team (Admin)
   */
  async addMember(teamId, employeeId) {
    const res = await apiClient.post(`/v1/teams/${teamId}/members`, { employeeId });
    return res.data;
  },

  /**
   * Remove member from team (Admin)
   */
  async removeMember(teamId, employeeId) {
    const res = await apiClient.delete(`/v1/teams/${teamId}/members/${employeeId}`);
    return res.data;
  },

  /**
   * Fetch active team roster
   */
  async getTeamRoster(teamId) {
    const res = await apiClient.get(`/v1/teams/${teamId}/roster`);
    return res.data;
  },

  /**
   * Fetch team workload breakdown
   */
  async getTeamWorkload(teamId) {
    const res = await apiClient.get(`/v1/teams/${teamId}/workload`);
    return res.data;
  },
};
