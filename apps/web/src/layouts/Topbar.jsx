import React from 'react';
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
} from 'lucide-react';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads Pipeline',
  '/employees': 'Employees & Teams',
  '/follow-ups': 'Follow-ups & Tasks',
  '/activities': 'Activity Feed',
  '/notifications': 'Notifications',
  '/reports': 'Analytics & Reports',
  '/settings': 'Organization Settings',
  '/profile': 'User Profile',
};

export function Topbar({ onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'CRM';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
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
        {/* Notification Bell Button */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Link>

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

