import { followupsService } from './followups.service.js';

export const followupsController = {
  /**
   * POST /api/v1/followups
   */
  async createFollowup(req, res, next) {
    try {
      const followup = await followupsService.createFollowup(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Follow-up created successfully',
        data: followup,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/followups
   */
  async listFollowups(req, res, next) {
    try {
      const result = await followupsService.listFollowups(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/followups/summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await followupsService.getSummary(req.user);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/followups/:id
   */
  async getFollowupById(req, res, next) {
    try {
      const followup = await followupsService.getFollowupById(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: followup,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/followups/:id
   */
  async updateFollowup(req, res, next) {
    try {
      const updated = await followupsService.updateFollowup(req.user, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Follow-up updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/followups/:id/complete
   */
  async completeFollowup(req, res, next) {
    try {
      const { completion_notes, completionNotes } = req.body || {};
      const notes = completionNotes !== undefined ? completionNotes : completion_notes;
      const completed = await followupsService.completeFollowup(req.user, req.params.id, notes);
      res.status(200).json({
        success: true,
        message: 'Follow-up marked as completed',
        data: completed,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/followups/:id/cancel
   */
  async cancelFollowup(req, res, next) {
    try {
      const cancelled = await followupsService.cancelFollowup(req.user, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Follow-up cancelled',
        data: cancelled,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/followups/lead/:leadId or GET /api/v1/leads/:id/followups
   */
  async getLeadFollowups(req, res, next) {
    try {
      const leadId = req.params.leadId || req.params.id;
      const followups = await followupsService.getLeadFollowups(req.user, leadId);
      res.status(200).json({
        success: true,
        data: followups,
      });
    } catch (err) {
      next(err);
    }
  },
};
