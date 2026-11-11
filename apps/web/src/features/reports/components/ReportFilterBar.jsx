// ReportFilterBar.jsx
// Phase 9: Report Filtering Toolbar

import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';

export function ReportFilterBar({
  category,
  filters,
  onChangeFilters,
  onResetFilters,
}) {
  const isCustomRange = filters.range === 'custom';

  const [customStart, setCustomStart] = useState(
    filters.startDate ? filters.startDate.substring(0, 10) : ''
  );
  const [customEnd, setCustomEnd] = useState(
    filters.endDate ? filters.endDate.substring(0, 10) : ''
  );
  const [rangeError, setRangeError] = useState('');

  useEffect(() => {
    if (filters.startDate) {
      setCustomStart(filters.startDate.substring(0, 10));
    }
    if (filters.endDate) {
      setCustomEnd(filters.endDate.substring(0, 10));
    }
  }, [filters.startDate, filters.endDate]);

  // Validate dates whenever custom inputs change
  useEffect(() => {
    if (!isCustomRange) {
      setRangeError('');
      return;
    }
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (start > end) {
        setRangeError('Start date cannot be after end date.');
      } else {
        setRangeError('');
      }
    } else {
      setRangeError('');
    }
  }, [customStart, customEnd, isCustomRange]);

  const handleApplyCustomDates = () => {
    if (!customStart || !customEnd) {
      setRangeError('Both start and end dates are required.');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setRangeError('Start date cannot be after end date.');
      return;
    }
    setRangeError('');
    onChangeFilters({
      range: 'custom',
      startDate: customStart,
      endDate: customEnd,
      page: 1,
    });
  };

  const handleRangeChange = (val) => {
    if (val === 'custom') {
      onChangeFilters({ range: 'custom', page: 1 });
    } else {
      setCustomStart('');
      setCustomEnd('');
      setRangeError('');
      onChangeFilters({
        range: val,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      });
    }
  };

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
              onChange={(e) => handleRangeChange(e.target.value)}
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div
                className={`flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 border ${
                  rangeError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl px-2.5 py-1.5 w-full sm:w-auto`}
              >
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomStart(val);
                    if (customEnd && val && val > customEnd) {
                      setCustomEnd(val);
                    }
                  }}
                  className="text-xs bg-transparent border-0 focus:outline-none text-slate-700"
                />
                <span className="text-slate-400 text-xs font-medium">to</span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (customStart && val && val < customStart) {
                      setCustomEnd(customStart);
                    } else {
                      setCustomEnd(val);
                    }
                  }}
                  className="text-xs bg-transparent border-0 focus:outline-none text-slate-700"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={Boolean(rangeError || !customStart || !customEnd)}
                  onClick={handleApplyCustomDates}
                  className="ml-1 text-xs"
                >
                  Apply
                </Button>
              </div>
              {rangeError && (
                <div className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rangeError}</span>
                </div>
              )}
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

