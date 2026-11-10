import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useEmployees, useEmployeeMutations } from '../features/employees/hooks/useEmployees.js';
import { EmployeeTable } from '../features/employees/components/EmployeeTable.jsx';
import { CreateEmployeeModal } from '../features/employees/components/CreateEmployeeModal.jsx';
import { EditEmployeeModal } from '../features/employees/components/EditEmployeeModal.jsx';
import { ChangeRoleModal } from '../features/employees/components/ChangeRoleModal.jsx';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog.jsx';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Briefcase,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';

export function EmployeesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  const hasActiveFilters = Boolean(searchTerm || roleFilter || isActiveFilter !== '');

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setIsActiveFilter('');
    setPage(1);
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [changingRoleEmployee, setChangingRoleEmployee] = useState(null);
  const [confirmToggleEmp, setConfirmToggleEmp] = useState(null);

  // Fetch employees
  const { data, isLoading } = useEmployees({
    search: searchTerm || undefined,
    role: roleFilter || undefined,
    isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
    page,
    limit: 10,
  });

  const {
    createEmployee,
    isCreating,
    updateEmployee,
    isUpdating,
    changeRole,
    isChangingRole,
    deactivateEmployee,
    activateEmployee,
  } = useEmployeeMutations();

  const employees = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  // Calculate quick stats from returned data
  const totalEmployees = meta.total;
  const adminCount = employees.filter((e) => e.role === 'ADMIN' && e.is_active).length;
  const managerCount = employees.filter((e) => e.role === 'MANAGER' && e.is_active).length;
  const employeeCount = employees.filter((e) => e.role === 'EMPLOYEE' && e.is_active).length;

  const handleToggleActive = (emp) => {
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      return;
    }
    setConfirmToggleEmp(emp);
  };

  const handleConfirmToggleActive = async () => {
    if (!confirmToggleEmp) return;
    try {
      if (confirmToggleEmp.is_active) {
        await deactivateEmployee(confirmToggleEmp.id);
      } else {
        await activateEmployee(confirmToggleEmp.id);
      }
    } finally {
      setConfirmToggleEmp(null);
    }
  };

  const handleOpenCreate = () => {
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      return;
    }
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory & Staff Administration"
        description="Manage organizational staff, configure security roles, and control account access."
        breadcrumbs={[
          { label: 'Dashboard', href: isDemo ? '/demo' : '/dashboard' },
          { label: 'Employees' },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon={UserPlus}
            onClick={handleOpenCreate}
          >
            Add Employee
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Staff</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalEmployees}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Administrators</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{adminCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Team Managers</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{managerCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sales Representatives</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{employeeCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, email..."
              leftIcon={Search}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              rightIcon={
                searchTerm
                  ? () => (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setPage(1);
                        }}
                        className="text-slate-400 hover:text-slate-600 pointer-events-auto"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )
                  : null
              }
            />
          </div>

          {/* Right: Role & Status filters + Reset */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="w-full sm:w-44">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                containerClassName="w-full"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="MANAGER">Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={isActiveFilter}
                onChange={(e) => {
                  setIsActiveFilter(e.target.value);
                  setPage(1);
                }}
                containerClassName="w-full"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Deactivated</option>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={RotateCcw}
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-slate-900 shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Table / Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading employee directory...
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No employees found"
              description={
                searchTerm || roleFilter || isActiveFilter
                  ? 'No employees match the selected criteria.'
                  : 'Start onboarding staff members to your organization.'
              }
              action={
                <Button
                  size="sm"
                  leftIcon={UserPlus}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Add Employee
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              currentUserId={user?.id}
              onEdit={(emp) => setEditingEmployee(emp)}
              onChangeRole={(emp) => setChangingRoleEmployee(emp)}
              onToggleActive={handleToggleActive}
            />

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {employees.length} of {meta.total} employees
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span>
                  Page {page} of {meta.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createEmployee}
        isSubmitting={isCreating}
      />

      <EditEmployeeModal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSubmit={updateEmployee}
        isSubmitting={isUpdating}
      />

      <ChangeRoleModal
        isOpen={Boolean(changingRoleEmployee)}
        onClose={() => setChangingRoleEmployee(null)}
        employee={changingRoleEmployee}
        onSubmit={changeRole}
        isSubmitting={isChangingRole}
      />

      {/* Center Confirmation Dialog with Background Blur & Scroll Lock */}
      <ConfirmationDialog
        isOpen={Boolean(confirmToggleEmp)}
        onClose={() => setConfirmToggleEmp(null)}
        onConfirm={handleConfirmToggleActive}
        title={confirmToggleEmp?.is_active ? 'Deactivate Employee?' : 'Reactivate Employee?'}
        message={
          confirmToggleEmp?.is_active
            ? `Are you sure you want to deactivate ${confirmToggleEmp.first_name} ${confirmToggleEmp.last_name}? Their active sessions will be terminated immediately and they will be logged out.`
            : `Are you sure you want to reactivate ${confirmToggleEmp?.first_name} ${confirmToggleEmp?.last_name}? They will be permitted to log in to the workspace again.`
        }
        confirmText={confirmToggleEmp?.is_active ? 'Deactivate Employee' : 'Reactivate Employee'}
        isDestructive={Boolean(confirmToggleEmp?.is_active)}
        isLoading={isUpdating}
      />
    </div>
  );
}
