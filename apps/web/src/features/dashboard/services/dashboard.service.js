import { apiClient } from '../../../services/api.js';

export const dashboardService = {
  /**
   * Fetch overview KPIs with date range filtering
   * @param {object} params { range, startDate, endDate }
   */
  async getOverview(params = {}) {
    const res = await apiClient.get('/v1/dashboard/overview', { params });
    return res.data;
  },

  /**
   * Fetch lead pipeline distribution across all 7 stages
   */
  async getLeadPipeline() {
    const res = await apiClient.get('/v1/dashboard/lead-pipeline');
    return res.data;
  },

  /**
   * Fetch time-series lead creation & conversion trends
   * @param {object} params { range, startDate, endDate, interval }
   */
  async getLeadTrends(params = {}) {
    const res = await apiClient.get('/v1/dashboard/lead-trends', { params });
    return res.data;
  },

  /**
   * Fetch follow-up status, type, and priority analytics
   */
  async getFollowupAnalytics() {
    const res = await apiClient.get('/v1/dashboard/followup-analytics');
    return res.data;
  },

  /**
   * Fetch team performance summary (Admin & Manager)
   */
  async getTeamPerformance() {
    const res = await apiClient.get('/v1/dashboard/team-performance');
    return res.data;
  },

  /**
   * Fetch employee workload & performance metrics (Admin & Manager)
   * @param {object} params { range, startDate, endDate }
   */
  async getEmployeePerformance(params = {}) {
    const res = await apiClient.get('/v1/dashboard/employee-performance', { params });
    return res.data;
  },

  /**
   * Fetch recent activity events
   * @param {object} params { limit }
   */
  async getRecentActivity(params = {}) {
    const res = await apiClient.get('/v1/dashboard/recent-activity', { params });
    return res.data;
  },
};
