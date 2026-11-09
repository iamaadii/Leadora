import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesService } from '../services/employees.service.js';
import { useToast } from '../../../components/ui/Toast.jsx';

export const EMPLOYEE_QUERY_KEYS = {
  all: ['employees'],
  list: (params) => ['employees', 'list', params],
  detail: (id) => ['employees', 'detail', id],
};

export function useEmployees(params = {}) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.list(params),
    queryFn: () => employeesService.getEmployees(params),
    keepPreviousData: true,
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(id),
    queryFn: () => employeesService.getEmployeeById(id),
    enabled: Boolean(id),
  });
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const createEmployeeMutation = useMutation({
    mutationFn: (data) => employeesService.createEmployee(data),
    onSuccess: (data) => {
      invalidate();
      toast.success(
        `Employee ${data.data.first_name} ${data.data.last_name} created successfully!`,
        'Employee Created',
      );
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to create employee',
        'Creation Error',
      );
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => employeesService.updateEmployee(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Employee updated successfully', 'Employee Updated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to update employee',
        'Update Error',
      );
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => employeesService.changeRole(id, role),
    onSuccess: (data) => {
      invalidate();
      toast.success(
        `Role updated to ${data.data.role}`,
        'Role Changed',
      );
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to update employee role',
        'Role Change Error',
      );
    },
  });

  const deactivateEmployeeMutation = useMutation({
    mutationFn: (id) => employeesService.deactivateEmployee(id),
    onSuccess: () => {
      invalidate();
      toast.success('Employee deactivated and active sessions revoked', 'Deactivated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to deactivate employee',
        'Error',
      );
    },
  });

  const activateEmployeeMutation = useMutation({
    mutationFn: (id) => employeesService.activateEmployee(id),
    onSuccess: () => {
      invalidate();
      toast.success('Employee reactivated successfully', 'Activated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to reactivate employee',
        'Error',
      );
    },
  });

  return {
    createEmployee: createEmployeeMutation.mutateAsync,
    isCreating: createEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    isUpdating: updateEmployeeMutation.isPending,
    changeRole: changeRoleMutation.mutateAsync,
    isChangingRole: changeRoleMutation.isPending,
    deactivateEmployee: deactivateEmployeeMutation.mutateAsync,
    isDeactivating: deactivateEmployeeMutation.isPending,
    activateEmployee: activateEmployeeMutation.mutateAsync,
    isActivating: activateEmployeeMutation.isPending,
  };
}
