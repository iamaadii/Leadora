import React, { useState } from 'react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

export function EmployeePerformanceTable({ employees = [], isLoading = false }) {
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center space-y-2">
        <UserCheck className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700">No employee metrics found</p>
        <p className="text-[11px] text-slate-400">Add employees to monitor representative pipeline health.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Representative Pipeline & Activity</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{employees.length} member(s)</span>
      </div>

      {/* Mobile Progressive Disclosure Card View */}
      <div className="sm:hidden divide-y divide-slate-100">
        {employees.map((emp) => {
          const nameParts = (emp.name || 'User').split(' ');
          const fName = nameParts[0] || 'U';
          const lName = nameParts[1] || '';
          const isExpanded = expandedEmpId === emp.employeeId;

          return (
            <div key={emp.employeeId} className="p-4 space-y-2.5">
              <div
                onClick={() => setExpandedEmpId(isExpanded ? null : emp.employeeId)}
                className="flex items-center justify-between cursor-pointer gap-2"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Avatar firstName={fName} lastName={lName} size="xs" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{emp.name}</div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {emp.teamName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    {emp.conversionRate}%
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2.5 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                  <p className="text-slate-400 text-[11px] truncate">
                    {emp.email}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Leads</span>
                      <span className="font-bold text-blue-600 text-sm">{emp.activeLeads}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Won Deals</span>
                      <span className="font-bold text-emerald-600 text-sm">{emp.convertedLeads}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lost</span>
                      <span className="font-bold text-slate-400 text-sm">{emp.lostLeads}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                    <span>
                      Pending Tasks:{' '}
                      <strong className="text-slate-800">{emp.pendingFollowups}</strong>
                      {emp.overdueFollowups > 0 && (
                        <span className="ml-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                          {emp.overdueFollowups} overdue
                        </span>
                      )}
                    </span>
                    <span>
                      Completed: <strong className="text-blue-600 font-mono">{emp.completedFollowupsInPeriod}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Full Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Representative</th>
              <th className="py-2.5 px-4">Assigned Team</th>
              <th className="py-2.5 px-4 text-center">Active Leads</th>
              <th className="py-2.5 px-4 text-center">Won</th>
              <th className="py-2.5 px-4 text-center">Lost</th>
              <th className="py-2.5 px-4 text-center">Pending Tasks</th>
              <th className="py-2.5 px-4 text-center">Completed in Period</th>
              <th className="py-2.5 px-4 text-right">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {employees.map((emp) => {
              const nameParts = (emp.name || 'User').split(' ');
              const fName = nameParts[0] || 'U';
              const lName = nameParts[1] || '';

              return (
                <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <Avatar firstName={fName} lastName={lName} size="xs" />
                      <div>
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                      {emp.teamName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {emp.activeLeads}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">
                    {emp.convertedLeads}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-400">
                    {emp.lostLeads}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-700">{emp.pendingFollowups}</span>
                    {emp.overdueFollowups > 0 && (
                      <span className="ml-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                        {emp.overdueFollowups} overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600 font-mono">
                    {emp.completedFollowupsInPeriod}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {emp.conversionRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

