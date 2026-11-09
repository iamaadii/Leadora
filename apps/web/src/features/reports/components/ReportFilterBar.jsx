// ReportFilterBar.jsx
// Phase 9: Report Filtering Toolbar

import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <Select
            value={filters.range || '30d'}
            onChange={(e) => onChangeFilters({ range: e.target.value, page: 1 })}
            className="w-36 text-xs h-9"
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
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.startDate ? filters.startDate.substring(0, 10) : ''}
              onChange={(e) => onChangeFilters({ startDate: e.target.value, page: 1 })}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 h-9"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate ? filters.endDate.substring(0, 10) : ''}
              onChange={(e) => onChangeFilters({ endDate: e.target.value, page: 1 })}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 h-9"
            />
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Select
              value={filters.status || ''}
              onChange={(e) => onChangeFilters({ status: e.target.value || undefined, page: 1 })}
              className="w-36 text-xs h-9"
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
          <Select
            value={filters.source || ''}
            onChange={(e) => onChangeFilters({ source: e.target.value || undefined, page: 1 })}
            className="w-36 text-xs h-9"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="COLD_OUTREACH">Cold Outreach</option>
            <option value="INBOUND">Inbound</option>
            <option value="EVENT">Event</option>
            <option value="OTHER">Other</option>
          </Select>
        )}

        {/* Reset Filters */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={RotateCcw}
          onClick={onResetFilters}
          className="text-xs h-9 text-slate-500 hover:text-slate-900 ml-auto"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
