import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService } from '../services/teams.service.js';
import { useToast } from '../../../components/ui/Toast.jsx';

export const TEAM_QUERY_KEYS = {
  all: ['teams'],
  list: (params) => ['teams', 'list', params],
  myTeams: (params) => ['teams', 'my-teams', params],
  detail: (id) => ['teams', 'detail', id],
  roster: (id) => ['teams', 'roster', id],
  workload: (id) => ['teams', 'workload', id],
};

export function useTeams(params = {}) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.list(params),
    queryFn: () => teamsService.getTeams(params),
    keepPreviousData: true,
  });
}

export function useMyTeams(params = {}) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.myTeams(params),
    queryFn: () => teamsService.getMyTeams(params),
    keepPreviousData: true,
  });
}

export function useTeam(id) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.detail(id),
    queryFn: () => teamsService.getTeamById(id),
    enabled: Boolean(id),
  });
}

export function useTeamRoster(id) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.roster(id),
    queryFn: () => teamsService.getTeamRoster(id),
    enabled: Boolean(id),
  });
}

export function useTeamWorkload(id) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.workload(id),
    queryFn: () => teamsService.getTeamWorkload(id),
    enabled: Boolean(id),
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const createTeamMutation = useMutation({
    mutationFn: (data) => teamsService.createTeam(data),
    onSuccess: (data) => {
      invalidate();
      toast.success(`Team "${data.data.name}" created successfully!`, 'Team Created');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to create team',
        'Team Creation Error',
      );
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => teamsService.updateTeam(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Team updated successfully', 'Team Updated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to update team',
        'Update Error',
      );
    },
  });

  const deactivateTeamMutation = useMutation({
    mutationFn: (id) => teamsService.deactivateTeam(id),
    onSuccess: () => {
      invalidate();
      toast.success('Team deactivated and active members unassigned', 'Deactivated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to deactivate team',
        'Error',
      );
    },
  });

  const activateTeamMutation = useMutation({
    mutationFn: (id) => teamsService.activateTeam(id),
    onSuccess: () => {
      invalidate();
      toast.success('Team activated successfully', 'Activated');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to activate team',
        'Error',
      );
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }) => teamsService.addMember(teamId, employeeId),
    onSuccess: () => {
      invalidate();
      toast.success('Member assigned to team successfully', 'Member Added');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to add member to team',
        'Membership Error',
      );
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }) => teamsService.removeMember(teamId, employeeId),
    onSuccess: () => {
      invalidate();
      toast.success('Member removed from team', 'Member Removed');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to remove member',
        'Error',
      );
    },
  });

  return {
    createTeam: createTeamMutation.mutateAsync,
    isCreating: createTeamMutation.isPending,
    updateTeam: updateTeamMutation.mutateAsync,
    isUpdating: updateTeamMutation.isPending,
    deactivateTeam: deactivateTeamMutation.mutateAsync,
    isDeactivating: deactivateTeamMutation.isPending,
    activateTeam: activateTeamMutation.mutateAsync,
    isActivating: activateTeamMutation.isPending,
    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
  };
}

