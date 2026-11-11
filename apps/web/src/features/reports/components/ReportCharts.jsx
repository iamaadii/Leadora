import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { formatCurrency } from '../../../utils/currency.js';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  PieChart,
} from 'lucide-react';

export function ReportCharts({ category, summary = {}, rows = [] }) {
  const { organizationCurrency } = useAuth();

  if (!summary || Object.keys(summary).length === 0) {
    return null;
  }

  // 1. Pipeline Funnel for Leads Report
  if (category === 'leads') {
    const total = summary.totalLeads || 1;
    const stages = [
      { label: 'New', count: summary.newLeads || 0, color: 'bg-sky-500', barColor: 'bg-sky-500/20' },
      { label: 'Contacted', count: summary.contactedLeads || 0, color: 'bg-indigo-500', barColor: 'bg-indigo-500/20' },
      { label: 'Interested', count: summary.interestedLeads || 0, color: 'bg-blue-500', barColor: 'bg-blue-500/20' },
      { label: 'Qualified', count: summary.qualifiedLeads || 0, color: 'bg-amber-500', barColor: 'bg-amber-500/20' },
      { label: 'Proposal', count: summary.proposalLeads || 0, color: 'bg-purple-500', barColor: 'bg-purple-500/20' },
      { label: 'Won', count: summary.convertedLeads || 0, color: 'bg-emerald-500', barColor: 'bg-emerald-500/20' },
    ];

    const pipelineVal = summary.totalPipelineValue || 0;
    const avgDealVal = summary.convertedLeads > 0
      ? pipelineVal / summary.convertedLeads
      : pipelineVal / (summary.totalLeads || 1);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Funnel Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Pipeline Funnel & Conversion Velocity
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {summary.totalLeads ?? 0} Total Tracked
            </span>
          </div>

          {/* Stepped Funnel Progress Bars */}
          <div className="space-y-2.5">
            {stages.map((st) => {
              const pct = Math.round((st.count / total) * 100);
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.color}`} />
                      {st.label}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      <strong className="text-slate-800">{st.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.color}`}
                      style={{ width: `${Math.max(pct, st.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Value & Conversion Ratio Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Pipeline Value</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(pipelineVal, organizationCurrency)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Estimated monetary volume across all opportunities in this period.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Average Deal Size</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(avgDealVal, organizationCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Win vs Loss Ratio</span>
              <span className="font-bold text-emerald-600">
                {summary.convertedLeads ?? 0} Won / {summary.lostLeads ?? 0} Lost
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Lost Deals Diagnostics & Reason Breakdown
  if (category === 'lost-leads') {
    // Aggregate reasons from rows
    const reasonCounts = {};
    rows.forEach((r) => {
      const note = r.lossNote || r.loss_notes || r.reason || 'Not specified';
      const cleanReason = note.split('-')[0].split(':')[0].trim().slice(0, 30);
      reasonCounts[cleanReason] = (reasonCounts[cleanReason] || 0) + 1;
    });

    const totalLost = summary.totalLost || rows.length || 1;
    const sortedReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Loss Reasons Diagnostics & Drop-off Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
            {summary.lossRate ?? 0}% Overall Drop-off Rate
          </span>
        </div>

        {sortedReasons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {sortedReasons.map(([reason, count]) => {
              const pct = Math.round((count / totalLost) * 100);
              return (
                <div key={reason} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate pr-2">{reason}</span>
                    <span className="font-mono text-slate-500 font-semibold text-[11px] shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No loss reasons recorded for this filter range.</p>
        )}
      </div>
    );
  }

  // 3. Conversions & Velocity Metrics
  if (category === 'conversions') {
    const rate = Number(summary.conversionRate || 0);
    const avgDays = Number(summary.avgDaysToConvert || 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sales Win Rate
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {rate}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(rate, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Won conversions relative to all processed opportunities.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Average Sales Cycle
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {avgDays} <span className="text-sm font-semibold text-slate-500">days to convert</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Time elapsed from lead creation to successful qualification & closure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Follow-ups Health Bar
  if (category === 'followups') {
    const total = summary.totalFollowups || 1;
    const completed = summary.completedFollowups || 0;
    const overdue = summary.overdueFollowups || 0;
    const pending = summary.pendingFollowups || Math.max(0, total - completed - overdue);

    const completedPct = Math.round((completed / total) * 100);
    const overduePct = Math.round((overdue / total) * 100);
    const pendingPct = Math.round((pending / total) * 100);

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Task Execution & Cadence Health
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {summary.completionRate ?? 0}% Completed
          </span>
        </div>

        {/* Stacked Health Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${completedPct}%` }}
            title={`Completed: ${completed} (${completedPct}%)`}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${overduePct}%` }}
            title={`Overdue: ${overdue} (${overduePct}%)`}
          />
          <div
            className="h-full bg-blue-400 transition-all duration-300"
            style={{ width: `${pendingPct}%` }}
            title={`Pending: ${pending} (${pendingPct}%)`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Completed: <strong>{completed}</strong> ({completedPct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Overdue: <strong>{overdue}</strong> ({overduePct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-600 font-medium">Pending: <strong>{pending}</strong> ({pendingPct}%)</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

ReportCharts.propTypes = {
  category: PropTypes.string.isRequired,
  summary: PropTypes.object,
  rows: PropTypes.array,
};

