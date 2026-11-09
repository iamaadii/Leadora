import { leadsService } from './leads.service.js';

export const leadsController = {
  /**
   * POST /api/v1/leads
   */
  async createLead(req, res, next) {
    try {
      const lead = await leadsService.createLead(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/leads
   */
  async getLeads(req, res, next) {
    try {
      const result = await leadsService.getLeads(req.user, req.query);
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
   * GET /api/v1/leads/assignees
   */
  async getAssignableUsers(req, res, next) {
    try {
      const users = await leadsService.getAssignableUsers(req.user);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/leads/:id
   */
  async getLeadById(req, res, next) {
    try {
      const lead = await leadsService.getLeadById(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/leads/:id
   */
  async updateLead(req, res, next) {
    try {
      const updatedLead = await leadsService.updateLead(
        req.user,
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: updatedLead,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/leads/:id/archive
   */
  async archiveLead(req, res, next) {
    try {
      const archivedLead = await leadsService.archiveLead(req.user, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Lead archived successfully',
        data: archivedLead,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/leads/:id/restore
   */
  async restoreLead(req, res, next) {
    try {
      const restoredLead = await leadsService.restoreLead(req.user, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Lead restored successfully',
        data: restoredLead,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/leads/:id/activities
   */
  async getLeadActivities(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await leadsService.getLeadActivities(
        req.user,
        req.params.id,
        { page, limit },
      );

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
};

