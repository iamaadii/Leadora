import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
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
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {currentTitle}
          </h2>
          {user?.organization && (
            <span className="hidden lg:inline-flex items-center space-x-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
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
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-md">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {recentNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No recent notifications
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationItemClick(n)}
                      className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer flex items-start space-x-2.5 ${
                        !n.is_read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                        {getNotificationIcon(n.notification_type || n.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markReadMutation.mutate(n.id);
                              }}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
                <Link
                  to={isDemo ? '/demo/notifications' : '/notifications'}
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 block py-1"
                >
                  View all notifications
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
              className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
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
