import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  /**
   * GET /api/v1/dashboard/overview
   */
  async getOverview(req, res, next) {
    try {
      const data = await dashboardService.getOverview(req.user, req.query);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/lead-pipeline
   */
  async getLeadPipeline(req, res, next) {
    try {
      const data = await dashboardService.getLeadPipeline(req.user);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/lead-trends
   */
  async getLeadTrends(req, res, next) {
    try {
      const data = await dashboardService.getLeadTrends(req.user, req.query);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/followup-analytics
   */
  async getFollowupAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getFollowupAnalytics(req.user);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/team-performance
   */
  async getTeamPerformance(req, res, next) {
    try {
      const data = await dashboardService.getTeamPerformance(req.user);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/employee-performance
   */
  async getEmployeePerformance(req, res, next) {
    try {
      const data = await dashboardService.getEmployeePerformance(req.user, req.query);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/recent-activity
   */
  async getRecentActivity(req, res, next) {
    try {
      const data = await dashboardService.getRecentActivity(req.user, req.query);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

