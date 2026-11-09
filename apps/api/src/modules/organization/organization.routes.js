// organization.routes.js
// Phase 10: Organization Settings Routes

import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const organizationRouter = Router();

organizationRouter.use(authenticate);

// Viewing settings: Allowed for Admin
organizationRouter.get('/settings', authorizeRoles('ADMIN'), organizationController.getSettings);

// Updating settings: Strictly Admin only
organizationRouter.patch('/settings', authorizeRoles('ADMIN'), organizationController.updateSettings);

export { organizationRouter };
