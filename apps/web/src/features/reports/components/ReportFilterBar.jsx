// ReportFilterBar.jsx
// Phase 9: Report Filtering Toolbar

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';

export function ReportFilterBar({
  category,
  filters,
  onChangeFilters,
  onResetFilters,
}) {
  const isCustomRange = filters.range === 'custom';

  const showStatusFilter = ['leads', 'followups'].includes(category);
  const showSourceFilter = ['leads', 'conversions', 'lost-leads'].includes(category);

  const hasActiveFilters = Boolean(
    (filters.range && filters.range !== '30d') ||
      filters.status ||
      filters.source ||
      filters.startDate ||
      filters.endDate,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Date Range Selector */}
          <div className="w-full sm:w-44">
            <Select
              value={filters.range || '30d'}
              onChange={(e) => onChangeFilters({ range: e.target.value, page: 1 })}
              containerClassName="w-full"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="prev_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>

          {/* Custom Date Range Inputs */}
          {isCustomRange && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full sm:w-auto">
              <input
                type="date"
                value={filters.startDate ? filters.startDate.substring(0, 10) : ''}
                onChange={(e) => onChangeFilters({ startDate: e.target.value, page: 1 })}
                className="text-xs bg-transparent border-0 focus:outline-none text-slate-700"
              />
              <span className="text-slate-400 text-xs font-medium">to</span>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.substring(0, 10) : ''}
                onChange={(e) => onChangeFilters({ endDate: e.target.value, page: 1 })}
                className="text-xs bg-transparent border-0 focus:outline-none text-slate-700"
              />
            </div>
          )}

          {/* Status Filter */}
          {showStatusFilter && (
            <div className="w-full sm:w-40">
              <Select
                value={filters.status || ''}
                onChange={(e) => onChangeFilters({ status: e.target.value || undefined, page: 1 })}
                containerClassName="w-full"
              >
                <option value="">All Statuses</option>
                {category === 'leads' ? (
                  <>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                )}
              </Select>
            </div>
          )}

          {/* Lead Source Filter */}
          {showSourceFilter && (
            <div className="w-full sm:w-40">
              <Select
                value={filters.source || ''}
                onChange={(e) => onChangeFilters({ source: e.target.value || undefined, page: 1 })}
                containerClassName="w-full"
              >
                <option value="">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="COLD_OUTREACH">Cold Outreach</option>
                <option value="INBOUND">Inbound</option>
                <option value="EVENT">Event</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {hasActiveFilters && (
          <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={RotateCcw}
              onClick={onResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

