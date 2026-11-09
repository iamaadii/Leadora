// reports.controller.js
// Phase 9: Reports & Data Export HTTP Controller

import { reportsService } from './reports.service.js';
import {
  reportQuerySchema,
  reportExportSchema,
  reportTypeParamSchema,
  platformReportTypeParamSchema,
} from './reports.validation.js';

export const reportsController = {
  /**
   * 1. GET /api/v1/reports/:reportType
   * Fetch paginated report data for frontend dashboard/tables
   */
  async getReport(req, res, next) {
    try {
      const { reportType } = reportTypeParamSchema.parse(req.params);
      const validatedQuery = reportQuerySchema.parse(req.query);

      const result = await reportsService.getReport(req.user, reportType, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 2. POST or GET /api/v1/reports/:reportType/export
   * Direct file download for CSV, Excel (.xlsx), or PDF
   */
  async exportReport(req, res, next) {
    try {
      const { reportType } = reportTypeParamSchema.parse(req.params);

      // Support params via query or request body
      const rawPayload = { ...req.query, ...req.body };
      const validated = reportExportSchema.parse(rawPayload);

      const { buffer, contentType, filename } = await reportsService.exportReport(
        req.user,
        reportType,
        validated.format,
        validated,
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 3. GET /api/v1/platform/reports/:reportType
   * Super Admin platform reports
   */
  async getPlatformReport(req, res, next) {
    try {
      const { reportType } = platformReportTypeParamSchema.parse(req.params);
      const validatedQuery = reportQuerySchema.parse(req.query);

      const result = await reportsService.getPlatformReport(req.user, reportType, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 4. POST or GET /api/v1/platform/reports/:reportType/export
   * Super Admin platform exports
   */
  async exportPlatformReport(req, res, next) {
    try {
      const { reportType } = platformReportTypeParamSchema.parse(req.params);
      const rawPayload = { ...req.query, ...req.body };
      const validated = reportExportSchema.parse(rawPayload);

      const { buffer, contentType, filename } = await reportsService.exportPlatformReport(
        req.user,
        reportType,
        validated.format,
        validated,
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  },
};

