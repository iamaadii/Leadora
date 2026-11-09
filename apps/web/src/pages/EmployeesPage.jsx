import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Users, UserPlus, Search } from 'lucide-react';

export function EmployeesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteUserPlaceholder = (e) => {
    e.preventDefault();
    setIsInviteModalOpen(false);
    toast.info('Employee invite API will be connected in Phase 6 (Employee & Team Management).', 'Phase 4 Design System');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees & Teams"
        description="Manage organizational staff, assign roles, and administer sales teams."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees' },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Employee
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search employees by name, email..."
            leftIcon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
        <EmptyState
          icon={Users}
          title="Team roster not yet loaded"
          description="Employee listings and team assignments will appear here once connected in the Employee Management phase."
          actionText="Invite New Member"
          onAction={() => setIsInviteModalOpen(true)}
        />
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Employee"
        description="Send an invitation to join your organization's sales CRM workspace."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInviteUserPlaceholder}>
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleInviteUserPlaceholder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="e.g. Alex" required />
            <Input label="Last Name" placeholder="e.g. Vance" required />
          </div>
          <Input label="Email Address" type="email" placeholder="alex@company.com" required />
          <Select label="Role Permission Level" defaultValue="EMPLOYEE">
            <option value="EMPLOYEE">Employee (Assigned leads & personal tasks)</option>
            <option value="MANAGER">Manager (Team leads & rep assignments)</option>
            <option value="ADMIN">Admin (Full company management)</option>
          </Select>
        </form>
      </Modal>
    </div>
  );
}

