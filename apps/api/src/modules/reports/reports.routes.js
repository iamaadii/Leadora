// reports.routes.js
// Phase 9: Reports & Data Export API Routes

import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

// Tenant Reports Router (/api/v1/reports)
const reportsRouter = Router();

// Platform Reports Router (/api/v1/platform/reports)
const platformReportsRouter = Router();

// --- 1. Tenant Reports Routes ---
reportsRouter.use(authenticate);
reportsRouter.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

// Preview report data
reportsRouter.get('/:reportType', reportsController.getReport);

// Export report in CSV, Excel, or PDF
reportsRouter.get('/:reportType/export', reportsController.exportReport);
reportsRouter.post('/:reportType/export', reportsController.exportReport);

// --- 2. Platform Reports Routes ---
platformReportsRouter.use(authenticate);
platformReportsRouter.use(authorizeRoles('SUPER_ADMIN'));

// Platform preview
platformReportsRouter.get('/:reportType', reportsController.getPlatformReport);

// Platform export
platformReportsRouter.get('/:reportType/export', reportsController.exportPlatformReport);
platformReportsRouter.post('/:reportType/export', reportsController.exportPlatformReport);

export { reportsRouter, platformReportsRouter };

