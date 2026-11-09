import { Router } from 'express';
import { employeesController } from './employees.controller.js';
import {
  validateBody,
  validateQuery,
  createEmployeeSchema,
  updateEmployeeSchema,
  changeRoleSchema,
  queryEmployeesSchema,
} from './employees.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';

const router = Router();

// All employee management endpoints require authentication and ADMIN role
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// Employee collection routes
router.get('/', validateQuery(queryEmployeesSchema), employeesController.listEmployees);
router.post('/', validateBody(createEmployeeSchema), employeesController.createEmployee);

// Single employee resource routes
router.get('/:id', employeesController.getEmployeeById);
router.patch('/:id', validateBody(updateEmployeeSchema), employeesController.updateEmployee);
router.patch('/:id/role', validateBody(changeRoleSchema), employeesController.changeRole);
router.patch('/:id/deactivate', employeesController.deactivateEmployee);
router.patch('/:id/activate', employeesController.activateEmployee);

export default router;
