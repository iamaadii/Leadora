import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Activity, RefreshCw } from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';

export function ActivitiesPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState('ALL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Feed"
        description="Chronological log of customer interactions, stage changes, employee notes, and milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Activities' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => toast.info('Activity stream refreshed.', 'Feed Updated')}
          >
            Refresh Feed
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter Timeline
        </span>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-48"
        >
          <option value="ALL">All Activities</option>
          <option value="NOTE_ADDED">Notes Added</option>
          <option value="STATUS_CHANGED">Stage Changes</option>
          <option value="CALL_LOGGED">Calls Logged</option>
          <option value="EMAIL_SENT">Emails</option>
          <option value="FOLLOWUP_CREATED">Tasks Scheduled</option>
        </Select>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
        <EmptyState
          icon={Activity}
          title="No recorded activities"
          description="Interaction history, pipeline changes, and sales notes will appear in this timeline as customer deals progress."
        />
      </div>
    </div>
  );
}
