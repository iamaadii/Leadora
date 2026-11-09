import { apiClient } from '../../../services/api.js';

export const platformService = {
  /**
   * Get paginated platform organizations
   * @param {object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.search]
   * @param {'ACTIVE'|'SUSPENDED'} [params.status]
   */
  async getOrganizations(params = {}) {
    const res = await apiClient.get('/v1/platform/organizations', { params });
    return res.data;
  },

  /**
   * Get single organization details
   * @param {string} id
   */
  async getOrganization(id) {
    const res = await apiClient.get(`/v1/platform/organizations/${id}`);
    return res.data;
  },

  /**
   * Provision a new tenant organization with admin user
   * @param {object} payload
   * @param {string} payload.name
   * @param {string} payload.slug
   * @param {string} payload.adminEmail
   * @param {string} payload.adminPassword
   * @param {string} payload.adminFirstName
   * @param {string} [payload.adminLastName]
   */
  async provisionOrganization(payload) {
    const res = await apiClient.post('/v1/platform/organizations', payload);
    return res.data;
  },

  /**
   * Update organization status (e.g. suspend or reactivate)
   * @param {string} id
   * @param {object} payload
   * @param {'ACTIVE'|'SUSPENDED'} payload.status
   */
  async updateOrganizationStatus(id, payload) {
    const res = await apiClient.patch(`/v1/platform/organizations/${id}/status`, payload);
    return res.data;
  },
};
