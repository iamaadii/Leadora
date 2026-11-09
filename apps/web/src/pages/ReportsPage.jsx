// ReportsPage.jsx
// Phase 9: Reports & Data Export Workspace

import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  useReport,
  usePlatformReport,
  useExportReport,
  useExportPlatformReport,
} from '../features/reports/hooks/useReports.js';
import { ReportCategoryNav } from '../features/reports/components/ReportCategoryNav.jsx';
import { ReportFilterBar } from '../features/reports/components/ReportFilterBar.jsx';
import { ReportSummaryCards } from '../features/reports/components/ReportSummaryCards.jsx';
import { ReportTable } from '../features/reports/components/ReportTable.jsx';
import { ExportDropdown } from '../features/reports/components/ExportDropdown.jsx';

export function ReportsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Active Category State
  const [activeCategory, setActiveCategory] = useState(
    isSuperAdmin ? 'organizations' : 'leads'
  );

  // Filter & Pagination State
  const [filters, setFilters] = useState({
    range: '30d',
    page: 1,
    limit: 50,
  });

  // Query Hooks (Tenant vs Platform)
  const tenantQuery = useReport(activeCategory, filters, {
    enabled: !isSuperAdmin,
  });

  const platformQuery = usePlatformReport(activeCategory, filters, {
    enabled: isSuperAdmin,
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
      limit: 50,
    });
  };

  const handleCategorySelect = (newCategory) => {
    setActiveCategory(newCategory);
    setFilters({
      range: '30d',
      page: 1,
      limit: 50,
    });
  };

  const handleExport = (format) => {
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
