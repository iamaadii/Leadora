import { apiClient } from '../../../services/api.js';

export const followupsService = {
  /**
   * Fetch paginated follow-ups matching query filters
   * @param {object} params
   */
  async getFollowups(params = {}) {
    const res = await apiClient.get('/v1/followups', { params });
    return res.data;
  },

  /**
   * Fetch single follow-up details by ID
   * @param {string} id
   */
  async getFollowupById(id) {
    const res = await apiClient.get(`/v1/followups/${id}`);
    return res.data;
  },

  /**
   * Schedule a new follow-up
   * @param {object} data
   */
  async createFollowup(data) {
    const res = await apiClient.post('/v1/followups', data);
    return res.data;
  },

  /**
   * Update follow-up details or reschedule
   * @param {string} id
   * @param {object} data
   */
  async updateFollowup(id, data) {
    const res = await apiClient.patch(`/v1/followups/${id}`, data);
    return res.data;
  },

  /**
   * Complete follow-up with optional outcome notes
   * @param {string} id
   * @param {string} [completionNotes]
   */
  async completeFollowup(id, completionNotes) {
    const res = await apiClient.patch(`/v1/followups/${id}/complete`, {
      completionNotes: completionNotes || '',
    });
    return res.data;
  },

  /**
   * Cancel follow-up
   * @param {string} id
   */
  async cancelFollowup(id) {
    const res = await apiClient.patch(`/v1/followups/${id}/cancel`);
    return res.data;
  },

  /**
   * Get role-scoped metric counts
   */
  async getSummary() {
    const res = await apiClient.get('/v1/followups/summary');
    return res.data;
  },

  /**
   * Get follow-ups for a specific lead
   * @param {string} leadId
   */
  async getLeadFollowups(leadId) {
    const res = await apiClient.get(`/v1/followups/lead/${leadId}`);
    return res.data;
  },
};
