import { Router } from 'express';
import { followupsController } from './followups.controller.js';
import {
  validateBody,
  validateQuery,
  createFollowupSchema,
  updateFollowupSchema,
  completeFollowupSchema,
  queryFollowupsSchema,
} from './followups.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const router = Router();

// All follow-up routes require authentication and tenant roles (ADMIN, MANAGER, EMPLOYEE)
router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'));

// 1. Metric summary route (must come before /:id)
router.get('/summary', followupsController.getSummary);

// 2. Collection routes
router.get('/', validateQuery(queryFollowupsSchema), followupsController.listFollowups);
router.post('/', validateBody(createFollowupSchema), followupsController.createFollowup);

// 3. Lead specific follow-ups
router.get('/lead/:leadId', followupsController.getLeadFollowups);

// 4. Resource routes by ID
router.get('/:id', followupsController.getFollowupById);
router.patch('/:id', validateBody(updateFollowupSchema), followupsController.updateFollowup);
router.patch(
  '/:id/complete',
  validateBody(completeFollowupSchema),
  followupsController.completeFollowup,
);
router.patch('/:id/cancel', followupsController.cancelFollowup);

export const followupsRouter = router;
