import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useLead, useUpdateLead, useArchiveLead, useRestoreLead, useAssignees } from '../hooks/useLeads.js';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { LeadStatusBadge } from '../components/LeadStatusBadge.jsx';
import { LeadPriorityBadge } from '../components/LeadPriorityBadge.jsx';
import { MarkLeadAsLostModal } from '../components/MarkLeadAsLostModal.jsx';
import { LeadActivityTimeline } from '../components/LeadActivityTimeline.jsx';
import { LeadForm } from '../components/LeadForm.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { useToast } from '../../../components/ui/Toast.jsx';
import { LEAD_STATUSES } from '../leads.constants.js';
import { formatCurrency } from '../../../utils/currency.js';
import { formatDate, formatDateTime } from '../../../utils/dateTime.js';
import {
  useLeadFollowups,
  useCreateFollowup,
  useCompleteFollowup,
  useCancelFollowup,
} from '../../followups/hooks/useFollowups.js';
import { CreateFollowupModal } from '../../followups/components/CreateFollowupModal.jsx';
import { CompleteFollowupModal } from '../../followups/components/CompleteFollowupModal.jsx';
import { FollowupTypeIcon } from '../../followups/components/FollowupTypeIcon.jsx';
import { FollowupStatusBadge } from '../../followups/components/FollowupStatusBadge.jsx';
import { FollowupPriorityBadge } from '../../followups/components/FollowupPriorityBadge.jsx';
import {
  Mail,
  Phone,
  Building,
  User,
  Calendar,
  Edit2,
  Archive,
  RotateCcw,
  Activity,
  ArrowLeft,
  ChevronDown,
  CalendarClock,
  CheckCircle2,
  Plus,
  XCircle,
  DollarSign,
  Flame,
  AlertOctagon,
} from 'lucide-react';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown.jsx';

