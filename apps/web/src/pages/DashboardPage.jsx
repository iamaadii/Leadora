import React from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from './dashboard/components/StatCard.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  Trophy,
  UserX,
  Clock,
  PieChart,
  TrendingUp,
  Activity,
  CalendarCheck,
  Plus,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'User'}`}
        description="Monitor your sales pipeline metrics, upcoming follow-ups, and customer touchpoints in real time."
        badge={
          <Badge variant="primary" size="sm" dot>
            {user?.role || 'EMPLOYEE'}
          </Badge>
        }
        actions={
          <Link to="/leads">
            <Button size="sm" leftIcon={Plus}>
              New Lead
            </Button>
          </Link>
        }
      />

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          empty
          icon={Users}
          color="blue"
          description="Pipeline lead volume"
        />
        <StatCard
          title="New Leads"
          empty
          icon={Sparkles}
          color="purple"
          description="Awaiting initial contact"
        />
        <StatCard
          title="Converted"
          empty
          icon={Trophy}
          color="emerald"
          description="Deals successfully won"
        />
        <StatCard
          title="Lost Leads"
          empty
          icon={UserX}
          color="rose"
          description="Archived or dropped"
        />
        <StatCard
          title="Pending Tasks"
          empty
          icon={Clock}
          color="amber"
          description="Scheduled follow-ups"
        />
      </div>

      {/* Analytics & Pipeline Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Leads by Status</h3>
            </div>
            <Badge variant="neutral" size="sm">
              Current Period
            </Badge>
          </div>

          <div className="py-8">
            <EmptyState
              icon={PieChart}
              title="No pipeline data available"
              description="Lead status breakdown will appear here once leads are added to your organization."
              className="border-none shadow-none py-4"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Stages: New &bull; Contacted &bull; Qualified &bull; Proposal &bull; Won</span>
            <Link to="/leads" className="text-blue-600 hover:text-blue-700 font-medium">
              View Leads &rarr;
            </Link>
          </div>
        </div>

        {/* Monthly Lead Trends Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Monthly Lead Trends</h3>
            </div>
            <Badge variant="neutral" size="sm">
              Last 6 Months
            </Badge>
          </div>

          <div className="py-8">
            <EmptyState
              icon={TrendingUp}
              title="No trend data recorded"
              description="Monthly acquisition trajectories will be automatically charted as leads are generated."
              className="border-none shadow-none py-4"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tracking monthly velocity & conversion rate</span>
            <Link to="/reports" className="text-blue-600 hover:text-blue-700 font-medium">
              Reports &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Feed & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            </div>
            <Link to="/activities" className="text-xs text-blue-600 hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="py-6">
            <EmptyState
              icon={Activity}
              title="No recent activity logged"
              description="System audit logs, notes, and lead transitions will appear here in chronological order."
              className="border-none shadow-none py-4"
            />
          </div>
        </div>

        {/* Upcoming Follow-ups Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Follow-ups</h3>
            </div>
            <Link to="/follow-ups" className="text-xs text-blue-600 hover:underline font-medium">
              Schedule Task
            </Link>
          </div>

          <div className="py-6">
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming follow-ups scheduled"
              description="Keep sales conversations warm by scheduling phone calls, meetings, or emails."
              className="border-none shadow-none py-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
