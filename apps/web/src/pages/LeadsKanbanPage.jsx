import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useRestoreLead,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  const userRole = isDemo ? 'DEMO' : user?.role || 'EMPLOYEE';
  const canViewAll = userRole === 'ADMIN' || userRole === 'MANAGER' || isDemo;

  // Sync filters from URL search params
  const filters = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      source: searchParams.get('source') || '',
      assigned_to_id: searchParams.get('assigned_to_id') || '',
      isArchived: searchParams.get('isArchived') === 'true',
      limit: 100, // Load comprehensive batch for Kanban board
    };
  }, [searchParams]);

  // Clean params for backend API call
  const apiParams = useMemo(() => {
    const params = { page: 1, limit: filters.limit };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.assigned_to_id) params.assigned_to_id = filters.assigned_to_id;
    if (filters.isArchived) params.isArchived = 'true';
    return params;
  }, [filters]);

  const { data, isLoading } = useLeads(apiParams);
  const { data: assigneesData } = useAssignees();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const restoreLeadMutation = useRestoreLead();

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value === null || value === undefined || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleStatusChange = async (leadId, newStatus, additionalData = {}) => {
    if (filters.isArchived) {
      toast.warning('Archived leads cannot change stage');
      return;
    }
    await updateLeadMutation.mutateAsync({
      id: leadId,
      data: { status: newStatus, ...additionalData },
    });
  };

  const handleRestore = async (lead) => {
    if (isDemo) {
      toast.warning('Changes are disabled in Demo Mode');
      return;
    }
    try {
      await restoreLeadMutation.mutateAsync(lead.id);
      toast.success(`Lead "${lead.name}" restored`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore lead');
    }
  };

  const handleCreateSubmit = async (payload) => {
    if (isDemo) {
      toast.warning('Changes are disabled in Demo Mode');
      setIsCreateModalOpen(false);
      return;
    }
    try {
      const res = await createLeadMutation.mutateAsync(payload);
      toast.success(`Lead "${res.data.name}" created`);
      setIsCreateModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to create lead';
      toast.error(msg);
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
          { label: 'Dashboard', href: isDemo ? '/demo' : '/dashboard' },
          { label: 'Leads', href: isDemo ? '/demo/leads' : '/leads' },
          { label: 'Kanban Board' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <Button
                variant="ghost"
                size="xs"
                leftIcon={Table}
                onClick={() => navigate(isDemo ? `/demo/leads?${searchParams.toString()}` : `/leads?${searchParams.toString()}`)}
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center text-slate-400 text-sm">
          Loading pipeline board...
        </div>
      ) : (
        <LeadKanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          isUpdating={updateLeadMutation.isPending}
          isArchived={filters.isArchived}
          onRestoreLead={handleRestore}
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
