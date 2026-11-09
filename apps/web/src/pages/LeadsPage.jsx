import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  Target,
  Plus,
  Search,
  Filter,
  Columns3,
  List,
} from 'lucide-react';

export function LeadsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateLeadClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveLeadPlaceholder = (e) => {
    e.preventDefault();
    setIsCreateModalOpen(false);
    toast.info('Lead creation will be enabled in Phase 5 (Lead Management & Pipeline).', 'Phase 4 Design System');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Pipeline"
        description="Track prospects across your sales lifecycle from initial discovery through conversion."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Leads' },
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white shadow-xs text-blue-600"
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                title="Kanban view (Coming soon)"
                onClick={() => toast.info('Kanban view is scheduled for Phase 5.')}
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
            <Button size="sm" leftIcon={Plus} onClick={handleCreateLeadClick}>
              Create Lead
            </Button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search leads by name, email, company..."
            leftIcon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full sm:w-44"
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            leftIcon={Filter}
            onClick={() => toast.info('Advanced filter dialog will be activated in Phase 5.')}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Empty State / Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
        <EmptyState
          icon={Target}
          title="No leads in pipeline"
          description="You haven't captured any customer leads yet. Create your first lead to begin tracking conversations, deal sizes, and status progressions."
          actionText="Create First Lead"
          onAction={handleCreateLeadClick}
        />
      </div>

      {/* Create Lead Modal Form (UI Skeleton / Preview) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Lead"
        description="Enter prospective customer and commercial deal details."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveLeadPlaceholder}>
              Save Lead
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveLeadPlaceholder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="e.g. Sarah" required />
            <Input label="Last Name" placeholder="e.g. Connor" required />
          </div>
          <Input label="Company Name" placeholder="e.g. Cyberdyne Systems" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Work Email" type="email" placeholder="sarah@example.com" />
            <Input label="Phone Number" placeholder="+1-555-0199" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Initial Stage" defaultValue="NEW">
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
            </Select>
            <Input label="Estimated Deal Value ($)" type="number" placeholder="5000" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
