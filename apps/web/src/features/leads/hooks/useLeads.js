import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '../services/leads.service.js';

export function useLeads(params = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsService.getLeads(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getLeadById(id),
    enabled: Boolean(id),
  });
}

export function useLeadActivities(id, params = {}) {
  return useQuery({
    queryKey: ['lead-activities', id, params],
    queryFn: () => leadsService.getLeadActivities(id, params),
    enabled: Boolean(id),
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: ['lead-assignees'],
    queryFn: () => leadsService.getAssignees(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => leadsService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => leadsService.updateLead(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.id] });
    },
  });
}

export function useArchiveLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => leadsService.archiveLead(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}

export function useRestoreLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => leadsService.restoreLead(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}
