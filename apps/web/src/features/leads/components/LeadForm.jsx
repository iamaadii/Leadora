import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { LEAD_STATUSES, LEAD_SOURCES } from '../leads.constants.js';

export function LeadForm({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isLoading = false,
  assignees = [],
  userRole = 'EMPLOYEE',
  currentUserId = null,
}) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'WEBSITE',
    status: 'NEW',
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
      assigned_to_id: formData.assigned_to_id || null,
      description: formData.description.trim() || null,
    };

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
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            placeholder="+1-555-0199"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
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
            placeholder="Add background notes, budget estimates, or customer requirements..."
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

