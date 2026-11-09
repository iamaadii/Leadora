import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  useDashboardOverview,
  useLeadPipeline,
  useLeadTrends,
  useFollowupAnalytics,
  useTeamPerformance,
  useEmployeePerformance,
  useRecentActivity,
} from '../features/dashboard/hooks/useDashboard.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Link } from 'react-router-dom';
import { DateRangeFilter } from '../features/dashboard/components/DateRangeFilter.jsx';
import { DashboardKpiCard } from '../features/dashboard/components/DashboardKpiCard.jsx';
import { PipelineFunnelChart } from '../features/dashboard/components/PipelineFunnelChart.jsx';
import { LeadTrendChart } from '../features/dashboard/components/LeadTrendChart.jsx';
import { FollowupAnalyticsCard } from '../features/dashboard/components/FollowupAnalyticsCard.jsx';
import { TeamPerformanceTable } from '../features/dashboard/components/TeamPerformanceTable.jsx';
import { EmployeePerformanceTable } from '../features/dashboard/components/EmployeePerformanceTable.jsx';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed.jsx';
import {
  Users,
  Sparkles,
  Trophy,
  UserX,
  Clock,
  Plus,
  ShieldCheck,
  Building2,
  Percent,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Common Date Range Filter state
  const [dateFilter, setDateFilter] = useState({
    range: '30d',
    startDate: undefined,
    endDate: undefined,
  });

  // Queries (only active for tenant users)
  const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverview(
    dateFilter,
    { enabled: !isSuperAdmin },
  );

  const { data: pipelineData, isLoading: isPipelineLoading } = useLeadPipeline({
    enabled: !isSuperAdmin,
  });

  const { data: trendsData, isLoading: isTrendsLoading } = useLeadTrends(
    dateFilter,
    { enabled: !isSuperAdmin },
  );

  const { data: followupData, isLoading: isFollowupLoading } = useFollowupAnalytics({
    enabled: !isSuperAdmin,
  });

  const { data: teamPerfData, isLoading: isTeamPerfLoading } = useTeamPerformance({
    enabled: !isSuperAdmin && role !== 'EMPLOYEE',
  });

  const { data: empPerfData, isLoading: isEmpPerfLoading } = useEmployeePerformance(
    dateFilter,
    { enabled: !isSuperAdmin && role !== 'EMPLOYEE' },
  );

  const { data: activityData, isLoading: isActivityLoading } = useRecentActivity(
    { limit: 8 },
    { enabled: !isSuperAdmin },
  );

  const kpis = overviewData?.data?.kpis || {};

  // Description copy tailored to role
  const getRoleDescription = () => {
    switch (role) {
      case 'ADMIN':
        return 'Organization-wide sales overview. Track conversion velocity, rep workload, and customer engagements.';
      case 'MANAGER':
        return 'Team performance dashboard. Monitor your sales teams, representative pipeline health, and pending follow-ups.';
      case 'EMPLOYEE':
        return 'Your personal sales workspace. Manage your pipeline progress, scheduled discovery calls, and touchpoints.';
      default:
        return 'Monitor pipeline metrics, team performance, and customer touchpoints.';
    }
  };

  // If Super Admin, show platform notice
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Platform Super Administrator"
          description="Global platform administration, tenant onboarding, and system infrastructure governance."
          badge={
            <Badge variant="neutral" size="sm" dot>
              PLATFORM ADMIN
            </Badge>
          }
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Tenant Sales Data is Strictly Isolated
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              As a platform-level Super Administrator, private customer sales pipelines, leads,
              and follow-up touchpoints are isolated per tenant compliance rules.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/settings">
              <Button size="sm" variant="outline" leftIcon={Building2}>
                View System Organizations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'User'}`}
        description={getRoleDescription()}
        badge={
          <Badge variant="primary" size="sm" dot>
            {role}
          </Badge>
        }
        actions={
          <div className="flex items-center space-x-2">
            <DateRangeFilter
              selectedRange={dateFilter.range}
              startDate={dateFilter.startDate}
              endDate={dateFilter.endDate}
              onChange={(newRange) => setDateFilter(newRange)}
            />
            <Link to="/leads">
              <Button size="sm" leftIcon={Plus}>
                New Lead
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Leads */}
        <DashboardKpiCard
          title={role === 'EMPLOYEE' ? 'My Active Leads' : role === 'MANAGER' ? 'Team Leads' : 'Total Leads'}
          value={kpis.totalLeads}
          isLoading={isOverviewLoading}
          icon={Users}
          color="blue"
          description="Active pipeline volume"
        />

        {/* New Leads in Period */}
        <DashboardKpiCard
          title="New Leads"
          value={kpis.newLeadsInPeriod}
          isLoading={isOverviewLoading}
          icon={Sparkles}
          color="purple"
          trend={kpis.newLeadsTrend}
          description="Created in period"
        />

        {/* Converted Deals */}
        <DashboardKpiCard
          title="Converted"
          value={kpis.convertedLeads}
          isLoading={isOverviewLoading}
          icon={Trophy}
          color="emerald"
          trend={kpis.conversionsTrend}
          description="Won deals in scope"
        />

        {/* Lost Leads */}
        <DashboardKpiCard
          title="Lost Leads"
          value={kpis.lostLeads}
          isLoading={isOverviewLoading}
          icon={UserX}
          color="rose"
          description="Archived or dropped"
        />

        {/* Overall Win Rate */}
        <DashboardKpiCard
          title="Conversion Rate"
          value={kpis.overallConversionRate !== undefined ? `${kpis.overallConversionRate}%` : '--'}
          isLoading={isOverviewLoading}
          icon={Percent}
          color="indigo"
          description="Won vs total leads"
        />

        {/* Pending Tasks */}
        <DashboardKpiCard
          title="Pending Tasks"
          value={kpis.pendingFollowups}
          isLoading={isOverviewLoading}
          icon={Clock}
          color={kpis.overdueFollowups > 0 ? 'rose' : 'amber'}
          description={
            kpis.overdueFollowups > 0
              ? `${kpis.overdueFollowups} overdue touchpoint(s)`
              : `${kpis.dueTodayFollowups || 0} due today`
          }
        />
      </div>

      {/* Pipeline Analytics & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineFunnelChart
          data={pipelineData?.data}
          isLoading={isPipelineLoading}
        />

        <LeadTrendChart
          data={trendsData?.data}
          isLoading={isTrendsLoading}
        />
      </div>

      {/* Follow-up Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FollowupAnalyticsCard
          data={followupData?.data}
          isLoading={isFollowupLoading}
        />

        <RecentActivityFeed
          activities={activityData?.data || []}
          isLoading={isActivityLoading}
        />
      </div>

      {/* Performance Section (Admin & Manager only) */}
      {role !== 'EMPLOYEE' && (
        <div className="space-y-6">
          <TeamPerformanceTable
            teams={teamPerfData?.data || []}
            isLoading={isTeamPerfLoading}
          />

          <EmployeePerformanceTable
            employees={empPerfData?.data || []}
            isLoading={isEmpPerfLoading}
          />
        </div>
      )}
    </div>
  );
}
