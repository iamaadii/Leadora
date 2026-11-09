import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../services/platform.service.js';

export const PLATFORM_ORGS_KEY = ['platform', 'organizations'];

export function usePlatformOrganizations(params = {}, options = {}) {
  return useQuery({
    queryKey: [...PLATFORM_ORGS_KEY, params],
    queryFn: () => platformService.getOrganizations(params),
    ...options,
  });
}

export function useProvisionOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => platformService.provisionOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_ORGS_KEY });
    },
  });
}

export function useUpdateOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => platformService.updateOrganizationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_ORGS_KEY });
    },
  });
}
