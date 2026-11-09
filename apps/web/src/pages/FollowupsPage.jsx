import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  useFollowups,
  useFollowupSummary,
  useCreateFollowup,
  useUpdateFollowup,
  useCompleteFollowup,
  useCancelFollowup,
} from '../features/followups/hooks/useFollowups.js';
import { useLeads, useAssignees } from '../features/leads/hooks/useLeads.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { FollowupTable } from '../features/followups/components/FollowupTable.jsx';
import { CreateFollowupModal } from '../features/followups/components/CreateFollowupModal.jsx';
import { EditFollowupModal } from '../features/followups/components/EditFollowupModal.jsx';
import { CompleteFollowupModal } from '../features/followups/components/CompleteFollowupModal.jsx';
import {
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ListFilter,
  Search,
  RotateCcw,
} from 'lucide-react';

export function FollowupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [completingFollowup, setCompletingFollowup] = useState(null);
  const [cancellingFollowup, setCancellingFollowup] = useState(null);

  // Build query params
  const queryParams = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    type: typeFilter || undefined,
    priority: priorityFilter || undefined,
  };

  if (activeTab === 'OVERDUE') {
    queryParams.isOverdue = true;
    queryParams.status = 'PENDING';
  } else if (activeTab === 'DUE_TODAY') {
    queryParams.dueToday = true;
    queryParams.status = 'PENDING';
  } else if (activeTab !== 'ALL') {
    queryParams.status = activeTab;
  }

  // Queries
  const { data: followupsData, isLoading } = useFollowups(queryParams);
  const { data: summaryData } = useFollowupSummary();
  const { data: leadsData } = useLeads({ limit: 100 });
  const { data: assigneesData } = useAssignees();

  // Mutations
  const createMutation = useCreateFollowup();
  const updateMutation = useUpdateFollowup();
  const completeMutation = useCompleteFollowup();
  const cancelMutation = useCancelFollowup();

  const followups = followupsData?.data || [];
  const meta = followupsData?.meta || {};
  const summary = summaryData?.data || {
    total: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  };

  const leads = leadsData?.data || [];
  const assignees = assigneesData?.data || [];

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setPriorityFilter('');
    setActiveTab('PENDING');
    setPage(1);
  };

  const handleCreateSubmit = async (payload) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Follow-up task scheduled successfully');
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to schedule follow-up',
        'Scheduling Error',
      );
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      await updateMutation.mutateAsync({
        id: editingFollowup.id,
        data: payload,
      });
      toast.success('Follow-up task updated successfully');
      setEditingFollowup(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to update follow-up',
        'Update Error',
      );
    }
  };

  const handleCompleteSubmit = async (notes) => {
    try {
      await completeMutation.mutateAsync({
        id: completingFollowup.id,
        completionNotes: notes,
      });
      toast.success('Follow-up task marked as completed');
      setCompletingFollowup(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to complete follow-up',
        'Completion Error',
      );
    }
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelMutation.mutateAsync(cancellingFollowup.id);
      toast.success('Follow-up task was cancelled');
      setCancellingFollowup(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to cancel follow-up',
        'Cancellation Error',
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups & Task Scheduling"
        description="Never drop a lead. Plan and execute phone calls, emails, demos, and follow-up touchpoints."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Follow-ups' },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Schedule Follow-up
          </Button>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Overdue */}
        <div
          onClick={() => handleTabChange('OVERDUE')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeTab === 'OVERDUE'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{summary.overdue}</div>
          <p className="mt-1 text-[11px] text-slate-400">Needs immediate action</p>
        </div>

        {/* Due Today */}
        <div
          onClick={() => handleTabChange('DUE_TODAY')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeTab === 'DUE_TODAY'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Due Today</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{summary.dueToday || summary.due_today}</div>
          <p className="mt-1 text-[11px] text-slate-400">Scheduled for today</p>
        </div>

        {/* Pending Total */}
        <div
          onClick={() => handleTabChange('PENDING')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeTab === 'PENDING'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tasks</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.pending}</div>
          <p className="mt-1 text-[11px] text-slate-400">Open active tasks</p>
        </div>

        {/* Completed */}
        <div
          onClick={() => handleTabChange('COMPLETED')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{summary.completed}</div>
          <p className="mt-1 text-[11px] text-slate-400">Finished touchpoints</p>
        </div>

        {/* All Tasks */}
        <div
          onClick={() => handleTabChange('ALL')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeTab === 'ALL'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">All Tasks</span>
            <ListFilter className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{summary.total}</div>
          <p className="mt-1 text-[11px] text-slate-400">Total volume logged</p>
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'PENDING', label: 'Pending', count: summary.pending },
            { id: 'OVERDUE', label: 'Overdue', count: summary.overdue, isDanger: true },
            { id: 'DUE_TODAY', label: 'Due Today', count: summary.dueToday || summary.due_today },
            { id: 'COMPLETED', label: 'Completed', count: summary.completed },
            { id: 'CANCELLED', label: 'Cancelled', count: summary.cancelled },
            { id: 'ALL', label: 'All Tasks', count: summary.total },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  tab.isDanger && tab.count > 0
                    ? 'bg-rose-100 text-rose-700 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search by task title */}
          <div className="sm:col-span-2 relative">
            <Input
              placeholder="Search by task title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={Search}
            />
          </div>

          {/* Type filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Activity Types' },
                { value: 'CALL', label: 'Phone Call' },
                { value: 'EMAIL', label: 'Email Outreach' },
                { value: 'MEETING', label: 'Meeting / Demo' },
                { value: 'TASK', label: 'General Task' },
              ]}
            />
          </div>

          {/* Priority filter & reset */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'MEDIUM', label: 'Medium Priority' },
                  { value: 'LOW', label: 'Low Priority' },
                ]}
              />
            </div>
            {(search || typeFilter || priorityFilter || activeTab !== 'PENDING') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <FollowupTable
        followups={followups}
        isLoading={isLoading}
        page={meta.page || 1}
        totalPages={meta.totalPages || 1}
        total={meta.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onCompleteClick={(f) => setCompletingFollowup(f)}
        onEditClick={(f) => setEditingFollowup(f)}
        onCancelClick={(f) => setCancellingFollowup(f)}
      />

      {/* Schedule Followup Modal */}
      <CreateFollowupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        leads={leads}
        assignees={assignees}
        userRole={user?.role}
        currentUserId={user?.id}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Followup Modal */}
      <EditFollowupModal
        isOpen={Boolean(editingFollowup)}
        onClose={() => setEditingFollowup(null)}
        followup={editingFollowup}
        assignees={assignees}
        userRole={user?.role}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      {/* Complete Followup Modal */}
      <CompleteFollowupModal
        isOpen={Boolean(completingFollowup)}
        onClose={() => setCompletingFollowup(null)}
        followup={completingFollowup}
        onComplete={handleCompleteSubmit}
        isLoading={completeMutation.isPending}
      />

      {/* Cancellation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(cancellingFollowup)}
        onClose={() => setCancellingFollowup(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Follow-up Task"
        message={`Are you sure you want to cancel the scheduled task "${cancellingFollowup?.title}"? This cannot be undone.`}
        confirmText="Cancel Task"
        isDestructive
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
