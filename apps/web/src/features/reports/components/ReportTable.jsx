// ReportTable.jsx
// Phase 9: Responsive Paginated Data Table for Reports

import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';

export function ReportTable({
  columns = [],
  data = [],
  pagination = {},
  isLoading = false,
  onPageChange,
}) {
  const getBadgeVariant = (val) => {
    switch (String(val).toUpperCase()) {
      case 'CONVERTED':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'success';
      case 'QUALIFIED':
      case 'INTERESTED':
      case 'HIGH':
        return 'primary';
      case 'PROPOSAL_SENT':
      case 'CONTACTED':
      case 'MEDIUM':
        return 'info';
      case 'LOST':
      case 'CANCELLED':
      case 'INACTIVE':
        return 'danger';
      case 'NEW':
      case 'PENDING':
      case 'LOW':
      default:
        return 'secondary';
    }
  };

  const renderCellValue = (col, row) => {
    const rawVal = row[col.key];

    if (col.key === 'status' || col.key === 'priority' || col.key === 'role') {
      return (
        <Badge variant={getBadgeVariant(rawVal)} size="sm">
          {rawVal}
        </Badge>
      );
    }

    if (col.key.toLowerCase().includes('date') || col.key.endsWith('At')) {
      if (!rawVal) return <span className="text-slate-400">-</span>;
      return new Date(rawVal).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    if (rawVal === null || rawVal === undefined || rawVal === '') {
      return <span className="text-slate-400">-</span>;
    }

    if (typeof rawVal === 'number' && col.key.toLowerCase().includes('rate')) {
      return <span className="font-semibold text-slate-900">{rawVal}%</span>;
    }

    return String(rawVal);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-2xs">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-lg w-full" />
          <div className="h-10 bg-slate-50 rounded-lg w-full" />
          <div className="h-10 bg-slate-50 rounded-lg w-full" />
          <div className="h-10 bg-slate-50 rounded-lg w-full" />
          <div className="h-10 bg-slate-50 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No report records found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No records match the selected date range and filter criteria. Try adjusting or resetting your filters.
        </p>
      </div>
    );
  }

  const { page = 1, totalPages = 1, totalItems = data.length, limit = 50 } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap"
                  >
                    {renderCellValue(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          Showing <span className="font-medium text-slate-900">{startItem}</span> to{' '}
          <span className="font-medium text-slate-900">{endItem}</span> of{' '}
          <span className="font-medium text-slate-900">{totalItems}</span> records
        </span>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="h-8 text-xs"
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-slate-700 px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            rightIcon={ChevronRight}
            disabled={page >= totalPages}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="h-8 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

