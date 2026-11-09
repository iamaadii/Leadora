// platform.routes.js
// Phase 10: Platform Super Admin Tenant Management Routes

import { Router } from 'express';
import { platformController } from './platform.controller.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const platformRouter = Router();

// Strictly Super Admin only
platformRouter.use(authenticate);
platformRouter.use(authorizeRoles('SUPER_ADMIN'));

platformRouter.get('/organizations', platformController.getOrganizations);
platformRouter.post('/organizations', platformController.createOrganization);
platformRouter.get('/organizations/:id', platformController.getOrganizationById);
platformRouter.patch('/organizations/:id/status', platformController.updateStatus);

export { platformRouter };
