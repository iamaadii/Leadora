import { apiClient } from '../../../services/api.js';

export const employeesService = {
  /**
   * Fetch paginated employees
   * @param {object} params
   */
  async getEmployees(params = {}) {
    const res = await apiClient.get('/v1/employees', { params });
    return res.data;
  },

  /**
   * Fetch single employee by ID
   * @param {string} id
   */
  async getEmployeeById(id) {
    const res = await apiClient.get(`/v1/employees/${id}`);
    return res.data;
  },

  /**
   * Create a new employee
   * @param {object} data
   */
  async createEmployee(data) {
    const res = await apiClient.post('/v1/employees', data);
    return res.data;
  },

  /**
   * Update employee details
   * @param {string} id
   * @param {object} data
   */
  async updateEmployee(id, data) {
    const res = await apiClient.patch(`/v1/employees/${id}`, data);
    return res.data;
  },

  /**
   * Change employee role
   * @param {string} id
   * @param {string} role
   */
  async changeRole(id, role) {
    const res = await apiClient.patch(`/v1/employees/${id}/role`, { role });
    return res.data;
  },

  /**
   * Deactivate employee
   * @param {string} id
   */
  async deactivateEmployee(id) {
    const res = await apiClient.patch(`/v1/employees/${id}/deactivate`);
    return res.data;
  },

  /**
   * Activate employee
   * @param {string} id
   */
  async activateEmployee(id) {
    const res = await apiClient.patch(`/v1/employees/${id}/activate`);
    return res.data;
  },
};

