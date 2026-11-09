import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsService } from '../services/followups.service.js';

export function useFollowups(params = {}) {
  return useQuery({
    queryKey: ['followups', params],
    queryFn: () => followupsService.getFollowups(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useFollowup(id) {
  return useQuery({
    queryKey: ['followup', id],
    queryFn: () => followupsService.getFollowupById(id),
    enabled: Boolean(id),
  });
}

export function useFollowupSummary() {
  return useQuery({
    queryKey: ['followups-summary'],
    queryFn: () => followupsService.getSummary(),
    staleTime: 60 * 1000,
  });
}

export function useLeadFollowups(leadId) {
  return useQuery({
    queryKey: ['lead-followups', leadId],
    queryFn: () => followupsService.getLeadFollowups(leadId),
    enabled: Boolean(leadId),
  });
}

export function useCreateFollowup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => followupsService.createFollowup(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups-summary'] });
      const targetLead = variables.leadId || variables.lead_id;
      if (targetLead) {
        queryClient.invalidateQueries({ queryKey: ['lead-followups', targetLead] });
        queryClient.invalidateQueries({ queryKey: ['lead-activities', targetLead] });
        queryClient.invalidateQueries({ queryKey: ['lead', targetLead] });
      }
    },
  });
}

export function useUpdateFollowup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => followupsService.updateFollowup(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followup', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups-summary'] });
      const leadId = data?.data?.lead_id;
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead-followups', leadId] });
        queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      }
    },
  });
}

export function useCompleteFollowup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completionNotes }) =>
      followupsService.completeFollowup(id, completionNotes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followup', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups-summary'] });
      const leadId = data?.data?.lead_id;
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead-followups', leadId] });
        queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      }
    },
  });
}

export function useCancelFollowup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => followupsService.cancelFollowup(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followup', id] });
      queryClient.invalidateQueries({ queryKey: ['followups-summary'] });
      const leadId = data?.data?.lead_id;
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead-followups', leadId] });
        queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      }
    },
  });
}
