import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { AlertCircle } from 'lucide-react';

export function ChangeRoleModal({ isOpen, onClose, employee, onSubmit, isSubmitting }) {
  const [role, setRole] = useState(employee?.role || 'EMPLOYEE');

  React.useEffect(() => {
    if (employee) setRole(employee.role);
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ id: employee.id, role });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change System Role"
      description={`Update role permissions for ${employee?.first_name} ${employee?.last_name}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            New Role *
          </label>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="EMPLOYEE">Employee (Access to assigned leads only)</option>
            <option value="MANAGER">Manager (Team leadership & team workload visibility)</option>
            <option value="ADMIN">Administrator (Full tenant administration)</option>
          </Select>
        </div>

        {employee?.role === 'MANAGER' && role !== 'MANAGER' && employee?.managed_team_name && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Active Team Assignment Warning</p>
              <p className="mt-0.5">
                This employee currently leads <strong>{employee.managed_team_name}</strong>. If you demote them, you must reassign the team manager first.
              </p>
            </div>
          </div>
        )}

        {employee?.role === 'ADMIN' && role !== 'ADMIN' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Admin Demotion Protection</p>
              <p className="mt-0.5">
                At least one active Administrator must always remain in the organization.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Update Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}

