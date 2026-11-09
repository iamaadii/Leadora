import React from 'react';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import {
  Users2,
  Target,
  Edit2,
  UserPlus,
  Power,
  ChevronRight,
} from 'lucide-react';

export function TeamCard({
  team,
  isAdmin = false,
  onViewDetails,
  onManageMembers,
  onEdit,
  onToggleActive,
}) {
  const managerInitials = team.manager_first_name
    ? `${team.manager_first_name[0]}${team.manager_last_name?.[0] || ''}`.toUpperCase()
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              {team.name}
              {!team.is_active && (
                <Badge variant="neutral" size="sm">Inactive</Badge>
              )}
            </h3>
            {team.description ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {team.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1 italic">
                No description provided
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(team)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit Team"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleActive(team)}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                  team.is_active ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600 hover:text-emerald-700'
                }`}
                title={team.is_active ? 'Deactivate Team' : 'Activate Team'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Manager Section */}
        <div className="p-3 bg-slate-50/80 rounded-xl mb-4 border border-slate-100">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
            Team Manager
          </div>
          {team.manager_id ? (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs shrink-0">
                {managerInitials}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {team.manager_first_name} {team.manager_last_name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {team.manager_email}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              No manager assigned
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
              <Users2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Members</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {team.member_count || 0}
            </div>
          </div>

          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              <span>Team Leads</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {team.active_leads_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 justify-center"
          onClick={() => onViewDetails(team)}
          rightIcon={ChevronRight}
        >
          View Workload
        </Button>

        {isAdmin && team.is_active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageMembers(team)}
            title="Manage Team Members"
            leftIcon={UserPlus}
          >
            Members
          </Button>
        )}
      </div>
    </div>
  );
}
