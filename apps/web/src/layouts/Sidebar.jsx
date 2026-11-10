import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import {
  LayoutDashboard,
  Target,
  Users,
  Users2,
  CalendarClock,
  Activity,
  Bell,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  User,
} from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip.jsx';
import { BrandLogo } from '../components/brand/BrandLogo.jsx';

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Organizations',
    href: '/platform/organizations',
    icon: Building2,
    roles: ['SUPER_ADMIN'],
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Target,
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users2,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Follow-ups',
    href: '/follow-ups',
    icon: CalendarClock,
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: Activity,
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export const DEMO_NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/demo',
    icon: LayoutDashboard,
  },
  {
    name: 'Leads',
    href: '/demo/leads',
    icon: Target,
  },
  {
    name: 'Employees',
    href: '/demo/employees',
    icon: Users,
  },
  {
    name: 'Teams',
    href: '/demo/teams',
    icon: Users2,
  },
  {
    name: 'Follow-ups',
    href: '/demo/follow-ups',
    icon: CalendarClock,
  },
  {
    name: 'Activities',
    href: '/demo/activities',
    icon: Activity,
  },
  {
    name: 'Notifications',
    href: '/demo/notifications',
    icon: Bell,
  },
  {
    name: 'Reports',
    href: '/demo/reports',
    icon: BarChart3,
  },
];

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isDemo: isDemoProp,
}) {
  const { user } = useAuth();
  const isDemo = Boolean(isDemoProp || user?.isDemo || user?.role === 'DEMO');
  const userRole = isDemo ? 'DEMO' : user?.role || 'EMPLOYEE';

  const organizationName = isDemo
    ? 'Demo Workspace'
    : user?.organization?.name ||
      user?.organizationName ||
      (userRole === 'SUPER_ADMIN' ? 'Platform Administration' : 'Leadora Workspace');

  // Filter navigation items based on current authenticated role or demo status
  const visibleNavItems = isDemo
    ? DEMO_NAVIGATION_ITEMS
    : NAVIGATION_ITEMS.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-200/80 shrink-0 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <Link
          to={isDemo ? '/demo' : '/dashboard'}
          className="flex items-center overflow-hidden group min-w-0"
          onClick={() => setIsMobileOpen?.(false)}
        >
          {isCollapsed ? (
            <BrandLogo variant="icon" size="md" />
          ) : (
            <BrandLogo
              variant="full"
              size="sm"
              showSubtitle
              subtitleText={organizationName}
            />
          )}
        </Link>

        {/* Mobile close button */}
        {setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 ml-2"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        aria-label="Sidebar navigation"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin"
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;

          const navLink = (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/demo' || item.href === '/dashboard'}
              aria-label={item.name}
              onClick={() => setIsMobileOpen?.(false)}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isCollapsed
                    ? 'justify-center p-2.5'
                    : 'px-3 py-2.5 space-x-3'
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`shrink-0 ${
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                    } ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.name} content={item.name} position="right" className="w-full justify-center">
                {navLink}
              </Tooltip>
            );
          }

          return navLink;
        })}
      </nav>

      {/* Bottom Profile Preview & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2 shrink-0">
        {/* User Mini Summary */}
        {isCollapsed ? (
          <Tooltip content="My Profile" position="right" className="w-full justify-center">
            <Link
              to="/profile"
              onClick={() => setIsMobileOpen?.(false)}
              className="flex items-center justify-center rounded-xl p-2 transition hover:bg-white border border-transparent hover:border-slate-200"
              aria-label="My Profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.firstName?.[0] || <User className="w-4 h-4" />}
              </div>
            </Link>
          </Tooltip>
        ) : (
          <Link
            to="/profile"
            onClick={() => setIsMobileOpen?.(false)}
            className="flex items-center rounded-xl p-2 transition hover:bg-white border border-transparent hover:border-slate-200 space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.firstName?.[0] || <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                <Shield className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">{userRole}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden lg:flex justify-end">
          {isCollapsed ? (
            <Tooltip content="Expand sidebar" position="right" className="w-full justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white hover:border hover:border-slate-200 transition text-xs font-medium"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white hover:border hover:border-slate-200 transition text-xs font-medium space-x-1"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] text-slate-500">Collapse</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block transition-all duration-200 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed inset-y-0 left-0 z-30 transition-all duration-200">
          <div className={`h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {sidebarContent}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Slide-in */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

