import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Bell, CheckCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';

export function NotificationsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('ALL');

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with lead reassignments, approaching follow-ups, and organization alerts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            filter === 'ALL'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Notifications
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            filter === 'UNREAD'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
        <EmptyState
          icon={Bell}
          title="You're all caught up!"
          description="There are no pending alerts or notifications at this time. We'll alert you when a lead is assigned or a follow-up is due."
        />
      </div>
    </div>
  );
}

