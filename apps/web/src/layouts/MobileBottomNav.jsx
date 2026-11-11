import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, CalendarClock, Activity, Menu } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth.js';

export function MobileBottomNav({ onOpenMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const prefix = isDemo ? '/demo' : '';

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: prefix || '/dashboard',
      exact: true,
    },
    {
      label: 'Leads',
      icon: Target,
      to: `${prefix}/leads`,
    },
    {
      label: 'Follow-ups',
      icon: CalendarClock,
      to: `${prefix}/follow-ups`,
    },
    {
      label: 'Activities',
      icon: Activity,
      to: `${prefix}/activities`,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-1.5 flex items-center justify-around safe-area-inset-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-150 active:scale-95 min-w-[56px] ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-none tracking-tight">
              {item.label}
            </span>
          </NavLink>
        );
      })}

      {/* Menu / More Drawer trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-150 active:scale-95 min-w-[56px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
      >
        <Menu className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] mt-0.5 leading-none tracking-tight">More</span>
      </button>
    </nav>
  );
}

MobileBottomNav.propTypes = {
  onOpenMenu: PropTypes.func.isRequired,
};

