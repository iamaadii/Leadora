import { apiClient } from '../../../services/api.js';

export const leadsService = {
  /**
   * Fetch paginated leads matching filter parameters
   * @param {object} params
   */
  async getLeads(params = {}) {
    const res = await apiClient.get('/v1/leads', { params });
    return res.data;
  },

  /**
   * Fetch single lead with recent activities
   * @param {string} id
   */
  async getLeadById(id) {
    const res = await apiClient.get(`/v1/leads/${id}`);
    return res.data;
  },

  /**
   * Create a new lead
   * @param {object} data
   */
  async createLead(data) {
    const res = await apiClient.post('/v1/leads', data);
    return res.data;
  },

  /**
   * Update lead fields
   * @param {string} id
   * @param {object} data
   */
  async updateLead(id, data) {
    const res = await apiClient.patch(`/v1/leads/${id}`, data);
    return res.data;
  },

  /**
   * Soft archive lead
   * @param {string} id
   */
  async archiveLead(id) {
    const res = await apiClient.patch(`/v1/leads/${id}/archive`);
    return res.data;
  },

  /**
   * Restore archived lead
   * @param {string} id
   */
  async restoreLead(id) {
    const res = await apiClient.patch(`/v1/leads/${id}/restore`);
    return res.data;
  },

  /**
   * Fetch lead activities
   * @param {string} id
   * @param {object} params
   */
  async getLeadActivities(id, params = {}) {
    const res = await apiClient.get(`/v1/leads/${id}/activities`, { params });
    return res.data;
  },

  /**
   * Fetch assignable employees for current organization
   */
  async getAssignees() {
    const res = await apiClient.get('/v1/leads/assignees');
    return res.data;
  },
};

