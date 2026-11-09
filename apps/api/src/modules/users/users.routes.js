// users.routes.js
// Phase 10: User Profile Routes

import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';

const usersRouter = Router();

// All user profile endpoints require authentication
usersRouter.use(authenticate);

usersRouter.get('/profile', usersController.getProfile);
usersRouter.patch('/profile', usersController.updateProfile);

export { usersRouter };
