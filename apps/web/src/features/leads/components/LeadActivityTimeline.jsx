import React from 'react';
import {
  Sparkles,
  RefreshCw,
  UserCheck,
  Tag,
  Archive,
  RotateCcw,
  Activity,
  User,
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { formatDateTime } from '../../../utils/dateTime.js';

const EVENT_ICONS = {
  LEAD_CREATED: { icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  LEAD_UPDATED: { icon: RefreshCw, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  LEAD_ASSIGNED: { icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  LEAD_STATUS_CHANGED: { icon: Tag, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  LEAD_ARCHIVED: { icon: Archive, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  LEAD_RESTORED: { icon: RotateCcw, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
};

export function LeadActivityTimeline({ activities = [], isLoading = false }) {
  const { organizationTimezone } = useAuth();
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        No recorded activities for this lead yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200/80">
      {activities.map((act) => {
        const config = EVENT_ICONS[act.activity_type] || {
          icon: Activity,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        };
        const Icon = config.icon;

        const dateStr = formatDateTime(act.created_at, organizationTimezone);

        const actorName = act.actor_first_name
          ? `${act.actor_first_name} ${act.actor_last_name}`
          : 'System';

        return (
          <div key={act.id} className="relative group text-xs">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${config.color}`}
            >
              <Icon className="w-3 h-3 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {act.description}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                <User className="w-3 h-3 text-slate-400" />
                <span>By {actorName}</span>
                {act.actor_role && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                    {act.actor_role}
                  </span>
                )}
              </div>

              {/* Status change pill preview */}
              {act.metadata?.old_status && act.metadata?.new_status && (
                <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 inline-flex">
                  <span className="line-through text-slate-400">{act.metadata.old_status}</span>
                  <span>&rarr;</span>
                  <span className="font-bold text-blue-700">{act.metadata.new_status}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

