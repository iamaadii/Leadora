import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Search, X, RotateCcw, Archive } from 'lucide-react';

export function LeadFilters({
  filters,
  onFilterChange,
  onResetFilters,
  assignees = [],
  canViewAll = true,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange('search', localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, filters.search, onFilterChange]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.source ||
      filters.assigned_to_id ||
      filters.isArchived,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewAll ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 items-center`}>
        {/* Search Input */}
        <div className={canViewAll ? 'lg:col-span-2' : 'lg:col-span-2 sm:col-span-2'}>
          <Input
            placeholder="Search leads by name, email, company..."
            leftIcon={Search}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            rightIcon={
              localSearch
                ? () => (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        onFilterChange('search', '');
                      }}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )
                : null
            }
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </Select>
        </div>

        {/* Source Filter */}
        <div>
          <Select
            value={filters.source || ''}
            onChange={(e) => onFilterChange('source', e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="COLD_CALL">Cold Call</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="EVENT">Event</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        {/* Assignee Filter (if permitted) */}
        {canViewAll && (
          <div>
            <Select
              value={filters.assigned_to_id || ''}
              onChange={(e) => onFilterChange('assigned_to_id', e.target.value)}
            >
              <option value="">All Sales Reps</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Filter status row & Clear action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Archive toggle */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onFilterChange('isArchived', false)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              !filters.isArchived
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Leads
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('isArchived', true)}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filters.isArchived
                ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived Leads</span>
          </button>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearch('');
              onResetFilters();
            }}
            leftIcon={RotateCcw}
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}

