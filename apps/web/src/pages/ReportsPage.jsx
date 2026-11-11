// ReportsPage.jsx
// Phase 9: Reports & Data Export Workspace

import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useToast } from '../components/ui/Toast.jsx';
import {
  useReport,
  usePlatformReport,
  useExportReport,
  useExportPlatformReport,
} from '../features/reports/hooks/useReports.js';
import { ReportCategoryNav } from '../features/reports/components/ReportCategoryNav.jsx';
import { ReportFilterBar } from '../features/reports/components/ReportFilterBar.jsx';
import { ReportSummaryCards } from '../features/reports/components/ReportSummaryCards.jsx';
import { ReportCharts } from '../features/reports/components/ReportCharts.jsx';
import { ReportTable } from '../features/reports/components/ReportTable.jsx';
import { ExportDropdown } from '../features/reports/components/ExportDropdown.jsx';

export function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  // Active Category State
  const [activeCategory, setActiveCategory] = useState(
    isSuperAdmin ? 'organizations' : 'leads'
  );

  // Filter & Pagination State (default limit: 15 for fast response & low payload)
  const [filters, setFilters] = useState({
    range: '30d',
    page: 1,
    limit: 15,
  });

  // Query Hooks (Tenant vs Platform)
  const isCustomRangeIncomplete =
    filters.range === 'custom' &&
    (!filters.startDate || !filters.endDate || new Date(filters.startDate) > new Date(filters.endDate));

  const tenantQuery = useReport(activeCategory, filters, {
    enabled: !isSuperAdmin && !isCustomRangeIncomplete,
  });

  const platformQuery = usePlatformReport(activeCategory, filters, {
    enabled: isSuperAdmin && !isCustomRangeIncomplete,
  });

  // Export Mutations
  const tenantExport = useExportReport();
  const platformExport = useExportPlatformReport();

  const activeQuery = isSuperAdmin ? platformQuery : tenantQuery;
  const isExporting = isSuperAdmin ? platformExport.isPending : tenantExport.isPending;

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      range: '30d',
      page: 1,
      limit: 15,
    });
  };

  const handleCategorySelect = (newCategory) => {
    setActiveCategory(newCategory);
    setFilters({
      range: '30d',
      page: 1,
      limit: 15,
    });
  };

  const handleExport = (format) => {
    if (isCustomRangeIncomplete) {
      toast.error('Enter valid start and end dates');
      return;
    }

    if (isDemo) {
      toast.warning('Export is disabled in Demo Mode');
      return;
    }

    if (isSuperAdmin) {
      platformExport.mutate({
        reportType: activeCategory,
        format,
        params: filters,
      });
    } else {
      tenantExport.mutate({
        reportType: activeCategory,
        format,
        params: filters,
      });
    }
  };

  const reportData = activeQuery.data?.data || {};
  const columns = reportData.columns || [];
  const rows = reportData.data || [];
  const summary = reportData.summary || {};
  const pagination = reportData.pagination || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={isSuperAdmin ? 'Platform Reports & Analytics' : 'Reports & Data Export'}
        description={
          isSuperAdmin
            ? 'Centralized platform governance, multi-tenant organization health, and cross-platform user audits.'
            : 'Operational business reports, conversion velocity, lost deal diagnostics, and multi-format data exports.'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' },
        ]}
        actions={
          <ExportDropdown
            onExport={handleExport}
            isExporting={isExporting}
          />
        }
      />

      {/* Category Navigation Tabs */}
      <ReportCategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Dynamic Summary KPI Cards */}
      <ReportSummaryCards
        category={activeCategory}
        summary={summary}
      />

      {/* Visual Analytics & Breakdown Charts */}
      <ReportCharts
        category={activeCategory}
        summary={summary}
        rows={rows}
      />

      {/* Report Filter Toolbar */}
      <ReportFilterBar
        category={activeCategory}
        filters={filters}
        onChangeFilters={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Data Table */}
      <ReportTable
        columns={columns}
        data={rows}
        pagination={pagination}
        isLoading={activeQuery.isLoading}
        onPageChange={(newPage) => handleFilterChange({ page: newPage })}
      />
    </div>
  );
}
export default ReportsPage;
