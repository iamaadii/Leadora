import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { validateQuery, queryDashboardSchema } from './dashboard.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const router = Router();

// All dashboard endpoints require authentication and tenant roles
router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

// 1. KPI Overview (with date range filter)
router.get('/overview', validateQuery(queryDashboardSchema), dashboardController.getOverview);

// 2. Lead Pipeline Stages distribution
router.get('/lead-pipeline', dashboardController.getLeadPipeline);

// 3. Lead Creation & Conversion Trends (time-series)
router.get('/lead-trends', validateQuery(queryDashboardSchema), dashboardController.getLeadTrends);

// 4. Follow-up Analytics (status, type, priority)
router.get('/followup-analytics', dashboardController.getFollowupAnalytics);

// 5. Team Performance (restricted to Admin & Manager in service layer)
router.get('/team-performance', dashboardController.getTeamPerformance);

// 6. Employee Performance (restricted to Admin & Manager in service layer)
router.get(
  '/employee-performance',
  validateQuery(queryDashboardSchema),
  dashboardController.getEmployeePerformance,
);

// 7. Recent Activity Timeline
router.get('/recent-activity', dashboardController.getRecentActivity);

export const dashboardRouter = router;

