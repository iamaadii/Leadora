import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { Filter, ChevronRight } from 'lucide-react';

export function PipelineFunnelChart({ data = null, isLoading = false }) {
  const navigate = useNavigate();

  const STAGE_CONFIG = {
    NEW: { color: 'bg-sky-500', barBg: 'bg-sky-100', text: 'text-sky-700' },
    CONTACTED: { color: 'bg-blue-500', barBg: 'bg-blue-100', text: 'text-blue-700' },
    INTERESTED: { color: 'bg-indigo-500', barBg: 'bg-indigo-100', text: 'text-indigo-700' },
    QUALIFIED: { color: 'bg-purple-500', barBg: 'bg-purple-100', text: 'text-purple-700' },
    PROPOSAL_SENT: { color: 'bg-amber-500', barBg: 'bg-amber-100', text: 'text-amber-700' },
    CONVERTED: { color: 'bg-emerald-500', barBg: 'bg-emerald-100', text: 'text-emerald-700' },
    LOST: { color: 'bg-rose-400', barBg: 'bg-rose-100', text: 'text-rose-700' },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stages = data?.stages || [];
  const totalLeads = data?.totalLeads || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Sales Pipeline Distribution</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {totalLeads} total active lead{totalLeads === 1 ? '' : 's'}
        </span>
      </div>

      {totalLeads === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-xs font-medium text-slate-400">No active leads in pipeline.</p>
          <p className="text-[11px] text-slate-400">Create or assign leads to visualize funnel progression.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage) => {
            const config = STAGE_CONFIG[stage.status] || {
              color: 'bg-blue-500',
              barBg: 'bg-blue-100',
              text: 'text-blue-700',
            };

            return (
              <div
                key={stage.status}
                onClick={() => navigate(`/leads?status=${stage.status}`)}
                className="group cursor-pointer rounded-xl p-2 -mx-2 hover:bg-slate-50 transition"
                title={`View all ${stage.label} leads`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {stage.count} lead{stage.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[11px] font-bold ${config.text}`}>
                      {stage.percentage}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition" />
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${config.color}`}
                    style={{
                      width: `${stage.percentage > 0 ? Math.max(stage.percentage, 2) : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

