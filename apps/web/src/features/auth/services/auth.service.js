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
   * Initialize interactive demo session (read-only demo organization)
   */
  async createDemoSession() {
    const res = await apiClient.post('/v1/auth/demo-session');
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
   * Get authenticated user profile details
   */
  async getProfile() {
    const res = await apiClient.get('/v1/users/profile');
    return res.data;
  },

  /**
   * Update authenticated user's own profile
   * @param {object} payload
   * @param {string} [payload.firstName]
   * @param {string} [payload.lastName]
   * @param {string} [payload.phone]
   */
  async updateProfile(payload) {
    const res = await apiClient.patch('/v1/users/profile', payload);
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

