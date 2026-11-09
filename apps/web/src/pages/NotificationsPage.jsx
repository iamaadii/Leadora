import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  Bell,
  CheckCheck,
  Check,
  CalendarClock,
  Target,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../features/notifications/hooks/useNotifications.js';

export function NotificationsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({
    status: filter,
    page,
    limit: 20,
  });

  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success('All notifications marked as read.');
    } catch (_err) {
      toast.error('Failed to mark all notifications as read.');
    }
  };

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await markReadMutation.mutateAsync(id);
    } catch (_err) {
      toast.error('Failed to mark notification as read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkRead(notif.id);
    }

    if (notif.entity_type === 'LEAD' && notif.entity_id) {
      navigate(`/leads/${notif.entity_id}`);
    } else if (notif.entity_type === 'FOLLOW_UP') {
      navigate('/follow-ups');
    }
  };

  const notifications = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LEAD_ASSIGNED':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'FOLLOWUP_DUE_TODAY':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'FOLLOWUP_OVERDUE':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <CalendarClock className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with lead assignments, approaching follow-ups, and organization alerts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={CheckCheck}
              onClick={handleMarkAllRead}
              isLoading={markAllReadMutation.isPending}
            >
              Mark All Read
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setFilter('ALL');
            setPage(1);
          }}
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
          onClick={() => {
            setFilter('UNREAD');
            setPage(1);
          }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            filter === 'UNREAD'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-sm">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
          <EmptyState
            icon={Bell}
            title={filter === 'UNREAD' ? 'No unread notifications' : "You're all caught up!"}
            description={
              filter === 'UNREAD'
                ? 'All notifications have been reviewed and marked as read.'
                : "There are no pending alerts or notifications at this time. We'll alert you when a lead is assigned or a follow-up is due."
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition cursor-pointer hover:bg-slate-50 ${
                !notif.is_read ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
                  {getNotificationIcon(notif.notification_type || notif.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-sm tracking-tight ${
                        !notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed break-words">
                    {notif.message}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>{formatRelativeTime(notif.created_at)}</span>
                    {notif.entity_type && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center space-x-1 font-medium text-blue-600">
                          <span>View {notif.entity_type === 'LEAD' ? 'Lead' : 'Task'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => handleMarkRead(notif.id, e)}
                    title="Mark as read"
                    leftIcon={Check}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
