import React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
  trend = null,
  isLoading = false,
  empty = false,
  onClick = null,
}) {
  const COLOR_CLASSES = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const iconStyle = COLOR_CLASSES[color] || COLOR_CLASSES.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconStyle}`}>
            <Icon className="w-4 h-4 stroke-[1.75]" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-lg" />
        ) : empty ? (
          <div className="text-xl font-bold text-slate-400">--</div>
        ) : (
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        )}

        <div className="mt-1.5 flex items-center justify-between text-xs">
          {description && (
            <p className="text-slate-500 text-[11px] leading-normal">{description}</p>
          )}

          {trend !== null && !isLoading && !empty && (
            <span
              className={`inline-flex items-center space-x-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                trend > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : trend < 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3 text-rose-600" />
              ) : (
                <Minus className="w-3 h-3 text-slate-400" />
              )}
              <span>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
