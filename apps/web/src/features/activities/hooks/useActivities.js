import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.service.js';

export const ACTIVITIES_QUERY_KEY = ['activities'];

export function useActivities(params = {}, options = {}) {
  return useQuery({
    queryKey: [...ACTIVITIES_QUERY_KEY, params],
    queryFn: () => activitiesService.getActivities(params),
    ...options,
  });
}
