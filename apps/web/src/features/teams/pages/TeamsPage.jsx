import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useTeams, useTeamMutations } from '../hooks/useTeams.js';
import { TeamCard } from '../components/TeamCard.jsx';
import { CreateTeamModal } from '../components/CreateTeamModal.jsx';
import { EditTeamModal } from '../components/EditTeamModal.jsx';
import { ManageMembersModal } from '../components/ManageMembersModal.jsx';
import {
  Users2,
  Plus,
  Search,
  Layers,
  Target,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function TeamsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [managingMembersTeam, setManagingMembersTeam] = useState(null);

  // Query teams
  const { data, isLoading } = useTeams({
    search: search || undefined,
    isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
    page,
    limit: 12,
  });

  const {
    createTeam,
    isCreating,
    updateTeam,
    isUpdating,
    deactivateTeam,
    activateTeam,
  } = useTeamMutations();

  const teams = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  // Calculate summary stats
  const totalTeams = meta.total;
  const activeTeamsCount = teams.filter((t) => t.is_active).length;
  const totalMembers = teams.reduce((acc, t) => acc + (t.member_count || 0), 0);
  const totalTeamLeads = teams.reduce((acc, t) => acc + (t.active_leads_count || 0), 0);

  const handleToggleActive = async (team) => {
    if (team.is_active) {
      if (window.confirm(`Are you sure you want to deactivate team "${team.name}"? Active members will be unassigned.`)) {
        await deactivateTeam(team.id);
      }
    } else {
      await activateTeam(team.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Teams Management' : 'My Managed Teams'}
        description={
          isAdmin
            ? 'Organize staff into sales teams, designate managers, and monitor team performance.'
            : 'View your sales teams, member rosters, and lead distribution.'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teams' },
        ]}
        actions={
          isAdmin && (
            <Button
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Team
            </Button>
          )
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Teams</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalTeams}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Teams</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{activeTeamsCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Members</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalMembers}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Team Leads</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalTeamLeads}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search teams by name..."
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <Select
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200/80">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 shadow-xs">
          <EmptyState
            icon={Users2}
            title="No teams found"
            description={
              search
                ? 'Try adjusting your search or filters.'
                : isAdmin
                ? 'Create your first sales team to start organizing employees and leads.'
                : 'You are not currently assigned as a manager to any teams.'
            }
            action={
              isAdmin && !search ? (
                <Button
                  size="sm"
                  leftIcon={Plus}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Create Team
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isAdmin={isAdmin}
                onViewDetails={(t) => navigate(`/teams/${t.id}`)}
                onManageMembers={(t) => setManagingMembersTeam(t)}
                onEdit={(t) => setEditingTeam(t)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {teams.length} of {meta.total} teams
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <CreateTeamModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={createTeam}
            isSubmitting={isCreating}
          />

          <EditTeamModal
            isOpen={Boolean(editingTeam)}
            onClose={() => setEditingTeam(null)}
            team={editingTeam}
            onSubmit={updateTeam}
            isSubmitting={isUpdating}
          />

          <ManageMembersModal
            isOpen={Boolean(managingMembersTeam)}
            onClose={() => setManagingMembersTeam(null)}
            team={managingMembersTeam}
          />
        </>
      )}
    </div>
  );
}
