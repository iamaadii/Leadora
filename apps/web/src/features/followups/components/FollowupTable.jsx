import React from 'react';
import { Link } from 'react-router-dom';
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
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
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
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Task & Lead</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Scheduled For</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {followups.map((f) => {
              const isPending = f.status === 'PENDING';
              const isOverdue =
                isPending && f.due_at && new Date(f.due_at).getTime() < Date.now();

              return (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50/60 transition ${
                    isOverdue ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Task & Lead */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <span>{f.title}</span>
                      </div>
                      {f.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {f.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 text-[11px] text-blue-600 font-medium">
                        <Link
                          to={`/leads/${f.lead_id}`}
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>{f.lead_name || 'View Lead'}</span>
                          <ExternalLink className="w-3 h-3 inline text-slate-400" />
                        </Link>
                        {f.lead_company && (
                          <span className="text-slate-400">· {f.lead_company}</span>
                        )}
                      </div>
                      {f.completion_notes && (
                        <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                          Outcome: {f.completion_notes}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FollowupTypeIcon type={f.type} />
                      <span className="font-medium text-slate-800">
                        <FollowupTypeLabel type={f.type} />
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <FollowupPriorityBadge priority={f.priority} />
                  </td>

                  {/* Scheduled For */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span
                        className={`font-medium ${
                          isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {formatDueDate(f.due_at)}
                      </span>
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        firstName={f.assigned_to_first_name || 'U'}
                        lastName={f.assigned_to_last_name || 'U'}
                        size="xs"
                      />
                      <span className="text-slate-800 font-medium">
                        {f.assigned_to_first_name
                          ? `${f.assigned_to_first_name} ${f.assigned_to_last_name}`
                          : 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <FollowupStatusBadge
                      status={f.status}
                      dueAt={f.due_at}
                      isOverdue={f.is_overdue}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Showing page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({total} follow-ups)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              leftIcon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              rightIcon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
