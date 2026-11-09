import { Router } from 'express';
import { teamsController } from './teams.controller.js';
import {
  validateBody,
  validateQuery,
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  queryTeamsSchema,
} from './teams.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const router = Router();

// All team routes require authentication
router.use(authenticate);

// Dedicated route for manager's teams (must come before /:id)
router.get(
  '/my-teams',
  authorizeRoles('ADMIN', 'MANAGER'),
  validateQuery(queryTeamsSchema),
  teamsController.getMyTeams,
);

// Collection routes
router.get(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  validateQuery(queryTeamsSchema),
  teamsController.listTeams,
);

router.post(
  '/',
  authorizeRoles('ADMIN'),
  validateBody(createTeamSchema),
  teamsController.createTeam,
);

// Team roster & workload routes (must come before general /:id routes or match after)
router.get(
  '/:id/roster',
  authorizeRoles('ADMIN', 'MANAGER'),
  teamsController.getTeamRoster,
);

router.get(
  '/:id/workload',
  authorizeRoles('ADMIN', 'MANAGER'),
  teamsController.getTeamWorkload,
);

// Team membership routes (Admin only)
router.post(
  '/:id/members',
  authorizeRoles('ADMIN'),
  validateBody(addTeamMemberSchema),
  teamsController.addMember,
);

router.delete(
  '/:id/members/:employeeId',
  authorizeRoles('ADMIN'),
  teamsController.removeMember,
);

// Status routes (Admin only)
router.patch(
  '/:id/deactivate',
  authorizeRoles('ADMIN'),
  teamsController.deactivateTeam,
);

router.patch(
  '/:id/activate',
  authorizeRoles('ADMIN'),
  teamsController.activateTeam,
);

// Single team resource routes
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  teamsController.getTeamById,
);

router.patch(
  '/:id',
  authorizeRoles('ADMIN'),
  validateBody(updateTeamSchema),
  teamsController.updateTeam,
);

export default router;

