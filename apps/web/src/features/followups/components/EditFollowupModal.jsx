import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Edit3 } from 'lucide-react';

export function EditFollowupModal({
  isOpen,
  onClose,
  followup = null,
  assignees = [],
  userRole = 'EMPLOYEE',
  onSubmit,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CALL',
    priority: 'MEDIUM',
    dueAt: '',
    assignedToId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (followup) {
      let localDateStr = '';
      if (followup.due_at) {
        const d = new Date(followup.due_at);
        const tzOffset = d.getTimezoneOffset() * 60000;
        localDateStr = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      }

      setFormData({
        title: followup.title || '',
        description: followup.description || '',
        type: followup.type || 'CALL',
        priority: followup.priority || 'MEDIUM',
        dueAt: localDateStr,
        assignedToId: followup.assigned_to_id || '',
      });
      setErrors({});
    }
  }, [followup, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }
    if (!formData.dueAt) {
      newErrors.dueAt = 'Scheduled date and time is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      priority: formData.priority,
      dueAt: new Date(formData.dueAt).toISOString(),
    };

    if (userRole !== 'EMPLOYEE' && formData.assignedToId) {
      payload.assignedToId = formData.assignedToId;
    }

    onSubmit(payload);
  };

  const assigneeOptions = [
    { value: '', label: '-- Keep current assignee --' },
    ...assignees.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.role})`,
    })),
  ];

  const isTerminal = followup?.status === 'COMPLETED' || followup?.status === 'CANCELLED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit & Reschedule Follow-up"
      description={
        followup?.lead_name
          ? `For lead: ${followup.lead_name}`
          : 'Modify task details, priority or scheduled date'
      }
      size="md"
    >
      {isTerminal ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            This follow-up is already marked as {followup.status.toLowerCase()}.
          </p>
          <p className="text-[11px] text-slate-500">
            Completed or cancelled follow-ups cannot be edited to maintain strict historical audit logs.
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Follow-up Title"
            required
            autoFocus
            clearable
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Activity Type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: 'CALL', label: 'Phone Call' },
                { value: 'EMAIL', label: 'Email Outreach' },
                { value: 'MEETING', label: 'Meeting / Demo' },
                { value: 'TASK', label: 'General Task' },
              ]}
            />

            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              options={[
                { value: 'HIGH', label: 'High Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Low Priority' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => handleChange('dueAt', e.target.value)}
                className={`w-full py-2.5 px-3.5 text-xs rounded-xl border bg-white focus:outline-none transition ${
                  errors.dueAt
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              />
              {errors.dueAt && (
                <p className="animate-in fade-in slide-in-from-top-1 text-xs text-rose-500 font-medium mt-1">
                  {errors.dueAt}
                </p>
              )}
            </div>

            <Select
              label="Reassign To"
              disabled={userRole === 'EMPLOYEE'}
              value={formData.assignedToId}
              onChange={(e) => handleChange('assignedToId', e.target.value)}
              options={assigneeOptions}
              helperText={
                userRole === 'EMPLOYEE'
                  ? 'Employees cannot reassign follow-ups'
                  : 'Assignee receives in-app notification'
              }
            />
          </div>

          <Textarea
            label="Notes & Context"
            rows={3}
            maxLength={500}
            showCount
            autoGrow
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              leftIcon={Edit3}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
