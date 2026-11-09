import { apiClient } from '../../../services/api.js';

export const notificationsService = {
  /**
   * Get paginated notifications
   * @param {object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {'ALL'|'UNREAD'|'READ'} [params.status='ALL']
   */
  async getNotifications(params = {}) {
    const res = await apiClient.get('/v1/notifications', { params });
    return res.data;
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount() {
    const res = await apiClient.get('/v1/notifications/unread-count');
    return res.data;
  },

  /**
   * Mark single notification as read
   * @param {string} id
   */
  async markAsRead(id) {
    const res = await apiClient.patch(`/v1/notifications/${id}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const res = await apiClient.patch('/v1/notifications/read-all');
    return res.data;
  },
};
