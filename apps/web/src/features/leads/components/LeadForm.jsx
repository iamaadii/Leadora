import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { PhoneInput } from '../../../components/ui/PhoneInput.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { getCurrencySymbol } from '../../../utils/currency.js';
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_PRIORITIES,
  LOSS_REASONS,
} from '../leads.constants.js';

export function LeadForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  assignees = [],
  userRole = 'EMPLOYEE',
  currentUserId = null,
}) {
  const { organizationCurrency } = useAuth();
  const currencySymbol = getCurrencySymbol(organizationCurrency);
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'WEBSITE',
    status: 'NEW',
    priority: 'MEDIUM',
    estimated_value: '',
    loss_reason: LOSS_REASONS[0],
    loss_notes: '',
    assigned_to_id: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        source: initialData.source || 'WEBSITE',
        status: initialData.status || 'NEW',
        priority: initialData.priority || 'MEDIUM',
        estimated_value:
          initialData.estimated_value !== null && initialData.estimated_value !== undefined
            ? String(initialData.estimated_value)
            : '',
        loss_reason: initialData.loss_reason || LOSS_REASONS[0],
        loss_notes: initialData.loss_notes || '',
        assigned_to_id: initialData.assigned_to_id || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'WEBSITE',
        status: 'NEW',
        priority: 'MEDIUM',
        estimated_value: '',
        loss_reason: LOSS_REASONS[0],
        loss_notes: '',
        assigned_to_id: userRole === 'EMPLOYEE' ? currentUserId || '' : '',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, userRole, currentUserId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Lead name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (formData.estimated_value !== '' && formData.estimated_value !== null) {
      const val = Number(formData.estimated_value);
      if (isNaN(val) || val < 0) {
        newErrors.estimated_value = 'Deal value must be a non-negative number';
      }
    }

    if (formData.status === 'LOST') {
      if (!formData.loss_reason) {
        newErrors.loss_reason = 'Loss reason is required';
      } else if (formData.loss_reason === 'Other' && !formData.loss_notes?.trim()) {
        newErrors.loss_notes = 'Please provide an explanation for "Other"';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      source: formData.source || 'WEBSITE',
      status: formData.status || 'NEW',
      priority: formData.priority || 'MEDIUM',
      estimated_value:
        formData.estimated_value !== '' && formData.estimated_value !== null
          ? parseFloat(formData.estimated_value)
          : null,
      assigned_to_id: formData.assigned_to_id || null,
      description: formData.description.trim() || null,
    };

    if (formData.status === 'LOST') {
      payload.loss_reason = formData.loss_reason;
      payload.loss_notes = formData.loss_notes.trim() || null;
    }

    onSubmit(payload);
  };

  const canReassign = userRole === 'ADMIN' || userRole === 'MANAGER';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lead' : 'Create New Lead'}
      description={
        isEditing
          ? 'Update contact details, sales pipeline status, or assignment.'
          : 'Capture a new commercial lead and prospective customer profile.'
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            placeholder="e.g. Sarah Connor"
            required
            autoFocus
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label="Company Name"
            placeholder="e.g. Cyberdyne Systems"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            inputMode="email"
            autoComplete="email"
            clearable
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
          <PhoneInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        {/* Priority & Estimated Deal Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>

          <Input
            label="Estimated Deal Value"
            prefix={currencySymbol}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="25,000.00"
            value={formData.estimated_value}
            onChange={(e) => handleChange('estimated_value', e.target.value)}
            error={errors.estimated_value}
            helperText={`Monetary value in ${organizationCurrency}`}
          />
        </div>

        {/* Status & Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Pipeline Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>

          <Select
            label="Lead Source"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
          >
            {LEAD_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>

        {/* Loss Reason (only shown when status is LOST) */}
        {formData.status === 'LOST' && (
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-3">
            <Select
              label="Loss Reason *"
              value={formData.loss_reason}
              onChange={(e) => handleChange('loss_reason', e.target.value)}
              error={errors.loss_reason}
            >
              {LOSS_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>

            <Textarea
              label={
                formData.loss_reason === 'Other'
                  ? 'Explanation / Notes *'
                  : 'Additional Loss Notes (Optional)'
              }
              placeholder="Record why this lead did not proceed..."
              rows={2}
              maxLength={300}
              showCount
              autoGrow
              value={formData.loss_notes}
              onChange={(e) => handleChange('loss_notes', e.target.value)}
              error={errors.loss_notes}
            />
          </div>
        )}

        {/* Assigned Rep (if permitted) */}
        <div>
          <Select
            label="Assigned Employee"
            value={formData.assigned_to_id}
            onChange={(e) => handleChange('assigned_to_id', e.target.value)}
            disabled={!canReassign && isEditing}
            helperText={
              !canReassign && isEditing
                ? 'Only Managers and Admins can reassign active leads.'
                : 'Select the sales representative responsible for this lead.'
            }
          >
            <option value="">Unassigned</option>
            {assignees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.role})
              </option>
            ))}
          </Select>
        </div>

        {/* Description / Notes */}
        <div>
          <Textarea
            label="Description & Qualification Notes"
            placeholder="Add background notes, customer requirements, or meeting takeaways..."
            rows={3}
            maxLength={500}
            showCount
            autoGrow
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
