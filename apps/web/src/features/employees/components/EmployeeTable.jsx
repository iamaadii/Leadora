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
  Crown,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    variant: 'danger',
    icon: ShieldCheck,
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
  },
  MANAGER: {
    label: 'Manager',
    variant: 'primary',
    icon: Briefcase,
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  },
  EMPLOYEE: {
    label: 'Employee',
    variant: 'neutral',
    icon: UserCheck,
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200/60',
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* Mobile View (<768px): 3-Tier Ergonomic Smart Cards            */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:hidden divide-y divide-slate-100">
        {employees.map((emp) => {
          const roleConf = ROLE_CONFIG[emp.role] || ROLE_CONFIG.EMPLOYEE;
          const RoleIcon = roleConf.icon;
          const isSelf = emp.id === currentUserId;
          const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase();
          const isExpanded = expandedId === emp.id;

          return (
            <div key={emp.id} className="p-4 space-y-3 transition">
              {/* Tier 1: Identity & Status Chips */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {emp.first_name} {emp.last_name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded shrink-0">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={emp.is_active ? 'success' : 'neutral'} size="sm">
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {emp.must_change_password && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded">
                      <KeyRound className="w-2.5 h-2.5" />
                      <span>Temp</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Tier 2: Micro-Metric Strip (Role | Team | Leads) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-xs">
                {/* Role Pill */}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Role
                  </span>
                  <div className="mt-1 flex items-center space-x-1">
                    <span
                      className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleConf.badgeBg}`}
                    >
                      <RoleIcon className="w-3 h-3 shrink-0" />
                      <span>{roleConf.label}</span>
                    </span>
                  </div>
                </div>

                {/* Team Pill */}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Team
                  </span>
                  <div className="mt-1 truncate">
                    {emp.role === 'MANAGER' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md truncate max-w-full">
                        <Crown className="w-3 h-3 shrink-0 text-indigo-600" />
                        <span className="truncate">{emp.managed_team_name || 'No team'}</span>
                      </span>
                    ) : emp.team_name ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md truncate max-w-full">
                        <Users2 className="w-3 h-3 shrink-0 text-slate-500" />
                        <span className="truncate">{emp.team_name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Active Leads */}
                <div className="min-w-0 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    Pipeline
                  </span>
                  <span className="font-bold font-mono text-blue-700 text-xs mt-1 block truncate">
                    {emp.active_leads_count || 0} leads
                  </span>
                </div>
              </div>

              {/* Expandable Contact Details */}
              {emp.phone && (
                <div className="text-xs text-slate-600 flex items-center space-x-2 pt-0.5">
                  <span className="text-slate-400 text-[11px]">Phone:</span>
                  <a
                    href={`tel:${emp.phone}`}
                    className="font-semibold text-slate-800 hover:text-blue-600 transition"
                  >
                    {emp.phone}
                  </a>
                </div>
              )}

              {/* Tier 3: Ergonomic 1-Tap Touch Bar */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(emp)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRole(emp)}
                  disabled={isSelf}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
                >
                  <UserCog className="w-3.5 h-3.5 shrink-0" />
                  <span>Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleActive(emp)}
                  disabled={isSelf}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl font-semibold text-xs border active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition ${
                    emp.is_active
                      ? 'text-rose-600 bg-rose-50 border-rose-200/60 hover:bg-rose-100'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100'
                  }`}
                >
                  {emp.is_active ? (
                    <>
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <UserCheck2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Desktop / Laptop View (≥768px): Sticky Header, Paired Cols    */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:block overflow-x-auto relative">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          {/* Sticky Header with Backdrop Blur */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 w-[30%]">Employee & Contact</th>
              <th className="px-6 py-3.5 w-[16%]">Role</th>
              <th className="px-6 py-3.5 w-[22%]">Team Assignment</th>
              <th className="px-6 py-3.5 w-[14%] text-right">Active Leads</th>
              <th className="px-6 py-3.5 w-[10%]">Status</th>
              <th className="px-6 py-3.5 w-[8%] text-right">Actions</th>
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
                  className="hover:bg-slate-50/70 border-l-2 border-transparent hover:border-blue-600 transition-all group"
                >
                  {/* Col 1: Employee details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-2 truncate">
                          <span className="truncate">
                            {emp.first_name} {emp.last_name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded shrink-0">
                              You
                            </span>
                          )}
                          {emp.must_change_password && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded shrink-0">
                              Temp Pass
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                          <span>{emp.email}</span>
                          {emp.phone && (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <span>{emp.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Col 2: Role */}
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConf.badgeBg}`}
                    >
                      <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{roleConf.label}</span>
                    </div>
                  </td>

                  {/* Col 3: Team with Manager Distinction */}
                  <td className="px-6 py-4">
                    {emp.role === 'MANAGER' ? (
                      emp.managed_team_name ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg">
                          <Crown className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                          <span>Manager: {emp.managed_team_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No managed team</span>
                      )
                    ) : emp.team_name ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                        <Users2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span>{emp.team_name}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Col 4: Active Leads (Right-aligned numeric) */}
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums bg-blue-50 text-blue-700 border border-blue-100">
                      {emp.active_leads_count || 0} leads
                    </span>
                  </td>

                  {/* Col 5: Status */}
                  <td className="px-6 py-4">
                    {emp.is_active ? (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Deactivated
                      </Badge>
                    )}
                  </td>

                  {/* Col 6: Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                        title={
                          isSelf
                            ? 'Cannot deactivate yourself'
                            : emp.is_active
                            ? 'Deactivate Account'
                            : 'Reactivate Account'
                        }
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
