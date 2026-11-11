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

    if (col.key === 'daysToConvert') {
      const days = Number(rawVal);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
            days <= 3
              ? 'bg-emerald-50 text-emerald-700'
              : days <= 14
              ? 'bg-blue-50 text-blue-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {days} {days === 1 ? 'day' : 'days'}
        </span>
      );
    }

    if (col.key === 'estimatedValue') {
      if (!rawVal && rawVal !== 0) return <span className="text-slate-400">-</span>;
      return (
        <span className="font-bold text-emerald-700">
          ${Number(rawVal).toLocaleString()}
        </span>
      );
    }

    if (col.key.toLowerCase().includes('date') || col.key.endsWith('At')) {
      if (!rawVal) return <span className="text-slate-400">-</span>;
      const d = new Date(rawVal);
      const formatted = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const daysAgo = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      const relative =
        daysAgo === 0
          ? 'Today'
          : daysAgo === 1
          ? 'Yesterday'
          : daysAgo > 0 && daysAgo < 30
          ? `${daysAgo}d ago`
          : null;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{formatted}</span>
          {relative && (
            <span className="text-[10px] text-slate-400 font-mono">{relative}</span>
          )}
        </div>
      );
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
      <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="text-center sm:text-left w-full sm:w-auto">
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> records
        </span>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            leftIcon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="flex-1 sm:flex-none justify-center"
          >
            Previous
          </Button>
          <span className="font-semibold text-slate-700 px-2 shrink-0 text-center">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            rightIcon={ChevronRight}
            disabled={page >= totalPages}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="flex-1 sm:flex-none justify-center"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

