import { apiClient } from '../../../services/api.js';

export const activitiesService = {
  /**
   * Get activities feed
   * @param {object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.type]
   * @param {string} [params.leadId]
   * @param {string} [params.userId]
   */
  async getActivities(params = {}) {
    const res = await apiClient.get('/v1/activities', { params });
    return res.data;
  },
};
