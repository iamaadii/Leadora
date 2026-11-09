import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useEmployees } from '../../employees/hooks/useEmployees.js';

export function CreateTeamModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
  });

  const { data: managersData, isLoading: isLoadingManagers } = useEmployees({
    role: 'MANAGER',
    isActive: true,
    limit: 100,
  });

  const managers = managersData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name,
      description: formData.description || null,
      managerId: formData.managerId || null,
    });
    setFormData({ name: '', description: '', managerId: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Team"
      description="Define a new sales team and assign an active manager."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Team Name *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Enterprise Outbound"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the team's territory or focus..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Assigned Team Manager
          </label>
          <Select
            name="managerId"
            value={formData.managerId}
            onChange={handleChange}
            disabled={isLoadingManagers}
          >
            <option value="">No manager assigned</option>
            {managers.map((mgr) => (
              <option key={mgr.id} value={mgr.id}>
                {mgr.first_name} {mgr.last_name} ({mgr.email})
              </option>
            ))}
          </Select>
          <p className="text-[11px] text-slate-500 mt-1">
            Only users with role MANAGER can be assigned as team managers.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}

