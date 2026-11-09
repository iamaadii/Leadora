import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { CalendarClock } from 'lucide-react';

export function CreateFollowupModal({
  isOpen,
  onClose,
  defaultLeadId = null,
  defaultLeadName = '',
  leads = [],
  assignees = [],
  userRole = 'EMPLOYEE',
  currentUserId = null,
  onSubmit,
  isLoading = false,
}) {
  // Format current time + 1 hour as local datetime-local default string
  const getDefaultDateTime = () => {
    const nextHour = new Date(Date.now() + 3600 * 1000);
    nextHour.setMinutes(0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const tzOffset = nextHour.getTimezoneOffset() * 60000;
    const localISOTime = new Date(nextHour.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [formData, setFormData] = useState({
    leadId: defaultLeadId || '',
    title: '',
    description: '',
    type: 'CALL',
    priority: 'MEDIUM',
    dueAt: getDefaultDateTime(),
    assignedToId: userRole === 'EMPLOYEE' ? currentUserId || '' : currentUserId || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        leadId: defaultLeadId || '',
        title: '',
        description: '',
        type: 'CALL',
        priority: 'MEDIUM',
        dueAt: getDefaultDateTime(),
        assignedToId: userRole === 'EMPLOYEE' ? currentUserId || '' : currentUserId || '',
      });
      setErrors({});
    }
  }, [isOpen, defaultLeadId, userRole, currentUserId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.leadId) {
      newErrors.leadId = 'Please select a lead';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.dueAt) {
      newErrors.dueAt = 'Due date and time is required';
    } else {
      const parsed = new Date(formData.dueAt);
      if (isNaN(parsed.getTime())) {
        newErrors.dueAt = 'Invalid date and time format';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert local datetime-local to ISO UTC
    const dateObj = new Date(formData.dueAt);
    const payload = {
      leadId: formData.leadId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      priority: formData.priority,
      dueAt: dateObj.toISOString(),
      assignedToId: formData.assignedToId || undefined,
    };

    onSubmit(payload);
  };

  const leadOptions = [
    { value: '', label: '-- Select Target Lead --' },
    ...leads.map((l) => ({
      value: l.id,
      label: `${l.name} ${l.company ? `(${l.company})` : ''}`,
    })),
  ];

  const assigneeOptions = [
    { value: '', label: '-- Auto-assign to self --' },
    ...assignees.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.role})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up Task"
      description="Plan future touchpoints, meetings, or discovery calls with a prospect."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lead selection if not pre-bound */}
        {defaultLeadId ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Lead</label>
            <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200">
              {defaultLeadName || 'Selected Lead'}
            </div>
          </div>
        ) : (
          <Select
            label="Target Lead"
            required
            value={formData.leadId}
            onChange={(e) => handleChange('leadId', e.target.value)}
            options={leadOptions}
            error={errors.leadId}
          />
        )}

        <Input
          label="Task / Follow-up Title"
          required
          placeholder="e.g., Q4 Pricing Proposal Review"
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
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => handleChange('dueAt', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.dueAt
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
            </div>
            {errors.dueAt && <p className="text-[11px] text-rose-500 mt-1">{errors.dueAt}</p>}
          </div>

          <Select
            label="Assigned To"
            disabled={userRole === 'EMPLOYEE'}
            value={formData.assignedToId}
            onChange={(e) => handleChange('assignedToId', e.target.value)}
            options={assigneeOptions}
            helperText={
              userRole === 'EMPLOYEE' ? 'Employees can only assign tasks to themselves' : undefined
            }
          />
        </div>

        <Textarea
          label="Preparation Notes / Agenda"
          placeholder="Key talking points, discovery questions, or requested follow-up items..."
          rows={3}
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
            leftIcon={CalendarClock}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Schedule Follow-up
          </Button>
        </div>
      </form>
    </Modal>
  );
}
