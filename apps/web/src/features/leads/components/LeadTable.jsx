import React from 'react';
import { LeadStatusBadge } from './LeadStatusBadge.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
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
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center space-x-4">
              <Skeleton variant="circular" className="w-9 h-9" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
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
      {/* Table responsive viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Lead Name</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Assigned Rep</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const assignedName = lead.assigned_to_first_name
                ? `${lead.assigned_to_first_name} ${lead.assigned_to_last_name}`
                : 'Unassigned';

              const createdDate = new Date(lead.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/60 transition group cursor-pointer"
                  onClick={() => onView(lead.id)}
                >
                  {/* Name & Contact */}
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center space-x-3">
                      <Avatar name={lead.name} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 block truncate group-hover:text-blue-600 transition">
                          {lead.name}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 truncate">
                          {lead.email && (
                            <span className="flex items-center space-x-1 truncate">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center space-x-1 truncate">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {lead.company ? (
                      <div className="flex items-center space-x-1.5 truncate max-w-[160px]">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{lead.company}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                      {lead.source}
                    </span>
                  </td>

                  {/* Assigned Rep */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <Avatar name={assignedName} size="xs" />
                      <span className="text-slate-700 font-medium truncate max-w-[120px]">
                        {assignedName}
                      </span>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {createdDate}
                  </td>

                  {/* Actions Dropdown */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
          <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
          <span className="font-semibold text-slate-800">{total}</span> leads
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            leftIcon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="px-2 text-slate-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            rightIcon={ChevronRight}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

