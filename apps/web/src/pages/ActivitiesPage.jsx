import React, { useState, useEffect } from 'react';
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
  Filter,
  RotateCcw,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useActivities } from '../features/activities/hooks/useActivities.js';
import { useEmployees } from '../features/employees/hooks/useEmployees.js';
import { formatDateTime } from '../utils/dateTime.js';

export function ActivitiesPage() {
  const { user, organizationTimezone } = useAuth();
  const { toast } = useToast();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  const [filterType, setFilterType] = useState('');
  const [actorId, setActorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch employees for actor filter dropdown
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employeesList = employeesData?.data || [];

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setDateError('Start date cannot be after end date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  const hasActiveFilters = Boolean(filterType || actorId || startDate || endDate);

  const handleResetFilters = () => {
    setFilterType('');
    setActorId('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    setPage(1);
  };

  const { data, isLoading, isFetching, refetch } = useActivities({
    type: filterType || undefined,
    actorId: actorId || undefined,
    startDate: startDate && !dateError ? `${startDate}T00:00:00.000Z` : undefined,
    endDate: endDate && !dateError ? `${endDate}T23:59:59.999Z` : undefined,
    page,
    limit: 20,
  });

  const handleRefresh = async () => {
    await refetch();
    toast.info('Activity stream updated');
  };

  const activities = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL_LOGGED':
      case 'CALL':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'EMAIL_SENT':
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'NOTE_ADDED':
      case 'NOTE':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'STATUS_CHANGED':
      case 'STATUS_CHANGE':
      case 'LEAD_STATUS_CHANGED':
        return <GitCommit className="w-4 h-4 text-purple-600" />;
      case 'FOLLOWUP_CREATED':
      case 'FOLLOWUP_UPDATED':
      case 'FOLLOWUP_RESCHEDULED':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'FOLLOWUP_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAD_CREATED':
      case 'LEAD_ASSIGNED':
      case 'LEAD_UPDATED':
      case 'LEAD_RESTORED':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatActivityDate = (timestamp) => {
    if (!timestamp) return '';
    return formatDateTime(timestamp, organizationTimezone);
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

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Filter Activity Stream
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Filters active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={RotateCcw}
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Activity Type</label>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full"
            >
              <option value="">All Activity Types</option>
              <option value="LEAD_STATUS_CHANGED">Stage Changes</option>
              <option value="LEAD_CREATED">Leads Created</option>
              <option value="LEAD_ASSIGNED">Leads Reassigned</option>
              <option value="FOLLOWUP_CREATED">Tasks Scheduled</option>
              <option value="FOLLOWUP_COMPLETED">Tasks Completed</option>
              <option value="CALL_LOGGED">Calls Logged</option>
              <option value="EMAIL_SENT">Emails Sent</option>
              <option value="NOTE_ADDED">Notes Added</option>
            </Select>
          </div>

          {/* Actor Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Actor / Rep</label>
            <Select
              value={actorId}
              onChange={(e) => {
                setActorId(e.target.value);
                setPage(1);
              }}
              className="w-full"
            >
              <option value="">All Team Members</option>
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.role})
                </option>
              ))}
            </Select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                if (endDate && val && val > endDate) {
                  setEndDate(val);
                }
                setDateError('');
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                const val = e.target.value;
                if (startDate && val && val < startDate) {
                  setEndDate(startDate);
                } else {
                  setEndDate(val);
                }
                setDateError('');
                setPage(1);
              }}
              className={`w-full px-3 py-2 text-xs bg-white border ${
                dateError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700`}
            />
          </div>
        </div>

        {dateError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}
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
              const actorName = act.actorName || act.actor_name || act.performed_by_name || act.user_name || 'System';
              const leadName = act.leadName || act.lead_name || 'Direct Contact';
              const leadId = act.leadId || act.lead_id;
              const description = act.description || act.details || '';
              const createdAt = act.createdAt || act.created_at;
              const isExpanded = expandedId === act.id;

              return (
                <div
                  key={act.id}
                  onClick={() => toggleExpand(act.id)}
                  className="p-3.5 sm:p-5 hover:bg-slate-50/70 transition flex items-start space-x-3 sm:space-x-3.5 cursor-pointer sm:cursor-default"
                >
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getActivityIcon(act.activityType || act.activity_type || act.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 min-w-0 flex-1">
                        <span className="inline-flex items-center space-x-1 font-bold text-slate-900">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{actorName}</span>
                        </span>

                        <span>•</span>
                        <span className="font-semibold text-slate-700 capitalize">
                          {(act.activityType || act.activity_type || act.type || 'activity').toLowerCase().replace(/_/g, ' ')}
                        </span>

                        {leadId && (
                          <>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <Link
                              to={isDemo ? `/demo/leads/${leadId}` : `/leads/${leadId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[140px] sm:max-w-none"
                            >
                              {leadName}
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Mobile Expand / Collapse Badge */}
                      {description && (
                        <div className="sm:hidden shrink-0 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center space-x-1">
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Description: Collapsed on mobile by default, expanded on click. Always visible on desktop. */}
                    {description && (
                      <div className={`${isExpanded ? 'block animate-in fade-in duration-150' : 'hidden sm:block'} pt-1 sm:pt-0`}>
                        <div
                          className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 max-w-2xl break-words"
                        >
                          {description}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-0.5">
                      {formatActivityDate(createdAt)}
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
