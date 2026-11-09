import { apiClient } from '../../../services/api.js';

export const organizationService = {
  /**
   * Get tenant organization settings
   */
  async getSettings() {
    const res = await apiClient.get('/v1/organization/settings');
    return res.data;
  },

  /**
   * Update tenant organization settings
   * @param {object} payload
   * @param {string} [payload.name]
   * @param {string} [payload.currency]
   * @param {string} [payload.timezone]
   */
  async updateSettings(payload) {
    const res = await apiClient.patch('/v1/organization/settings', payload);
    return res.data;
  },
};
