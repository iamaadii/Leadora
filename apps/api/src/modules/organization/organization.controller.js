// organization.controller.js
// Phase 10: Organization Settings HTTP Controller

import { organizationService } from './organization.service.js';
import { updateOrganizationSettingsSchema } from './organization.validation.js';

export const organizationController = {
  /**
   * GET /api/v1/organization/settings
   */
  async getSettings(req, res, next) {
    try {
      const data = await organizationService.getSettings(req.user);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/organization/settings
   */
  async updateSettings(req, res, next) {
    try {
      const validatedData = updateOrganizationSettingsSchema.parse(req.body);
      const data = await organizationService.updateSettings(req.user, validatedData);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
