import { apiClient } from '../../../services/api.js';

export const authService = {
  /**
   * Login user
   * @param {object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @param {string} [credentials.organizationSlug]
   */
  async login(credentials) {
    const res = await apiClient.post('/v1/auth/login', credentials);
    return res.data;
  },

  /**
   * Refreshes access token using HttpOnly cookie
   */
  async refresh() {
    const res = await apiClient.post('/v1/auth/refresh');
    return res.data;
  },

  /**
   * Logout user and revoke refresh session
   */
  async logout() {
    const res = await apiClient.post('/v1/auth/logout');
    return res.data;
  },

  /**
   * Revoke all active refresh sessions
   */
  async logoutAll() {
    const res = await apiClient.post('/v1/auth/logout-all');
    return res.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const res = await apiClient.get('/v1/auth/me');
    return res.data;
  },

  /**
   * Change current user's password
   * @param {object} payload
   * @param {string} payload.currentPassword
   * @param {string} payload.newPassword
   */
  async changePassword(payload) {
    const res = await apiClient.post('/v1/auth/change-password', payload);
    return res.data;
  },
};
