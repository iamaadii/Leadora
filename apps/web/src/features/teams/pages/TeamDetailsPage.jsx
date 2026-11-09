import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useTeam, useTeamRoster, useTeamWorkload } from '../hooks/useTeams.js';
import {
  Target,
  Trophy,
  ArrowLeft,
  Mail,
  Phone,
  Layers,
  Percent,
} from 'lucide-react';

export function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teamData, isLoading: isLoadingTeam } = useTeam(id);
  const { data: rosterData } = useTeamRoster(id);
  const { data: workloadData, isLoading: isLoadingWorkload } = useTeamWorkload(id);

  const team = teamData?.data;
  const roster = rosterData?.data?.members || [];
  const workload = workloadData?.data;
  const workloadMembers = workload?.members || [];
  const summary = workload?.summary || {
    totalLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
  };

  if (isLoadingTeam) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Loading team details...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-base font-semibold text-slate-800">Team not found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This team does not exist or you do not have permission to view it.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/teams')}
        >
          Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={team.description || 'Sales team workspace, member roster, and workload distribution.'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teams', href: '/teams' },
          { label: team.name },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/teams')}
          >
            Back to Teams
          </Button>
        }
      />

      {/* Team Meta & Manager Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{team.name}</h2>
              {team.is_active ? (
                <Badge variant="success" size="sm">Active Team</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Inactive</Badge>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{roster.length} active member{roster.length === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{summary.totalLeads} assigned lead{summary.totalLeads === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Manager info */}
        {team.manager_id && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs shrink-0">
              {team.manager_first_name?.[0]}
              {team.manager_last_name?.[0]}
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Team Manager
              </div>
              <div className="text-xs font-bold text-slate-800">
                {team.manager_first_name} {team.manager_last_name}
              </div>
              <div className="text-[11px] text-slate-500">
                {team.manager_email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workload KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pipeline Leads</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.totalLeads}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Won Leads</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.wonLeads}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lost Leads</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.lostLeads}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Win Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.conversionRate}%</div>
        </div>
      </div>

      {/* Member Workload Distribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Member Workload & Lead Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of lead stages assigned to each team member.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-4 py-3.5 text-center">Total</th>
                <th className="px-4 py-3.5 text-center">New</th>
                <th className="px-4 py-3.5 text-center">Contacted</th>
                <th className="px-4 py-3.5 text-center">Interested</th>
                <th className="px-4 py-3.5 text-center">Qualified</th>
                <th className="px-4 py-3.5 text-center">Proposal</th>
                <th className="px-4 py-3.5 text-center">Won</th>
                <th className="px-4 py-3.5 text-center">Lost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingWorkload ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-xs text-slate-400">
                    Loading workload breakdown...
                  </td>
                </tr>
              ) : workloadMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-xs text-slate-400">
                    No active members in this team.
                  </td>
                </tr>
              ) : (
                workloadMembers.map((m) => (
                  <tr key={m.employee_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">
                        {m.first_name} {m.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{m.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {m.total_leads}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {m.new_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {m.contacted_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700">
                        {m.interested_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        {m.qualified_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                        {m.proposal_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                        {m.won_leads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700">
                        {m.lost_leads}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Team Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">
            Active Team Roster ({roster.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Staff members assigned to this sales team.
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roster.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm shrink-0">
                {member.first_name?.[0]}
                {member.last_name?.[0]}
              </div>
              <div className="truncate flex-1">
                <div className="font-semibold text-slate-900 text-sm truncate">
                  {member.first_name} {member.last_name}
                </div>
                <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                  <span className="font-medium text-slate-600">{member.active_leads_count || 0} active leads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
