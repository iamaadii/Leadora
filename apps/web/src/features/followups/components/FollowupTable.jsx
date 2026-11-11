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
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown.jsx';
import {
  CalendarClock,
  CheckCircle2,
  Edit2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  MoreVertical,
  AlertTriangle,
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
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Mobile Skeleton */}
        <div className="sm:hidden divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden sm:block">
          <div className="p-4 bg-slate-50/75 border-b border-slate-200 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between space-x-4">
                <div className="w-[36%] flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="w-[22%] space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="w-[18%] space-y-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="w-[14%] flex items-center space-x-2">
                  <Skeleton variant="circular" className="w-6 h-6 shrink-0" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="w-[10%] flex justify-end space-x-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* Mobile View (<768px): 3-Tier Ergonomic Smart Cards            */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {followups.map((f, idx) => {
          const isPending = f.status === 'PENDING';
          const isOverdue =
            isPending && f.due_at && new Date(f.due_at).getTime() < Date.now();
          const isExpanded = expandedId === f.id;
          const relativeTime = f.due_at ? formatRelativeTime(f.due_at) : null;
          const assignedName = f.assigned_to_first_name
            ? `${f.assigned_to_first_name} ${f.assigned_to_last_name || ''}`
            : 'Unassigned';

          return (
            <div
              key={f.id}
              className={`p-4 space-y-3 transition ${
                isOverdue ? 'bg-rose-50/25 border-l-4 border-rose-500' : ''
              }`}
            >
              {/* Tier 1: Task Header & Status */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FollowupTypeIcon type={f.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {f.title}
                    </p>

                    {f.lead_id && (
                      <div className="flex items-center space-x-1 mt-0.5 text-xs text-blue-600 font-medium truncate">
                        <Link
                          to={`/leads/${f.lead_id}`}
                          className="hover:underline truncate inline-flex items-center gap-1"
                        >
                          <span>{f.lead_name || 'View Lead'}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                        </Link>
                        {f.lead_company && (
                          <span className="text-slate-400 truncate">
                            · {f.lead_company}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <FollowupStatusBadge
                    status={f.status}
                    dueAt={f.due_at}
                    isOverdue={f.is_overdue}
                  />
                  {isOverdue && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>OVERDUE</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Tier 2: Micro-Metric Strip (Schedule | Priority | Assigned) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Scheduled
                  </span>
                  <span
                    className={`text-xs font-semibold mt-1 block truncate ${
                      isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {relativeTime || 'Not set'}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Priority
                  </span>
                  <div className="mt-1">
                    <FollowupPriorityBadge priority={f.priority} size="xs" />
                  </div>
                </div>

                <div className="min-w-0 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Assigned
                  </span>
                  <span className="text-xs font-medium text-slate-700 mt-1 block truncate">
                    {assignedName}
                  </span>
                </div>
              </div>

              {/* Expandable Notes Preview */}
              {f.description && (
                <div className="text-xs text-slate-600 bg-slate-50/60 p-2 rounded-lg border border-slate-100 leading-relaxed">
                  <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {f.description}
                  </p>
                  {f.description.length > 90 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(f.id)}
                      className="text-blue-600 font-semibold text-[11px] mt-1 hover:underline cursor-pointer block"
                    >
                      {isExpanded ? 'Show less' : 'Read full notes'}
                    </button>
                  )}
                </div>
              )}

              {/* Outcome if already completed */}
              {f.completion_notes && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold">Outcome:</span> {f.completion_notes}
                </div>
              )}

              {/* Tier 3: Ergonomic Touch Strip (1-Tap Completion on Mobile) */}
              {isPending && (
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onCompleteClick(f)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-2xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Complete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditClick(f)}
                    className="inline-flex items-center justify-center gap-1 py-2.5 px-3.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Edit</span>
                  </button>

                  <Dropdown
                    align="right"
                    direction={idx >= followups.length - 2 ? 'up' : 'auto'}
                    trigger={
                      <button
                        type="button"
                        className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    {f.lead_id && (
                      <DropdownItem
                        icon={ExternalLink}
                        onClick={() => window.open(`/leads/${f.lead_id}`, '_self')}
                      >
                        Open Lead Profile
                      </DropdownItem>
                    )}
                    <DropdownItem
                      icon={XCircle}
                      danger
                      onClick={() => onCancelClick(f)}
                    >
                      Cancel Follow-up
                    </DropdownItem>
                  </Dropdown>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Desktop / Laptop View (≥768px): Sticky Header, Paired Cols    */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          {/* Sticky Table Header with Backdrop Blur */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[36%]">Task & Related Lead</th>
              <th className="py-3.5 px-4 w-[22%]">Schedule & Urgency</th>
              <th className="py-3.5 px-4 w-[18%]">Status & Priority</th>
              <th className="py-3.5 px-4 w-[14%]">Assigned Rep</th>
              <th className="py-3.5 px-4 w-[10%] text-right">Actions</th>
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
                  className={`hover:bg-slate-50/70 border-l-2 transition-all group ${
                    isOverdue
                      ? 'bg-rose-50/20 border-rose-500 hover:border-rose-600'
                      : 'border-transparent hover:border-blue-600'
                  }`}
                >
                  {/* Col 1: Task & Related Lead */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FollowupTypeIcon type={f.type} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm truncate max-w-sm">
                          {f.title}
                        </span>
                      </div>

                      {f.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md pl-8">
                          {f.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-1.5 text-[11px] pl-8">
                        {f.lead_id ? (
                          <Link
                            to={`/leads/${f.lead_id}`}
                            className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>{f.lead_name || 'View Lead'}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">No lead attached</span>
                        )}

                        {f.lead_company && (
                          <span className="text-slate-400 font-normal">
                            · {f.lead_company}
                          </span>
                        )}

                        {f.completion_notes && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 text-[10px]">
                            Outcome: {f.completion_notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Col 2: Schedule & Urgency */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span
                        className={`font-semibold block text-xs ${
                          isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {formatDueDate(f.due_at)}
                      </span>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono">{relativeTime || '—'}</span>
                        {isOverdue && (
                          <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.2 rounded text-[10px]">
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
                        <FollowupPriorityBadge priority={f.priority} size="xs" />
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
