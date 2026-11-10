import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { Activity, ArrowUpRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { formatDateTime } from '../../../utils/dateTime.js';

export function RecentActivityFeed({ activities = [], isLoading = false }) {
  const { organizationTimezone } = useAuth();
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTime = (isoString) => {
    return formatDateTime(isoString, organizationTimezone);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Recent Customer Engagements</h3>
        </div>
        <Link
          to="/activities"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No recent activity logged in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-slate-50 transition -mx-2 text-xs"
            >
              <div className="space-y-0.5 max-w-sm sm:max-w-md">
                <p className="font-semibold text-slate-800 leading-snug">
                  {item.description}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  {item.lead?.id && (
                    <Link
                      to={`/leads/${item.lead.id}`}
                      className="text-blue-600 hover:underline flex items-center space-x-0.5 font-medium"
                    >
                      <span>{item.lead.name}</span>
                      <ExternalLink className="w-3 h-3 inline text-slate-400" />
                    </Link>
                  )}
                  {item.actor?.name && (
                    <>
                      <span>·</span>
                      <span>By {item.actor.name}</span>
                    </>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0 mt-0.5 font-mono">
                {formatTime(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

