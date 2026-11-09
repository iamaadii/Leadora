import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  Activity,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Target,
  ArrowRight,
  GitCommit,
  Clock,
  User,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useActivities } from '../features/activities/hooks/useActivities.js';

export function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useActivities({
    type: filterType || undefined,
    page,
    limit: 20,
  });

  const handleRefresh = async () => {
    await refetch();
    toast.info('Activity stream updated.', 'Feed Refreshed');
  };

  const activities = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL_LOGGED':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'EMAIL_SENT':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'NOTE_ADDED':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'STATUS_CHANGED':
        return <GitCommit className="w-4 h-4 text-purple-600" />;
      case 'FOLLOWUP_CREATED':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'FOLLOWUP_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAD_CREATED':
      case 'LEAD_ASSIGNED':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatActivityDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Feed"
        description="Chronological log of customer interactions, stage changes, employee notes, and milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: isDemo ? '/demo' : '/dashboard' },
          { label: 'Activities' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={handleRefresh}
            isLoading={isFetching}
          >
            Refresh Feed
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter Timeline
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Showing interactions across your permissions scope</p>
        </div>
        <Select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-60"
        >
          <option value="">All Activity Types</option>
          <option value="STATUS_CHANGED">Stage Changes</option>
          <option value="NOTE_ADDED">Notes Added</option>
          <option value="CALL_LOGGED">Calls Logged</option>
          <option value="EMAIL_SENT">Emails Sent</option>
          <option value="FOLLOWUP_CREATED">Tasks Scheduled</option>
          <option value="FOLLOWUP_COMPLETED">Tasks Completed</option>
          <option value="LEAD_CREATED">Leads Created</option>
          <option value="LEAD_ASSIGNED">Leads Reassigned</option>
        </Select>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Activity}
              title="No recorded activities"
              description="Interaction history, pipeline changes, and sales notes will appear in this timeline as customer deals progress."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const actorName = act.performed_by_name || act.user_name || 'System';
              const leadName = act.lead_name || 'Direct Contact';
              const leadId = act.lead_id;

              return (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex items-start space-x-3.5"
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getActivityIcon(act.activity_type || act.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                      <span className="inline-flex items-center space-x-1 font-bold text-slate-900">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{actorName}</span>
                      </span>

                      <span>•</span>
                      <span className="font-semibold text-slate-700 capitalize">
                        {(act.activity_type || act.type || 'activity').toLowerCase().replace(/_/g, ' ')}
                      </span>

                      {leadId && (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <Link
                            to={isDemo ? `/demo/leads/${leadId}` : `/leads/${leadId}`}
                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {leadName}
                          </Link>
                        </>
                      )}
                    </div>

                    {act.details && (
                      <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 max-w-2xl break-words">
                        {act.details}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 pt-0.5">
                      {formatActivityDate(act.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} total activities)
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="xs"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
