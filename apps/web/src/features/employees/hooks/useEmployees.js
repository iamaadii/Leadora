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
      toast.success(`Employee ${data.data.first_name} created`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => employeesService.updateEmployee(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Employee updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => employeesService.changeRole(id, role),
    onSuccess: (data) => {
      invalidate();
      toast.success(`Role changed to ${data.data.role}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    },
  });

  const deactivateEmployeeMutation = useMutation({
    mutationFn: (args) => {
      if (typeof args === 'object' && args !== null && 'id' in args) {
        return employeesService.deactivateEmployee(args.id, args.payload || {});
      }
      return employeesService.deactivateEmployee(args);
    },
    onSuccess: () => {
      invalidate();
      toast.success('Employee deactivated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate employee');
    },
  });

  const activateEmployeeMutation = useMutation({
    mutationFn: (id) => employeesService.activateEmployee(id),
    onSuccess: () => {
      invalidate();
      toast.success('Employee activated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to activate employee');
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

