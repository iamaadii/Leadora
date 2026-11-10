import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useArchiveLead,
  useRestoreLead,
  useAssignees,
} from '../hooks/useLeads.js';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { LeadTable } from '../components/LeadTable.jsx';
import { LeadKanbanBoard } from '../components/LeadKanbanBoard.jsx';
import { LeadFilters } from '../components/LeadFilters.jsx';
import { LeadForm } from '../components/LeadForm.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { useToast } from '../../../components/ui/Toast.jsx';
import { Plus, LayoutGrid, Table } from 'lucide-react';

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  const userRole = isDemo ? 'DEMO' : user?.role || 'EMPLOYEE';
  const canArchive = userRole === 'ADMIN';
  const canViewAll = userRole === 'ADMIN' || userRole === 'MANAGER' || isDemo;

  const viewMode = searchParams.get('view') === 'kanban' ? 'kanban' : 'table';

  // Parse filters from URL search params
  const filters = useMemo(() => {
    return {
      view: searchParams.get('view') || 'table',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: searchParams.get('view') === 'kanban' ? 100 : parseInt(searchParams.get('limit') || '10', 10),
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      source: searchParams.get('source') || '',
      assigned_to_id: searchParams.get('assigned_to_id') || '',
      isArchived: searchParams.get('isArchived') === 'true',
    };
  }, [searchParams]);

  // Clean params for backend API call (remove empty strings)
  const apiParams = useMemo(() => {
    const params = {
      page: filters.view === 'kanban' ? 1 : filters.page,
      limit: filters.view === 'kanban' ? 100 : filters.limit,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.assigned_to_id) params.assigned_to_id = filters.assigned_to_id;
    if (filters.isArchived) params.isArchived = 'true';
    return params;
  }, [filters]);

  const { data, isLoading, error, refetch } = useLeads(apiParams);
  const { data: assigneesData } = useAssignees();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const archiveLeadMutation = useArchiveLead();
  const restoreLeadMutation = useRestoreLead();

  const handleStatusChange = async (leadId, newStatus, additionalData = {}) => {
    if (filters.isArchived) {
      toast.warning('Stage updates are disabled on archived leads. Restore the lead first to make changes.');
      return;
    }
    await updateLeadMutation.mutateAsync({
      id: leadId,
      data: { status: newStatus, ...additionalData },
    });
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [archivingLead, setArchivingLead] = useState(null);

  // Update query params in URL
  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === null || value === undefined || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        // Reset to page 1 whenever filters change (except page itself)
        if (key !== 'page') {
          next.set('page', '1');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handlePageChange = (newPage) => {
    updateFilter('page', newPage);
  };

  // Actions
  const handleView = (leadId) => {
    navigate(isDemo ? `/demo/leads/${leadId}` : `/leads/${leadId}`);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
  };

  const handleCreateSubmit = async (payload) => {
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      setIsCreateModalOpen(false);
      return;
    }
    try {
      const res = await createLeadMutation.mutateAsync(payload);
      toast.success(`Lead "${res.data.name}" created successfully`);
      setIsCreateModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to create lead. Please verify inputs.';
      toast.error(msg, 'Creation Error');
    }
  };

  const handleEditSubmit = async (payload) => {
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      setEditingLead(null);
      return;
    }
    try {
      await updateLeadMutation.mutateAsync({
        id: editingLead.id,
        data: payload,
      });
      toast.success('Lead updated successfully');
      setEditingLead(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to update lead.';
      toast.error(msg, 'Update Error');
    }
  };

  const handleArchive = (lead) => {
    setArchivingLead(lead);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingLead) return;
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      setArchivingLead(null);
      return;
    }
    try {
      await archiveLeadMutation.mutateAsync(archivingLead.id);
      toast.success(`Lead "${archivingLead.name}" has been archived.`);
      setArchivingLead(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to archive lead',
        'Archive Error',
      );
    }
  };

  const handleRestore = async (lead) => {
    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      return;
    }
    try {
      await restoreLeadMutation.mutateAsync(lead.id);
      toast.success(`Lead "${lead.name}" restored to active status.`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to restore lead',
        'Restore Error',
      );
    }
  };

  const leads = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const assignees = assigneesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header with New Lead Button */}
      <PageHeader
        title="Leads & Pipeline"
        description="Capture, qualify, assign, and advance customer opportunities across your sales pipeline."
        breadcrumbs={[
          { label: 'Dashboard', href: isDemo ? '/demo' : '/dashboard' },
          { label: 'Leads' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <Button
                variant={viewMode === 'table' ? 'primary' : 'ghost'}
                size="xs"
                leftIcon={Table}
                onClick={() => updateFilter('view', 'table')}
                className={viewMode === 'table' ? 'shadow-xs' : 'text-slate-600 hover:text-slate-900'}
              >
                Table View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                size="xs"
                leftIcon={LayoutGrid}
                onClick={() => updateFilter('view', 'kanban')}
                className={viewMode === 'kanban' ? 'shadow-xs' : 'text-slate-600 hover:text-slate-900'}
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

      {/* Error state if query fails */}
      {error ? (
        <div className="py-8">
          <ErrorState
            title="Failed to Load Leads"
            description={
              error.response?.data?.message ||
              error.message ||
              'Could not connect to the backend server to retrieve leads.'
            }
            onRetry={refetch}
          />
        </div>
      ) : viewMode === 'kanban' ? (
        <LeadKanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          isUpdating={updateLeadMutation.isPending}
          isArchived={filters.isArchived}
          onRestoreLead={handleRestore}
        />
      ) : (
        /* Leads Table */
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
          canArchive={canArchive}
          isArchivedView={filters.isArchived}
        />
      )}

      {/* Create Lead Modal */}
      <LeadForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createLeadMutation.isPending}
        assignees={assignees}
        userRole={userRole}
        currentUserId={user?.id}
      />

      {/* Edit Lead Modal */}
      <LeadForm
        isOpen={Boolean(editingLead)}
        onClose={() => setEditingLead(null)}
        initialData={editingLead}
        onSubmit={handleEditSubmit}
        isLoading={updateLeadMutation.isPending}
        assignees={assignees}
        userRole={userRole}
        currentUserId={user?.id}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(archivingLead)}
        onClose={() => setArchivingLead(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive Lead"
        message={`Are you sure you want to archive "${archivingLead?.name}"? It will be removed from your active leads list, but can be restored at any time.`}
        confirmText="Archive Lead"
        isDestructive
        isLoading={archiveLeadMutation.isPending}
      />
    </div>
  );
}

