// platform.controller.js
// Phase 10: Platform Super Admin Tenant Management HTTP Controller

import { platformService } from './platform.service.js';
import {
  createPlatformOrganizationSchema,
  updatePlatformOrganizationStatusSchema,
  platformOrgIdParamSchema,
  queryPlatformOrganizationsSchema,
} from './platform.validation.js';

export const platformController = {
  /**
   * GET /api/v1/platform/organizations
   */
  async getOrganizations(req, res, next) {
    try {
      const validatedQuery = queryPlatformOrganizationsSchema.parse(req.query);
      const result = await platformService.getOrganizations(req.user, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result.organizations,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/platform/organizations/:id
   */
  async getOrganizationById(req, res, next) {
    try {
      const { id } = platformOrgIdParamSchema.parse(req.params);
      const data = await platformService.getOrganizationById(req.user, id);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/platform/organizations
   */
  async createOrganization(req, res, next) {
    try {
      const validatedBody = createPlatformOrganizationSchema.parse(req.body);
      const result = await platformService.createOrganization(req.user, validatedBody);

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Organization provisioned successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/platform/organizations/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = platformOrgIdParamSchema.parse(req.params);
      const { isActive } = updatePlatformOrganizationStatusSchema.parse(req.body);

      const result = await platformService.updateOrganizationStatus(req.user, id, isActive);

      return res.status(200).json({
        success: true,
        data: result,
        message: isActive ? 'Organization reactivated successfully' : 'Organization suspended successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
