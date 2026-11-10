import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { CalendarClock, ArrowUpRight, Phone, Mail, Video, CheckSquare } from 'lucide-react';

export function FollowupAnalyticsCard({ data = null, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  const sb = data?.statusBreakdown || {
    total: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completed: 0,
    cancelled: 0,
    completionRate: 0,
  };

  const types = data?.typeBreakdown || [];

  const TYPE_ICONS = {
    CALL: Phone,
    EMAIL: Mail,
    MEETING: Video,
    TASK: CheckSquare,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <CalendarClock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Follow-up & Task Health</h3>
        </div>
        <Link
          to="/follow-ups"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Completion Rate Banner */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-700 block">Overall Task Execution</span>
          <span className="text-[11px] text-slate-500">
            {sb.completed} of {sb.total} tasks completed
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-600 tracking-tight">
            {sb.completionRate}%
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">Completed</span>
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100/80">
          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block">
            Overdue
          </span>
          <span className="text-base font-bold text-rose-700 mt-0.5 block">{sb.overdue}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80">
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">
            Due Today
          </span>
          <span className="text-base font-bold text-amber-700 mt-0.5 block">{sb.dueToday}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/80">
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-base font-bold text-blue-700 mt-0.5 block">{sb.pending}</span>
        </div>
      </div>

      {/* Activity Types Breakdown */}
      {types.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">Touchpoint Mix</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {types.map((t) => {
              const Icon = TYPE_ICONS[t.type] || CheckSquare;
              return (
                <div
                  key={t.type}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100 text-slate-700"
                >
                  <div className="flex items-center space-x-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium text-[11px] capitalize">
                      {t.type.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">{t.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

