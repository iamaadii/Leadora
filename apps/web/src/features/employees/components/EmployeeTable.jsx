import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import {
  ShieldCheck,
  UserCheck,
  Edit2,
  UserCog,
  UserX,
  UserCheck2,
  Users2,
  Briefcase,
  Layers,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    variant: 'danger',
    icon: ShieldCheck,
  },
  MANAGER: {
    label: 'Manager',
    variant: 'primary',
    icon: Briefcase,
  },
  EMPLOYEE: {
    label: 'Employee',
    variant: 'neutral',
    icon: UserCheck,
  },
};

export function EmployeeTable({
  employees = [],
  currentUserId,
  onEdit,
  onChangeRole,
  onToggleActive,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* Mobile View: Concise Clickable Cards (Progressive Disclosure) */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {employees.map((emp) => {
          const roleConf = ROLE_CONFIG[emp.role] || ROLE_CONFIG.EMPLOYEE;
          const RoleIcon = roleConf.icon;
          const isSelf = emp.id === currentUserId;
          const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase();
          const isExpanded = expandedId === emp.id;

          return (
            <div key={emp.id} className="transition">
              {/* Summary Card Header (Clickable) */}
              <div
                onClick={() => toggleExpand(emp.id)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {emp.first_name} {emp.last_name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1 py-0.2 rounded shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <Badge variant={emp.is_active ? 'success' : 'neutral'} size="sm">
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="inline-flex items-center space-x-1 text-slate-600 font-medium">
                        <RoleIcon className="w-3 h-3 text-slate-400" />
                        <span>{roleConf.label}</span>
                      </span>
                      {emp.team_name && (
                        <>
                          <span className="text-slate-300">&bull;</span>
                          <span className="truncate text-slate-500">{emp.team_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </div>

              {/* Expanded Detail Panel (Progressive Disclosure) */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-3 bg-slate-50/70 border-t border-slate-100/80 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Contact Info
                      </span>
                      <p className="text-[11px] text-slate-700 flex items-center space-x-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </p>
                      {emp.phone && (
                        <p className="text-[11px] text-slate-700 flex items-center space-x-1.5 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Assignment & Workload
                      </span>
                      <p className="text-[11px] text-slate-700 font-medium truncate">
                        {emp.role === 'MANAGER'
                          ? `Leads: ${emp.managed_team_name || 'No team'}`
                          : `Team: ${emp.team_name || 'Unassigned'}`}
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold">
                        {emp.active_leads_count || 0} active leads
                      </p>
                    </div>
                  </div>

                  {/* Actions for this employee */}
                  <div className="flex items-center space-x-2 pt-1">
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={Edit2}
                      onClick={() => onEdit(emp)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={UserCog}
                      onClick={() => onChangeRole(emp)}
                      disabled={isSelf}
                    >
                      Role
                    </Button>
                    <Button
                      size="xs"
                      variant={emp.is_active ? 'ghost' : 'outline'}
                      leftIcon={emp.is_active ? UserX : UserCheck2}
                      onClick={() => onToggleActive(emp)}
                      disabled={isSelf}
                      className={emp.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600'}
                    >
                      {emp.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Desktop View: Full Data Table with All Columns                */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Team Assignment</th>
              <th className="px-6 py-3.5">Active Leads</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const roleConf = ROLE_CONFIG[emp.role] || ROLE_CONFIG.EMPLOYEE;
              const RoleIcon = roleConf.icon;
              const isSelf = emp.id === currentUserId;
              const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase();

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/60 transition-colors duration-150"
                >
                  {/* Employee details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {emp.first_name} {emp.last_name}
                          {isSelf && (
                            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                          {emp.must_change_password && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Temp Password
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {emp.email} {emp.phone && `• ${emp.phone}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{roleConf.label}</span>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-6 py-4">
                    {emp.role === 'MANAGER' ? (
                      emp.managed_team_name ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span>Leads: {emp.managed_team_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No team assigned</span>
                      )
                    ) : emp.team_name ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
                        <Users2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span>{emp.team_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Active Leads */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {emp.active_leads_count || 0} leads
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {emp.is_active ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Deactivated</Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(emp)}
                        title="Edit employee details"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChangeRole(emp)}
                        disabled={isSelf}
                        title={isSelf ? 'Cannot change your own role' : 'Change Role'}
                      >
                        <UserCog className="w-4 h-4 text-slate-500" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive(emp)}
                        disabled={isSelf}
                        title={isSelf ? 'Cannot deactivate yourself' : emp.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                      >
                        {emp.is_active ? (
                          <UserX className="w-4 h-4 text-rose-500" />
                        ) : (
                          <UserCheck2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </Button>
                    </div>
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
