// useReports.js
// Phase 9: React Query Hooks for Reports & Exports

import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service.js';
import { useToast } from '../../../components/ui/Toast.jsx';

export const REPORT_QUERY_KEYS = {
  all: ['reports'],
  tenant: (reportType, params) => ['reports', 'tenant', reportType, params],
  platform: (reportType, params) => ['reports', 'platform', reportType, params],
};

/**
 * Hook to fetch paginated tenant report data
 */
export function useReport(reportType, params = {}, options = {}) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.tenant(reportType, params),
    queryFn: () => reportsService.getReport(reportType, params),
    enabled: Boolean(reportType) && (options.enabled !== false),
    staleTime: 60 * 1000, // 1 minute fresh cache
    keepPreviousData: true,
    ...options,
  });
}

/**
 * Hook to trigger tenant report exports (CSV, Excel, PDF)
 */
export function useExportReport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportType, format, params }) => {
      return await reportsService.exportReport(reportType, format, params);
    },
    onSuccess: (filename) => {
      toast.success(`Report exported successfully: ${filename}`);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to export report';
      toast.error(msg);
    },
  });
}

/**
 * Hook to fetch platform report data (Super Admin)
 */
export function usePlatformReport(reportType, params = {}, options = {}) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.platform(reportType, params),
    queryFn: () => reportsService.getPlatformReport(reportType, params),
    enabled: Boolean(reportType) && (options.enabled !== false),
    staleTime: 60 * 1000,
    keepPreviousData: true,
    ...options,
  });
}

/**
 * Hook to trigger platform report exports
 */
export function useExportPlatformReport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportType, format, params }) => {
      return await reportsService.exportPlatformReport(reportType, format, params);
    },
    onSuccess: (filename) => {
      toast.success(`Platform report exported successfully: ${filename}`);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to export report';
      toast.error(msg);
    },
  });
}
