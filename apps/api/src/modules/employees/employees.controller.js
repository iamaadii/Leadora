import { employeesService } from './employees.service.js';

export const employeesController = {
  /**
   * GET /api/v1/employees
   */
  async listEmployees(req, res, next) {
    try {
      const result = await employeesService.listEmployees(req.user.organizationId, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/employees/:id
   */
  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeesService.getEmployeeById(req.params.id, req.user.organizationId);
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/employees
   */
  async createEmployee(req, res, next) {
    try {
      const employee = await employeesService.createEmployee(
        req.user,
        req.body,
        req.ip || req.socket.remoteAddress,
      );
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/employees/:id
   */
  async updateEmployee(req, res, next) {
    try {
      const employee = await employeesService.updateEmployee(
        req.user,
        req.params.id,
        req.body,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/employees/:id/role
   */
  async changeRole(req, res, next) {
    try {
      const employee = await employeesService.changeRole(
        req.user,
        req.params.id,
        req.body.role,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Employee role updated successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/employees/:id/deactivate
   */
  async deactivateEmployee(req, res, next) {
    try {
      const employee = await employeesService.deactivateEmployee(
        req.user,
        req.params.id,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Employee deactivated successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/employees/:id/activate
   */
  async activateEmployee(req, res, next) {
    try {
      const employee = await employeesService.activateEmployee(
        req.user,
        req.params.id,
        req.ip || req.socket.remoteAddress,
      );
      res.status(200).json({
        success: true,
        message: 'Employee activated successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  },
};
