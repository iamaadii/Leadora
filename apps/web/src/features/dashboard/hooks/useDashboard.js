import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service.js';

export function useDashboardOverview(params = {}, options = {}) {
  return useQuery({
    queryKey: ['dashboard-overview', params],
    queryFn: () => dashboardService.getOverview(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useLeadPipeline(options = {}) {
  return useQuery({
    queryKey: ['dashboard-lead-pipeline'],
    queryFn: () => dashboardService.getLeadPipeline(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useLeadTrends(params = {}, options = {}) {
  return useQuery({
    queryKey: ['dashboard-lead-trends', params],
    queryFn: () => dashboardService.getLeadTrends(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useFollowupAnalytics(options = {}) {
  return useQuery({
    queryKey: ['dashboard-followup-analytics'],
    queryFn: () => dashboardService.getFollowupAnalytics(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useTeamPerformance(options = {}) {
  return useQuery({
    queryKey: ['dashboard-team-performance'],
    queryFn: () => dashboardService.getTeamPerformance(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useEmployeePerformance(params = {}, options = {}) {
  return useQuery({
    queryKey: ['dashboard-employee-performance', params],
    queryFn: () => dashboardService.getEmployeePerformance(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useRecentActivity(params = {}, options = {}) {
  return useQuery({
    queryKey: ['dashboard-recent-activity', params],
    queryFn: () => dashboardService.getRecentActivity(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

