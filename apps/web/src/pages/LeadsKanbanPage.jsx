import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useAssignees,
} from '../features/leads/hooks/useLeads.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LeadKanbanBoard } from '../features/leads/components/LeadKanbanBoard.jsx';
import { LeadForm } from '../features/leads/components/LeadForm.jsx';
import { LeadFilters } from '../features/leads/components/LeadFilters.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { LayoutGrid, Table, Plus } from 'lucide-react';

export function LeadsKanbanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const userRole = user?.role || 'EMPLOYEE';
  const canViewAll = userRole === 'ADMIN' || userRole === 'MANAGER';

  const [filters, setFilters] = useState({
    search: '',
    source: '',
    assigned_to_id: '',
    limit: 100, // Show larger batch for Kanban board
  });

  const apiParams = useMemo(() => {
    const params = { page: 1, limit: filters.limit };
    if (filters.search) params.search = filters.search;
    if (filters.source) params.source = filters.source;
    if (filters.assigned_to_id) params.assigned_to_id = filters.assigned_to_id;
    return params;
  }, [filters]);

  const { data, isLoading } = useLeads(apiParams);
  const { data: assigneesData } = useAssignees();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', source: '', assigned_to_id: '', limit: 100 });
  };

  const handleStatusChange = async (leadId, newStatus) => {
    await updateLeadMutation.mutateAsync({
      id: leadId,
      data: { status: newStatus },
    });
  };

  const handleCreateSubmit = async (payload) => {
    try {
      const res = await createLeadMutation.mutateAsync(payload);
      toast.success(`Lead "${res.data.name}" created successfully`);
      setIsCreateModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to create lead.';
      toast.error(msg, 'Creation Error');
    }
  };

  const leads = data?.data || [];
  const assignees = assigneesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Kanban"
        description="Visualize and manage lead progression across pipeline stages with drag-and-drop workflow."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: 'Kanban Board' },
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <Button
                variant="ghost"
                size="xs"
                leftIcon={Table}
                onClick={() => navigate('/leads')}
                className="text-slate-600 hover:text-slate-900"
              >
                Table View
              </Button>
              <Button
                variant="primary"
                size="xs"
                leftIcon={LayoutGrid}
                className="shadow-xs"
              >
                Kanban
              </Button>
            </div>

            <Button
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Lead
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <LeadFilters
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        assignees={assignees}
        canViewAll={canViewAll}
      />

      {/* Kanban Board */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          Loading pipeline board...
        </div>
      ) : (
        <LeadKanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          isUpdating={updateLeadMutation.isPending}
        />
      )}

      {/* Create Lead Modal */}
      <LeadForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        assignees={assignees}
        isLoading={createLeadMutation.isPending}
      />
    </div>
  );
}
