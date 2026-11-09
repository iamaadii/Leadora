import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useEmployees } from '../../employees/hooks/useEmployees.js';

export function EditTeamModal({ isOpen, onClose, team, onSubmit, isSubmitting }) {
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

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        managerId: team.manager_id || '',
      });
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      id: team.id,
      data: {
        name: formData.name,
        description: formData.description || null,
        managerId: formData.managerId || null,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Team"
      description={`Update settings and manager for ${team?.name}.`}
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
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
