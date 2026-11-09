import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { BrandLogo } from '../components/brand/BrandLogo.jsx';
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Building,
  Check,
  CheckCheck,
  Target,
  Clock,
  AlertCircle,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
  useUnreadNotificationCount,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../features/notifications/hooks/useNotifications.js';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads Pipeline',
  '/leads/kanban': 'Leads Kanban',
  '/employees': 'Employees & Teams',
  '/teams': 'Team Management',
  '/follow-ups': 'Follow-ups & Tasks',
  '/activities': 'Activity Feed',
  '/notifications': 'Notifications',
  '/reports': 'Analytics & Reports',
  '/settings': 'Organization Settings',
  '/platform/organizations': 'Platform Organizations',
  '/profile': 'User Profile',
  '/demo': 'Demo Dashboard',
  '/demo/leads': 'Leads Pipeline (Demo)',
  '/demo/leads/kanban': 'Leads Kanban (Demo)',
  '/demo/employees': 'Employees & Teams (Demo)',
  '/demo/teams': 'Team Management (Demo)',
  '/demo/follow-ups': 'Follow-ups & Tasks (Demo)',
  '/demo/activities': 'Activity Feed (Demo)',
  '/demo/notifications': 'Notifications (Demo)',
  '/demo/reports': 'Analytics & Reports (Demo)',
};

function formatRelativeTime(timestamp) {
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
}

export function Topbar({ onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { data: countData } = useUnreadNotificationCount();
  const unreadCount = countData?.data?.unreadCount || 0;

  const { data: notifData } = useNotifications(
    { limit: 5, status: 'ALL' },
    { enabled: isNotifOpen },
  );
  const recentNotifications = notifData?.data || [];

  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const currentTitle = ROUTE_TITLES[location.pathname] || (isDemo ? 'Leadora Demo' : 'Leadora');

  const handleLogout = async () => {
    await logout();
    navigate(isDemo ? '/' : '/login', { replace: true });
  };

  const handleNotificationItemClick = async (notif) => {
    if (!notif.is_read) {
      await markReadMutation.mutateAsync(notif.id);
    }
    setIsNotifOpen(false);
    if (notif.entity_type === 'LEAD' && notif.entity_id) {
      navigate(isDemo ? `/demo/leads/${notif.entity_id}` : `/leads/${notif.entity_id}`);
    } else if (notif.entity_type === 'FOLLOW_UP') {
      navigate(isDemo ? '/demo/follow-ups' : '/follow-ups');
    } else {
      navigate(isDemo ? '/demo/notifications' : '/notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LEAD_ASSIGNED':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'FOLLOWUP_DUE_TODAY':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'FOLLOWUP_OVERDUE':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <CalendarClock className="w-4 h-4 text-indigo-600" />;
    }
  };

  const userRole = user?.role || 'EMPLOYEE';
  const canAccessSettings = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle, Mobile Brand Logo & Page Title */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile & Tablet Brand Identity */}
        <Link
          to={isDemo ? '/demo' : '/dashboard'}
          className="lg:hidden flex items-center space-x-2 shrink-0 group focus:outline-hidden"
          aria-label="Go to dashboard"
        >
          <BrandLogo variant="icon" size="xs" />
          <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden xs:inline">
            Lead<span className="text-blue-600">ora</span>
          </span>
        </Link>

        {/* Divider on mobile */}
        <div className="hidden xs:block lg:hidden h-4 w-px bg-slate-200" />

        <div className="flex items-center space-x-2 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
            {currentTitle}
          </h2>
          {user?.organization && (
            <span className="hidden lg:inline-flex items-center space-x-1 text-xs text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Building className="w-3 h-3 text-slate-400" />
              <span>{user.organization.name || user.organizationName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Notification Icon & User Profile Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dynamic Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative p-2.5 rounded-xl transition duration-150 focus:outline-hidden ${
              isNotifOpen
                ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {unreadCount > 0 ? (
              <>
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white shadow-xs z-10">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] rounded-full bg-rose-500 animate-ping opacity-60" />
              </>
            ) : (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div
              className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              role="dialog"
              aria-label="Notifications popover"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Notifications
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => markAllReadMutation.mutate()}
                      disabled={markAllReadMutation.isPending}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition inline-flex items-center space-x-1"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full">
                      Up to date
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                {recentNotifications.length === 0 ? (
                  <div className="py-10 px-5 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100/90 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                      <Bell className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">You&apos;re all caught up!</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                      No new notifications at this time. We will alert you when leads or follow-ups need attention.
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((n) => {
                    const isUnread = !n.is_read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationItemClick(n)}
                        className={`p-3.5 text-left hover:bg-slate-50/90 transition cursor-pointer flex items-start space-x-3 group relative ${
                          isUnread ? 'bg-blue-50/40 border-l-3 border-blue-600' : 'border-l-3 border-transparent'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isUnread ? 'bg-white shadow-xs border border-blue-100' : 'bg-slate-100'
                          }`}
                        >
                          {getNotificationIcon(n.notification_type || n.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs truncate ${
                                isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                              }`}
                            >
                              {n.title}
                            </p>
                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markReadMutation.mutate(n.id);
                                }}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition shrink-0"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                            {n.message}
                          </p>

                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium mt-1.5">
                            <span>{formatRelativeTime(n.created_at)}</span>
                            {n.entity_type && (
                              <>
                                <span>&bull;</span>
                                <span className="font-semibold text-blue-600">
                                  {n.entity_type === 'LEAD' ? 'Lead' : 'Follow-up'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200/80 p-2.5 bg-slate-50/90">
                <Link
                  to={isDemo ? '/demo/notifications' : '/notifications'}
                  onClick={() => setIsNotifOpen(false)}
                  className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 transition flex items-center justify-center space-x-1.5"
                >
                  <span>View all notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={({ isOpen }) => (
            <button
              type="button"
              className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition focus:outline-hidden"
              aria-label="User profile dropdown"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {userRole}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        >
          {/* User Details Header inside Dropdown */}
          <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
            <div className="mt-1.5 flex items-center space-x-1.5">
              <Badge variant="primary" size="sm">
                {userRole}
              </Badge>
              {user?.organization?.slug && (
                <span className="text-[10px] text-slate-400 font-mono">
                  @{user.organization.slug}
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <DropdownItem
              icon={UserIcon}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </DropdownItem>

            {canAccessSettings && (
              <DropdownItem
                icon={Settings}
                onClick={() => navigate('/settings')}
              >
                Settings
              </DropdownItem>
            )}
          </div>

          <DropdownDivider />

          <div className="py-1">
            <DropdownItem
              icon={LogOut}
              danger
              onClick={handleLogout}
            >
              Sign Out
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
