import React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
  isLoading = false,
  empty = false,
}) {
  const COLOR_CLASSES = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const iconStyle = COLOR_CLASSES[color] || COLOR_CLASSES.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconStyle}`}>
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : empty ? (
          <div className="text-xl font-bold text-slate-400">--</div>
        ) : (
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        )}

        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-normal">{description}</p>
        )}
      </div>
    </div>
  );
}
