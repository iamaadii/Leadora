import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useLead, useUpdateLead, useArchiveLead, useRestoreLead, useAssignees } from '../hooks/useLeads.js';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { LeadStatusBadge } from '../components/LeadStatusBadge.jsx';
import { LeadActivityTimeline } from '../components/LeadActivityTimeline.jsx';
import { LeadForm } from '../components/LeadForm.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { useToast } from '../../../components/ui/Toast.jsx';
import { LEAD_STATUSES } from '../leads.constants.js';
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
} from 'lucide-react';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown.jsx';

export function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: leadData, isLoading, error } = useLead(id);
  const { data: assigneesData } = useAssignees();

  const updateLeadMutation = useUpdateLead();
  const archiveLeadMutation = useArchiveLead();
  const restoreLeadMutation = useRestoreLead();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const lead = leadData?.data;
  const assignees = assigneesData?.data || [];
  const userRole = user?.role || 'EMPLOYEE';
  const canArchive = userRole === 'ADMIN';

  const handleStatusChange = async (newStatus) => {
    if (!lead || lead.status === newStatus) return;

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

  const createdDate = new Date(lead.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedDate = new Date(lead.updated_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with Breadcrumb & Primary Actions */}
      <PageHeader
        title={lead.name}
        description={lead.company ? `Prospect at ${lead.company}` : 'Prospective customer'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: lead.name },
        ]}
        badge={<LeadStatusBadge status={lead.status} size="md" />}
        actions={
          <div className="flex items-center space-x-2">
            <Link to="/leads">
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This lead was archived on {new Date(lead.archived_at).toLocaleString()}. It is hidden from normal active pipelines.
            </span>
          </div>
          {canArchive && (
            <Button variant="outline" size="sm" onClick={handleRestore}>
              Restore Lead
            </Button>
          )}
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

        {/* Right Column: Activity History Timeline */}
        <div className="lg:col-span-2 space-y-6">
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
    </div>
  );
}
