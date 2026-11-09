import { Router } from 'express';
import { leadsController } from './leads.controller.js';
import {
  validateBody,
  validateQuery,
  createLeadSchema,
  updateLeadSchema,
  queryLeadsSchema,
} from './leads.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// 1. Assignable users in tenant organization (for dropdowns)
router.get('/assignees', leadsController.getAssignableUsers);

// 2. Lead collection routes
router.get('/', validateQuery(queryLeadsSchema), leadsController.getLeads);
router.post('/', validateBody(createLeadSchema), leadsController.createLead);

// 3. Lead resource routes
router.get('/:id', leadsController.getLeadById);
router.patch('/:id', validateBody(updateLeadSchema), leadsController.updateLead);

// 4. Archive and restore routes (restricted to Admin per role-permissions spec)
router.patch('/:id/archive', authorizeRoles('ADMIN'), leadsController.archiveLead);
router.patch('/:id/restore', authorizeRoles('ADMIN'), leadsController.restoreLead);

// 5. Lead activity history
router.get('/:id/activities', leadsController.getLeadActivities);

export const leadsRouter = router;
