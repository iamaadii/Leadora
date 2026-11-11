// ReportTable.jsx
// Phase 9: Responsive Paginated Data Table for Reports with Interactive Sorting & Mobile Cards

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';

export function ReportTable({
  columns = [],
  data = [],
  pagination = {},
  isLoading = false,
  onPageChange,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleHeaderClick = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Numeric comparison
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === 'asc' ? numA - numB : numB - numA;
      }

      // Date comparison
      const dateA = Date.parse(valA);
      const dateB = Date.parse(valB);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // String comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

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

  const isNumericColumn = (key) => {
    const k = key.toLowerCase();
    return (
      k.includes('value') ||
      k.includes('amount') ||
      k.includes('rate') ||
      k.includes('count') ||
      k.includes('total') ||
      k.includes('days') ||
      k.includes('leads') ||
      k.includes('won')
    );
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

    if (col.key === 'estimatedValue' || col.key === 'value' || col.key === 'totalValue') {
      if (!rawVal && rawVal !== 0) return <span className="text-slate-400">—</span>;
      return (
        <span className="font-bold font-mono tabular-nums text-emerald-700">
          ${Number(rawVal).toLocaleString()}
        </span>
      );
    }

    if (col.key.toLowerCase().includes('date') || col.key.endsWith('At')) {
      if (!rawVal) return <span className="text-slate-400">—</span>;
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
      return <span className="text-slate-400">—</span>;
    }

    if (typeof rawVal === 'number' && col.key.toLowerCase().includes('rate')) {
      return (
        <span className="font-bold font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
          {rawVal}%
        </span>
      );
    }

    return String(rawVal);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs overflow-hidden">
        <div className="space-y-3.5 animate-pulse">
          <div className="h-6 bg-slate-100 rounded-lg w-48" />
          <div className="h-10 bg-slate-50 rounded-xl w-full" />
          <div className="h-10 bg-slate-50 rounded-xl w-full" />
          <div className="h-10 bg-slate-50 rounded-xl w-full" />
          <div className="h-10 bg-slate-50 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No report records found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No records match the selected date range and filter criteria. Try adjusting or resetting your filters.
        </p>
      </div>
    );
  }

  const { page = 1, totalPages = 1, totalItems = data.length, limit = 15 } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  // Identify primary column for mobile card header (first non-date, non-numeric column)
  const primaryCol = columns[0] || { key: 'id', label: 'Item' };
  const secondaryCols = columns.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Mobile View (<768px): Structured KPI Cards                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {sortedData.map((row, idx) => (
          <div key={row.id || idx} className="p-4 space-y-2.5">
            {/* Mobile Card Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {primaryCol.label}
                </span>
                <span className="font-bold text-sm text-slate-900 truncate block mt-0.5">
                  {renderCellValue(primaryCol, row)}
                </span>
              </div>

              {/* Status or Priority if present */}
              {row.status && (
                <div className="shrink-0">
                  <Badge variant={getBadgeVariant(row.status)} size="sm">
                    {row.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Mobile Metric Grid (Remaining Columns in 2-Col Box) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-xs">
              {secondaryCols.slice(0, 4).map((col) => (
                <div key={col.key} className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none truncate">
                    {col.label}
                  </span>
                  <div className="mt-1 text-xs text-slate-700 truncate font-medium">
                    {renderCellValue(col, row)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Desktop / Laptop View (≥768px): Sticky Header, Sortable Grid      */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          {/* Sticky Header with Backdrop Blur & Interactive Sort */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const isNumeric = isNumericColumn(col.key);

                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col.key)}
                    className={`py-3.5 px-4 whitespace-nowrap cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-800 transition ${
                      isNumeric ? 'text-right' : 'text-left'
                    } ${isSorted ? 'text-blue-600 font-bold bg-blue-50/40' : ''}`}
                    title={`Click to sort by ${col.label}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        isNumeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      {isSorted ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/70 border-l-2 border-transparent hover:border-blue-600 transition-all"
              >
                {columns.map((col) => {
                  const isNumeric = isNumericColumn(col.key);
                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 whitespace-nowrap ${
                        isNumeric ? 'text-right font-mono' : ''
                      }`}
                    >
                      {renderCellValue(col, row)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Standardized Pagination Bar                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> records
        </div>

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
