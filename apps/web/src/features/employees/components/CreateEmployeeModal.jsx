import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { PhoneInput } from '../../../components/ui/PhoneInput.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { RefreshCw, KeyRound } from 'lucide-react';

export function CreateEmployeeModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    temporaryPassword: 'Password123!',
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Temp';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '1!';
    setFormData((prev) => ({ ...prev, temporaryPassword: pwd }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      description="Create a new user account with temporary credentials and role permissions."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              First Name *
            </label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Jane"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Last Name *
            </label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane.doe@company.com"
            required
          />
        </div>

        <PhoneInput
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            System Role *
          </label>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="EMPLOYEE">Employee (Assigned leads only)</option>
            <option value="MANAGER">Manager (Leads team, view & assign team leads)</option>
            <option value="ADMIN">Administrator (Full organization access & staff administration)</option>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">
              Temporary Password *
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Generate
            </button>
          </div>
          <Input
            name="temporaryPassword"
            value={formData.temporaryPassword}
            onChange={handleChange}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            leftIcon={KeyRound}
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            The user will be required to change this password on their initial login.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
}

