import React from 'react';
import { LeadStatusBadge } from './LeadStatusBadge.jsx';
import { LeadPriorityBadge } from './LeadPriorityBadge.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { formatCurrency } from '../../../utils/currency.js';
import { formatDate, formatRelativeTime } from '../../../utils/dateTime.js';
import {
  MoreVertical,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  Building,
  Mail,
  Phone,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
  User,
  Tag,
} from 'lucide-react';

export function LeadTable({
  leads = [],
  isLoading = false,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange,
  onView,
  onEdit,
  onArchive,
  onRestore,
  canArchive = false,
  isArchivedView = false,
}) {
  const { organizationCurrency, organizationTimezone } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Mobile Skeleton */}
        <div className="sm:hidden divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton variant="circular" className="w-10 h-10" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden sm:block">
          <div className="p-4 bg-slate-50/75 border-b border-slate-200 flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3 w-[28%]">
                  <Skeleton variant="circular" className="w-9 h-9 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="w-[18%] space-y-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <div className="w-[16%] flex flex-col items-end space-y-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="w-[18%] flex items-center space-x-2">
                  <Skeleton variant="circular" className="w-6 h-6 shrink-0" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="w-[12%] space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="w-[8%] flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <EmptyState
          icon={Target}
          title={isArchivedView ? 'No archived leads found' : 'No leads found'}
          description={
            isArchivedView
              ? 'There are no archived leads matching your filters.'
              : 'No prospective leads match your current search and filter settings.'
          }
        />
      </div>
    );
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Mobile View (<768px): 3-Tier Ergonomic Smart Cards                */}
      {/* ----------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {leads.map((lead, idx) => {
          const dealValueFormatted = lead.estimated_value
            ? formatCurrency(lead.estimated_value, organizationCurrency)
            : null;

          const assignedName = lead.assigned_to_first_name
            ? `${lead.assigned_to_first_name} ${lead.assigned_to_last_name}`
            : 'Unassigned';

          const relativeTime = formatRelativeTime(lead.created_at);

          return (
            <div
              key={lead.id}
              onClick={() => onView(lead.id)}
              className="p-4 space-y-3 active:bg-blue-50/30 hover:bg-slate-50 transition cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`View details for ${lead.name}`}
            >
              {/* Tier 1: Identity & Status Chips */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Avatar name={lead.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm text-slate-900 truncate block group-hover:text-blue-600 transition">
                      {lead.name}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5 truncate">
                      {lead.company ? (
                        <span className="truncate font-medium text-slate-600 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Individual Client</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <LeadStatusBadge status={lead.status} />
                  {lead.priority && (
                    <LeadPriorityBadge priority={lead.priority} size="xs" />
                  )}
                </div>
              </div>

              {/* Tier 2: Micro-Metric Strip (Deal Value | Owner | Age) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-xs">
                {/* Metric A: Deal Value */}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Value
                  </span>
                  <span className="font-bold font-mono tabular-nums text-emerald-700 text-xs mt-1 block truncate">
                    {dealValueFormatted || '—'}
                  </span>
                </div>

                {/* Metric B: Assigned Rep */}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Owner
                  </span>
                  <div className="flex items-center space-x-1 mt-1 truncate">
                    <Avatar name={assignedName} size="xs" />
                    <span className="font-semibold text-slate-700 truncate text-xs">
                      {assignedName}
                    </span>
                  </div>
                </div>

                {/* Metric C: Source or Age */}
                <div className="min-w-0 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Created
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block truncate font-medium">
                    {relativeTime}
                  </span>
                </div>
              </div>

              {/* Tier 3: Ergonomic Touch Strip (Min 40px Touch Targets) */}
              <div
                className="flex items-center justify-between gap-2 pt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      aria-label={`Call ${lead.name}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200/60 font-semibold text-xs transition flex-1 min-w-0"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Call</span>
                    </a>
                  )}

                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      aria-label={`Email ${lead.name}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200/60 font-semibold text-xs transition flex-1 min-w-0"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Email</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onView(lead.id)}
                    aria-label={`View details of ${lead.name}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 font-semibold text-xs transition shrink-0"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Overflow Dropdown for Secondary Mobile Actions */}
                <Dropdown
                  align="right"
                  direction={idx >= leads.length - 2 ? 'up' : 'auto'}
                  trigger={
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
                      aria-label="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                >
                  <DropdownItem icon={Eye} onClick={() => onView(lead.id)}>
                    View Details
                  </DropdownItem>
                  <DropdownItem icon={Edit2} onClick={() => onEdit(lead)}>
                    Edit Lead
                  </DropdownItem>
                  {canArchive && !lead.archived_at && (
                    <DropdownItem icon={Archive} danger onClick={() => onArchive(lead)}>
                      Archive Lead
                    </DropdownItem>
                  )}
                  {canArchive && lead.archived_at && (
                    <DropdownItem icon={RotateCcw} onClick={() => onRestore(lead)}>
                      Restore Lead
                    </DropdownItem>
                  )}
                </Dropdown>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Desktop / Laptop View (≥768px): Sticky Header, Dense Paired Cols  */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto relative">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Header with Backdrop Blur */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[28%]">Lead & Organization</th>
              <th className="py-3.5 px-4 w-[18%]">Stage & Priority</th>
              <th className="py-3.5 px-4 w-[16%] text-right">Deal Value</th>
              <th className="py-3.5 px-4 w-[18%]">Assigned Owner</th>
              <th className="py-3.5 px-4 w-[12%]">Created</th>
              <th className="py-3.5 px-4 w-[8%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead, idx) => {
              const assignedName = lead.assigned_to_first_name
                ? `${lead.assigned_to_first_name} ${lead.assigned_to_last_name}`
                : 'Unassigned';

              const createdDate = formatDate(lead.created_at, organizationTimezone);
              const relativeTime = formatRelativeTime(lead.created_at);
              const dealValueFormatted = lead.estimated_value
                ? formatCurrency(lead.estimated_value, organizationCurrency)
                : '—';

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/70 border-l-2 border-transparent hover:border-blue-600 transition-all group cursor-pointer"
                  onClick={() => onView(lead.id)}
                >
                  {/* Col 1: Lead Identity & Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar name={lead.name} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 block truncate group-hover:text-blue-600 transition text-sm">
                          {lead.name}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 truncate">
                          <span className="truncate font-medium text-slate-600">
                            {lead.company || 'Individual Client'}
                          </span>
                          {(lead.email || lead.phone) && (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <div
                                className="flex items-center space-x-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {lead.email && (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    title={`Email: ${lead.email}`}
                                    className="text-slate-400 hover:text-blue-600 transition p-0.5 rounded"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.phone && (
                                  <a
                                    href={`tel:${lead.phone}`}
                                    title={`Call: ${lead.phone}`}
                                    className="text-slate-400 hover:text-emerald-600 transition p-0.5 rounded"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Col 2: Stage & Priority */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div>
                        <LeadStatusBadge status={lead.status} />
                      </div>
                      <div>
                        <LeadPriorityBadge priority={lead.priority} size="xs" />
                      </div>
                    </div>
                  </td>

                  {/* Col 3: Deal Value & Source (Right-aligned numbers) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="space-y-0.5">
                      <span className="font-bold font-mono tabular-nums text-slate-900 text-sm block">
                        {dealValueFormatted}
                      </span>
                      {lead.source && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block">
                          {lead.source}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Col 4: Assigned Owner & Team */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <Avatar name={assignedName} size="xs" />
                      <div className="min-w-0">
                        <span className="text-slate-800 font-semibold truncate block max-w-[140px]">
                          {assignedName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {lead.team_name || 'Direct Sales'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Col 5: Created Date & Elapsed Relative Time */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 font-medium text-xs block">
                        {createdDate}
                      </span>
                      <span className="text-slate-400 text-[11px] block font-mono">
                        {relativeTime}
                      </span>
                    </div>
                  </td>

                  {/* Col 6: Actions & Hover Triggers (Far-right) */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      {/* Hover action shortcuts for fast desktop workflows */}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          title={`Call ${lead.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition opacity-0 group-hover:opacity-100 hidden md:inline-flex"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          title={`Email ${lead.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition opacity-0 group-hover:opacity-100 hidden md:inline-flex"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onView(lead.id)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <Dropdown
                        align="right"
                        direction={idx >= leads.length - 2 ? 'up' : 'auto'}
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <DropdownItem icon={Eye} onClick={() => onView(lead.id)}>
                          View Details
                        </DropdownItem>

                        <DropdownItem icon={Edit2} onClick={() => onEdit(lead)}>
                          Edit Lead
                        </DropdownItem>

                        {canArchive && !lead.archived_at && (
                          <DropdownItem
                            icon={Archive}
                            danger
                            onClick={() => onArchive(lead)}
                          >
                            Archive Lead
                          </DropdownItem>
                        )}

                        {canArchive && lead.archived_at && (
                          <DropdownItem
                            icon={RotateCcw}
                            onClick={() => onRestore(lead)}
                          >
                            Restore Lead
                          </DropdownItem>
                        )}
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Standardized Pagination Bar                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
          <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
          <span className="font-semibold text-slate-800">{total}</span> leads
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            leftIcon={ChevronLeft}
            className="flex-1 sm:flex-none justify-center"
          >
            Previous
          </Button>
          <span className="px-2 text-slate-600 font-semibold shrink-0 text-center">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            rightIcon={ChevronRight}
            className="flex-1 sm:flex-none justify-center"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
