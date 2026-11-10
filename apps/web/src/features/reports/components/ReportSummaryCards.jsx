// ReportSummaryCards.jsx
// Phase 9: Dynamic KPI Metrics Cards for Active Report

import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Award,
  Users2,
  Activity,
  Building,
} from 'lucide-react';

export function ReportSummaryCards({ category, summary = {} }) {
  if (!summary || Object.keys(summary).length === 0) {
    return null;
  }

  const getMetricCards = () => {
    switch (category) {
      case 'leads':
        return [
          { label: 'Total Leads', val: summary.totalLeads ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Converted Leads', val: summary.convertedLeads ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Qualified Leads', val: summary.qualifiedLeads ?? 0, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Lost Deals', val: summary.lostLeads ?? 0, icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
        ];
      case 'conversions':
        return [
          { label: 'Total Won Leads', val: summary.totalConverted ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Win Rate', val: `${summary.conversionRate ?? 0}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Avg Days to Convert', val: `${summary.avgDaysToConvert ?? 0} days`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
        ];
      case 'lost-leads':
        return [
          { label: 'Lost Deals', val: summary.totalLost ?? 0, icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
          { label: 'Total Leads Handled', val: summary.totalLeads ?? 0, icon: Users, color: 'text-slate-600 bg-slate-100' },
          { label: 'Drop-off / Loss Rate', val: `${summary.lossRate ?? 0}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
        ];
      case 'followups':
        return [
          { label: 'Total Follow-ups', val: summary.totalFollowups ?? 0, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', val: summary.completedFollowups ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Overdue / Missed', val: summary.overdueFollowups ?? 0, icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
          { label: 'Completion Rate', val: `${summary.completionRate ?? 0}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
        ];
      case 'employees':
        return [
          { label: 'Active Reps', val: summary.activeRepsCount ?? 0, icon: Award, color: 'text-purple-600 bg-purple-50' },
          { label: 'Assigned Leads', val: summary.totalAssignedLeads ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Converted Leads', val: summary.totalConvertedLeads ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg Win Rate', val: `${summary.avgConversionRate ?? 0}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
        ];
      case 'teams':
        return [
          { label: 'Active Teams', val: summary.totalTeams ?? 0, icon: Users2, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Team Leads', val: summary.totalLeads ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Won Leads', val: summary.totalWonLeads ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Overall Team Win Rate', val: `${summary.overallConversionRate ?? 0}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
        ];
      case 'activities':
        return [
          { label: 'Total Audit Events', val: summary.totalActivities ?? 0, icon: Activity, color: 'text-slate-700 bg-slate-100' },
        ];
      case 'organizations':
        return [
          { label: 'Total Tenants', val: summary.totalOrganizations ?? 0, icon: Building, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Organizations', val: summary.activeOrganizations ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Inactive Organizations', val: summary.inactiveOrganizations ?? 0, icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
        ];
      case 'users':
        return [
          { label: 'Total Platform Users', val: summary.totalUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Users', val: summary.activeUsers ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Tenant Admins', val: summary.adminUsers ?? 0, icon: Award, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Sales Reps', val: summary.employeeUsers ?? 0, icon: Users2, color: 'text-purple-600 bg-purple-50' },
        ];
      default:
        return [];
    }
  };

  const cards = getMetricCards();
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.label}
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 sm:mt-1 truncate">
                {card.val}
              </p>
            </div>
            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${card.color}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