export function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organizationCurrency, organizationTimezone } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  const { data: leadData, isLoading, error } = useLead(id);
  const { data: assigneesData } = useAssignees();

  const updateLeadMutation = useUpdateLead();
  const archiveLeadMutation = useArchiveLead();
  const restoreLeadMutation = useRestoreLead();

  // Follow-ups (Phase 7)
  const { data: followupsData, isLoading: isFollowupsLoading } = useLeadFollowups(id);
  const createFollowupMutation = useCreateFollowup();
  const completeFollowupMutation = useCompleteFollowup();
  const cancelFollowupMutation = useCancelFollowup();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isScheduleFollowupOpen, setIsScheduleFollowupOpen] = useState(false);
  const [completingFollowup, setCompletingFollowup] = useState(null);
  const [cancellingFollowup, setCancellingFollowup] = useState(null);
  const [isMarkLostOpen, setIsMarkLostOpen] = useState(false);
  const [isSubmittingLoss, setIsSubmittingLoss] = useState(false);

  const lead = leadData?.data;
  const leadFollowups = followupsData?.data || [];
  const assignees = assigneesData?.data || [];
  const userRole = user?.role || 'EMPLOYEE';
  const canArchive = userRole === 'ADMIN';

  const handleCreateFollowup = async (payload) => {
    try {
      await createFollowupMutation.mutateAsync(payload);
      toast.success('Follow-up task scheduled successfully');
      setIsScheduleFollowupOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to schedule follow-up',
        'Scheduling Error',
      );
    }
  };

  const handleCompleteFollowup = async (notes) => {
    try {
      await completeFollowupMutation.mutateAsync({
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

  const handleCancelFollowup = async () => {
    try {
      await cancelFollowupMutation.mutateAsync(cancellingFollowup.id);
      toast.success('Follow-up task was cancelled');
      setCancellingFollowup(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to cancel follow-up',
        'Cancellation Error',
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!lead || lead.status === newStatus) return;

    if (newStatus === 'LOST') {
      setIsMarkLostOpen(true);
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        data: { status: newStatus },
      });
      toast.success(`Lead moved to "${newStatus.replace(/_/g, ' ')}" status`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to update status',
        'Update Failed',
      );
    }
  };

  const handleConfirmLost = async (lossData) => {
    if (!lead) return;
    setIsSubmittingLoss(true);
    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        data: { status: 'LOST', ...lossData },
      });
      toast.success('Lead marked as Lost');
      setIsMarkLostOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to update status',
        'Update Failed',
      );
    } finally {
      setIsSubmittingLoss(false);
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        data: payload,
      });
      toast.success('Lead updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to update lead',
        'Update Error',
      );
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      await archiveLeadMutation.mutateAsync(lead.id);
      toast.success('Lead archived successfully');
      setIsArchiveConfirmOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to archive lead',
        'Archive Error',
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restoreLeadMutation.mutateAsync(lead.id);
      toast.success('Lead restored to active pipeline');
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to restore lead',
        'Restore Error',
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="py-12">
        <ErrorState
          title="Lead Not Found"
          description="The requested lead does not exist, was removed, or you do not have permission to view it."
          onRetry={() => navigate('/leads')}
        />
      </div>
    );
  }

  const assignedName = lead.assigned_to_first_name
    ? `${lead.assigned_to_first_name} ${lead.assigned_to_last_name}`
    : 'Unassigned';

  const creatorName = lead.created_by_first_name
    ? `${lead.created_by_first_name} ${lead.created_by_last_name}`
    : 'System';

  const createdDate = formatDate(lead.created_at, organizationTimezone);
  const updatedDate = formatDateTime(lead.updated_at, organizationTimezone);

  return (
    <div className="space-y-6 w-full">
      {/* Header with Breadcrumb & Primary Actions */}
      <PageHeader
        title={lead.name}
        description={lead.company ? `Prospect at ${lead.company}` : 'Prospective customer'}
        breadcrumbs={[
          { label: 'Dashboard', href: isDemo ? '/demo' : '/dashboard' },
          { label: 'Leads', href: isDemo ? '/demo/leads' : '/leads' },
          { label: lead.name },
        ]}
        badge={
          <div className="flex items-center space-x-2">
            <LeadStatusBadge status={lead.status} size="md" />
            {lead.priority && (
              <LeadPriorityBadge priority={lead.priority} size="md" />
            )}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={isDemo ? '/demo/leads' : '/leads'}>
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Leads
              </Button>
            </Link>

            {/* Quick Status Dropdown */}
            <Dropdown
              align="right"
              trigger={() => (
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={ChevronDown}
                  isLoading={updateLeadMutation.isPending}
                >
                  Stage: {lead.status.replace(/_/g, ' ')}
                </Button>
              )}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Change Status
              </div>
              {LEAD_STATUSES.map((st) => (
                <DropdownItem
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={st === lead.status ? 'bg-blue-50 text-blue-700 font-bold' : ''}
                >
                  {st.replace(/_/g, ' ')}
                </DropdownItem>
              ))}
            </Dropdown>

            <Button
              variant="outline"
              size="sm"
              leftIcon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>

            {canArchive && !lead.archived_at && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Archive}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => setIsArchiveConfirmOpen(true)}
              >
                Archive
              </Button>
            )}

            {canArchive && lead.archived_at && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={RotateCcw}
                onClick={handleRestore}
                isLoading={restoreLeadMutation.isPending}
              >
                Restore
              </Button>
            )}
          </div>
        }
      />

      {/* Archived Alert Banner */}
      {lead.archived_at && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This lead was archived on {formatDate(lead.archived_at, organizationTimezone)}. It is hidden from normal active pipelines.
            </span>
          </div>
          {canArchive && (
            <Button variant="outline" size="sm" onClick={handleRestore}>
              Restore Lead
            </Button>
          )}
        </div>
      )}

      {/* Lost Lead Notice Banner */}
      {lead.status === 'LOST' && (
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-rose-950 text-sm">Deal Marked as Lost</h4>
              <span className="text-[11px] text-rose-600 font-medium">
                {formatDate(lead.updated_at, organizationTimezone)}
              </span>
            </div>
            <p className="text-rose-800">
              <strong>Recorded Loss Reason:</strong> {lead.loss_reason || 'Legacy record (no reason recorded)'}
            </p>
            {lead.loss_notes && (
              <p className="text-rose-700 text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-200/60 mt-1 whitespace-pre-wrap">
                {lead.loss_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Lead Details Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <Avatar name={lead.name} size="lg" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{lead.name}</h3>
                <p className="text-xs text-slate-500 truncate">{lead.company || 'Individual Client'}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline font-medium truncate block"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-slate-800 hover:underline font-medium"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Estimated Deal Value</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {formatCurrency(lead.estimated_value, organizationCurrency)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Flame className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Deal Priority</span>
                  <div className="mt-0.5">
                    <LeadPriorityBadge priority={lead.priority} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Company / Organization</span>
                  <span className="font-medium text-slate-800">
                    {lead.company || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Representative</span>
                  <span className="font-semibold text-slate-900">{assignedName}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Lead Source</span>
                  <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/60">
                    {lead.source}
                  </span>
                </div>
              </div>
            </div>

            {/* Description / Notes */}
            {lead.description && (
              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-700">Notes & Qualification</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                  {lead.description}
                </p>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Created by:</span>
                <span className="font-medium text-slate-600">{creatorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created on:</span>
                <span className="text-slate-600">{createdDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last updated:</span>
                <span className="text-slate-600">{updatedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity History Timeline & Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Follow-ups Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Scheduled Follow-ups</h3>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                  {leadFollowups.filter((f) => f.status === 'PENDING').length} pending
                </span>
              </div>
              <Button
                size="xs"
                variant="outline"
                leftIcon={Plus}
                onClick={() => setIsScheduleFollowupOpen(true)}
              >
                Schedule Follow-up
              </Button>
            </div>

            {isFollowupsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : leadFollowups.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <p className="text-xs text-slate-500">No follow-ups scheduled for this lead.</p>
                <Button
                  size="xs"
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => setIsScheduleFollowupOpen(true)}
                >
                  Schedule Initial Follow-up
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {leadFollowups.map((f) => {
                  const isPending = f.status === 'PENDING';
                  const isOverdue =
                    isPending && f.due_at && new Date(f.due_at).getTime() < Date.now();

                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isOverdue
                          ? 'bg-rose-50/30 border-rose-200'
                          : f.status === 'COMPLETED'
                          ? 'bg-slate-50/60 border-slate-200/60 opacity-80'
                          : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                          <FollowupTypeIcon type={f.type} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-900">{f.title}</span>
                            <FollowupPriorityBadge priority={f.priority} />
                            <FollowupStatusBadge
                              status={f.status}
                              dueAt={f.due_at}
                              isOverdue={f.is_overdue}
                            />
                          </div>
                          {f.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{f.description}</p>
                          )}
                          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                            <span>Due: {new Date(f.due_at).toLocaleString()}</span>
                            <span>·</span>
                            <span>Assigned: {f.assigned_to_first_name ? `${f.assigned_to_first_name} ${f.assigned_to_last_name}` : 'Unassigned'}</span>
                          </div>
                          {f.completion_notes && (
                            <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Outcome: {f.completion_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={CheckCircle2}
                            onClick={() => setCompletingFollowup(f)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            Complete
                          </Button>
                          <button
                            type="button"
                            title="Cancel Follow-up"
                            onClick={() => setCancellingFollowup(f)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Activity History & Audit</h3>
              </div>
              <span className="text-xs text-slate-400">
                {lead.recent_activities?.length || 0} event(s) logged
              </span>
            </div>

            <LeadActivityTimeline
              activities={lead.recent_activities || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      <LeadForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={lead}
        onSubmit={handleEditSubmit}
        isLoading={updateLeadMutation.isPending}
        assignees={assignees}
        userRole={userRole}
        currentUserId={user?.id}
      />

      {/* Schedule Follow-up Modal */}
      <CreateFollowupModal
        isOpen={isScheduleFollowupOpen}
        onClose={() => setIsScheduleFollowupOpen(false)}
        defaultLeadId={lead.id}
        defaultLeadName={lead.name}
        leads={[]}
        assignees={assignees}
        userRole={userRole}
        currentUserId={user?.id}
        onSubmit={handleCreateFollowup}
        isLoading={createFollowupMutation.isPending}
      />

      {/* Complete Follow-up Modal */}
      <CompleteFollowupModal
        isOpen={Boolean(completingFollowup)}
        onClose={() => setCompletingFollowup(null)}
        followup={completingFollowup}
        onComplete={handleCompleteFollowup}
        isLoading={completeFollowupMutation.isPending}
      />

      {/* Cancel Follow-up Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(cancellingFollowup)}
        onClose={() => setCancellingFollowup(null)}
        onConfirm={handleCancelFollowup}
        title="Cancel Follow-up"
        message={`Are you sure you want to cancel the scheduled task "${cancellingFollowup?.title}"?`}
        confirmText="Cancel Task"
        isDestructive
        isLoading={cancelFollowupMutation.isPending}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        onConfirm={handleArchiveConfirm}
        title="Archive Lead"
        message={`Are you sure you want to archive "${lead.name}"? This removes the lead from active sales views, but preserves all historical data and activities.`}
        confirmText="Archive Lead"
        isDestructive
        isLoading={archiveLeadMutation.isPending}
      />

      {/* Mandatory Loss Reason Modal */}
      <MarkLeadAsLostModal
        isOpen={isMarkLostOpen}
        onClose={() => setIsMarkLostOpen(false)}
        onConfirm={handleConfirmLost}
        leadName={lead.name}
        isLoading={isSubmittingLoss}
      />
    </div>
  );
}
