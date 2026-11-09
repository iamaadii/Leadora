import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';

export function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  const handleExport = () => {
    toast.info('Export functionality will be activated in Phase 9 (Reports & Analytics).');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Analyze team sales velocity, win-loss ratios, revenue forecasts, and channel attribution."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex items-center space-x-2.5">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-40"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="YEAR_TO_DATE">Year to Date</option>
            </Select>

            <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExport}>
              Export
            </Button>
          </div>
        }
      />

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Rep Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Performance by Sales Rep</h3>
          </div>

          <div className="py-8">
            <EmptyState
              icon={BarChart3}
              title="No sales rep records"
              description="Rep performance summaries (conversion rates, deal volume, and revenue) will appear once leads are closed."
              className="border-none shadow-none py-4"
            />
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Lead Source Channel Breakdown</h3>
          </div>

          <div className="py-8">
            <EmptyState
              icon={BarChart3}
              title="No channel attribution data"
              description="Inbound vs outbound channel distribution will be automatically summarized here."
              className="border-none shadow-none py-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

