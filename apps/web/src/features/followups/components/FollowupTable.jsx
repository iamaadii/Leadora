import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { formatDateTime, formatRelativeTime } from '../../../utils/dateTime.js';
import { FollowupTypeIcon, FollowupTypeLabel } from './FollowupTypeIcon.jsx';
import { FollowupStatusBadge } from './FollowupStatusBadge.jsx';
import { FollowupPriorityBadge } from './FollowupPriorityBadge.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import {
  CalendarClock,
  CheckCircle2,
  Edit2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Clock,
} from 'lucide-react';

export function FollowupTable({
  followups = [],
  isLoading = false,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  onCompleteClick,
  onEditClick,
  onCancelClick,
}) {
  const { organizationTimezone } = useAuth();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <EmptyState
          icon={CalendarClock}
          title="No follow-ups found"
          description="There are no scheduled follow-ups or tasks matching your current filters."
        />
      </div>
    );
  }

  const formatDueDate = (isoString) => {
    if (!isoString) return 'Not scheduled';
    return formatDateTime(isoString, organizationTimezone);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* Mobile View: Concise Clickable Cards (Progressive Disclosure) */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {followups.map((f) => {
          const isPending = f.status === 'PENDING';
          const isOverdue =
            isPending && f.due_at && new Date(f.due_at).getTime() < Date.now();
          const isExpanded = expandedId === f.id;
          const relativeTime = f.due_at ? formatRelativeTime(f.due_at) : null;

          return (
            <div
              key={f.id}
              className={`transition ${isOverdue ? 'bg-rose-50/20' : ''}`}
            >
              {/* Summary Row (Clickable) */}
              <div
                onClick={() => toggleExpand(f.id)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    <FollowupTypeIcon type={f.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {f.title}
                      </p>
                      <FollowupStatusBadge
                        status={f.status}
                        dueAt={f.due_at}
                        isOverdue={f.is_overdue}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 truncate">
                      <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {formatDueDate(f.due_at)}
                      </span>
                      {relativeTime && (
                        <>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-slate-400">{relativeTime}</span>
                        </>
                      )}
                      {f.lead_name && (
                        <>
                          <span className="text-slate-300">&bull;</span>
                          <span className="truncate text-blue-600 font-medium">
                            {f.lead_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </div>

              {/* Expanded Detail Panel (Progressive Disclosure on Click) */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-3 bg-slate-50/70 border-t border-slate-100/80 animate-in fade-in duration-150">
                  {f.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
                      {f.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Priority & Type
                      </span>
                      <div className="mt-1 flex items-center space-x-1.5">
                        <FollowupPriorityBadge priority={f.priority} />
                        <span className="text-[11px] text-slate-600">
                          <FollowupTypeLabel type={f.type} />
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Assigned To
                      </span>
                      <div className="mt-1 flex items-center space-x-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {f.assigned_to_first_name
                            ? `${f.assigned_to_first_name} ${f.assigned_to_last_name || ''}`
                            : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {f.lead_id && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Link
                        to={`/leads/${f.lead_id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 font-bold hover:underline"
                      >
                        <span>View Lead: {f.lead_name || 'Details'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {f.completion_notes && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="font-bold">Outcome:</span> {f.completion_notes}
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  {isPending && (
                    <div className="flex items-center space-x-2 pt-1">
                      <Button
                        size="xs"
                        variant="primary"
                        leftIcon={CheckCircle2}
                        onClick={() => onCompleteClick(f)}
                        className="flex-1"
                      >
                        Complete
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={Edit2}
                        onClick={() => onEditClick(f)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={XCircle}
                        onClick={() => onCancelClick(f)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Desktop View: Semantic Paired Columns (Fits Laptop Screens)   */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-[36%]">Task & Related Lead</th>
              <th className="py-3 px-4 w-[22%]">Schedule & Timing</th>
              <th className="py-3 px-4 w-[18%]">Status & Priority</th>
              <th className="py-3 px-4 w-[14%]">Assigned Rep</th>
              <th className="py-3 px-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {followups.map((f) => {
              const isPending = f.status === 'PENDING';
              const isOverdue =
                isPending && f.due_at && new Date(f.due_at).getTime() < Date.now();
              const relativeTime = f.due_at ? formatRelativeTime(f.due_at) : null;
              const assignedName = f.assigned_to_first_name
                ? `${f.assigned_to_first_name} ${f.assigned_to_last_name || ''}`
                : 'Unassigned';

              return (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50/70 transition group ${
                    isOverdue ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Col 1: Task & Related Lead */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          <FollowupTypeIcon type={f.type} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm truncate max-w-sm">
                          {f.title}
                        </span>
                      </div>
                      {f.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md pl-6">
                          {f.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-1.5 text-[11px] text-blue-600 font-medium pl-6">
                        {f.lead_id ? (
                          <Link
                            to={`/leads/${f.lead_id}`}
                            className="hover:underline flex items-center space-x-1"
                          >
                            <span>{f.lead_name || 'View Lead'}</span>
                            <ExternalLink className="w-3 h-3 inline text-slate-400" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">No lead attached</span>
                        )}
                        {f.lead_company && (
                          <span className="text-slate-400">· {f.lead_company}</span>
                        )}
                        {f.completion_notes && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 text-[10px]">
                            Outcome: {f.completion_notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Col 2: Schedule & Timing */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span
                        className={`font-semibold block text-xs ${
                          isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {formatDueDate(f.due_at)}
                      </span>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{relativeTime || '—'}</span>
                        {isOverdue && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded text-[10px]">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Col 3: Status & Priority */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div>
                        <FollowupStatusBadge
                          status={f.status}
                          dueAt={f.due_at}
                          isOverdue={f.is_overdue}
                        />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <FollowupPriorityBadge priority={f.priority} />
                        <span className="text-[11px] text-slate-400 capitalize">
                          {f.type?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Col 4: Assigned Rep */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        firstName={f.assigned_to_first_name || 'U'}
                        lastName={f.assigned_to_last_name || 'U'}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <span className="text-slate-800 font-semibold truncate block max-w-[120px]">
                          {assignedName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Assigned Rep
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Col 5: Actions (Right-aligned) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isPending ? (
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          title="Complete Follow-up"
                          onClick={() => onCompleteClick(f)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Edit or Reschedule"
                          onClick={() => onEditClick(f)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Cancel Follow-up"
                          onClick={() => onCancelClick(f)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Archived</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Showing page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({total} follow-ups)
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              leftIcon={ChevronLeft}
              className="flex-1 sm:flex-none justify-center"
            >
              Previous
            </Button>
            <span className="px-2 font-semibold text-slate-700 shrink-0 text-center">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              rightIcon={ChevronRight}
              className="flex-1 sm:flex-none justify-center"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
