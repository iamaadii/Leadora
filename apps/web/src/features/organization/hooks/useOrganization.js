import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organization.service.js';

export const ORG_SETTINGS_KEY = ['organization', 'settings'];

export function useOrganizationSettings(options = {}) {
  return useQuery({
    queryKey: ORG_SETTINGS_KEY,
    queryFn: () => organizationService.getSettings(),
    ...options,
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => organizationService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_SETTINGS_KEY });
    },
  });
}
