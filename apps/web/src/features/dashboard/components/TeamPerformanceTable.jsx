import React, { useState } from 'react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { Users2, Award, ChevronDown, ChevronUp } from 'lucide-react';

export function TeamPerformanceTable({ teams = [], isLoading = false }) {
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center space-y-2">
        <Users2 className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700">No teams found</p>
        <p className="text-[11px] text-slate-400">Create teams to monitor collective team pipeline distribution.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Team Workload & Performance</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{teams.length} team(s)</span>
      </div>

      {/* Mobile Progressive Disclosure Card View */}
      <div className="sm:hidden divide-y divide-slate-100">
        {teams.map((t) => {
          const isExpanded = expandedTeamId === t.teamId;

          return (
            <div key={t.teamId} className="p-4 space-y-2.5">
              <div
                onClick={() => setExpandedTeamId(isExpanded ? null : t.teamId)}
                className="flex items-center justify-between cursor-pointer gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{t.teamName}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    Lead: <span className="font-medium text-slate-700">{t.manager?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="inline-flex items-center space-x-1 font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>{t.conversionRate}%</span>
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2.5 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                  {t.description && (
                    <p className="text-slate-500 italic text-[11px] leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Members</span>
                      <span className="font-bold text-slate-800 text-sm">{t.memberCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Leads</span>
                      <span className="font-bold text-blue-600 text-sm">{t.totalLeads}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deals Won</span>
                      <span className="font-bold text-emerald-600 text-sm">{t.wonLeads}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                    <span>Lost Deals: <strong className="text-slate-800">{t.lostLeads}</strong></span>
                    <span>
                      Pending Tasks:{' '}
                      <strong className="text-slate-800">{t.pendingFollowups}</strong>
                      {t.overdueFollowups > 0 && (
                        <span className="ml-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                          {t.overdueFollowups} overdue
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Full Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Team</th>
              <th className="py-2.5 px-4">Manager</th>
              <th className="py-2.5 px-4 text-center">Members</th>
              <th className="py-2.5 px-4 text-center">Active Leads</th>
              <th className="py-2.5 px-4 text-center">Won</th>
              <th className="py-2.5 px-4 text-center">Lost</th>
              <th className="py-2.5 px-4 text-center">Pending Tasks</th>
              <th className="py-2.5 px-4 text-right">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {teams.map((t) => (
              <tr key={t.teamId} className="hover:bg-slate-50/50 transition">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{t.teamName}</div>
                  {t.description && (
                    <div className="text-[11px] text-slate-400 line-clamp-1">{t.description}</div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">
                  {t.manager?.name || 'Unassigned'}
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-600">
                  {t.memberCount}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-900">
                  {t.totalLeads}
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">
                  {t.wonLeads}
                </td>
                <td className="py-3 px-4 text-center font-medium text-slate-400">
                  {t.lostLeads}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-slate-700">{t.pendingFollowups}</span>
                  {t.overdueFollowups > 0 && (
                    <span className="ml-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                      {t.overdueFollowups} overdue
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>{t.conversionRate}%</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

