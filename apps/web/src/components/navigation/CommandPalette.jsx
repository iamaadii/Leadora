import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import {
  Search,
  LayoutDashboard,
  Target,
  Kanban,
  CalendarClock,
  Activity,
  Users,
  FileBarChart2,
  Settings,
  User,
  PlusCircle,
  ArrowRight,
  X,
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const prefix = isDemo ? '/demo' : '';

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Overview, pipeline KPIs and conversion metrics',
      icon: LayoutDashboard,
      path: prefix || '/dashboard',
      category: 'Pages',
    },
    {
      id: 'leads',
      label: 'Leads Pipeline',
      description: 'Manage prospective customer leads and deals',
      icon: Target,
      path: `${prefix}/leads`,
      category: 'Pages',
    },
    {
      id: 'kanban',
      label: 'Leads Kanban Board',
      description: 'Visual drag & drop sales funnel columns',
      icon: Kanban,
      path: `${prefix}/leads/kanban`,
      category: 'Pages',
    },
    {
      id: 'followups',
      label: 'Follow-ups & Tasks',
      description: 'Scheduled outreach, calls and customer meetings',
      icon: CalendarClock,
      path: `${prefix}/follow-ups`,
      category: 'Pages',
    },
    {
      id: 'activities',
      label: 'Activity Feed',
      description: 'Audit logs, status changes and timeline history',
      icon: Activity,
      path: `${prefix}/activities`,
      category: 'Pages',
    },
    {
      id: 'employees',
      label: 'Employees & Members',
      description: 'Team member directories and sales workload',
      icon: Users,
      path: `${prefix}/employees`,
      category: 'Pages',
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      description: 'Conversion rates, win/loss charts and performance',
      icon: FileBarChart2,
      path: `${prefix}/reports`,
      category: 'Pages',
    },
    {
      id: 'settings',
      label: 'Organization Settings',
      description: 'Company localization, currency and timezone',
      icon: Settings,
      path: '/settings',
      category: 'Pages',
    },
    {
      id: 'profile',
      label: 'User Profile & Security',
      description: 'Account settings, role permissions and password',
      icon: User,
      path: '/profile',
      category: 'Pages',
    },
  ];

  const quickActions = [
    {
      id: 'action-new-lead',
      label: 'Create New Lead',
      description: 'Add a new prospect to your sales pipeline',
      icon: PlusCircle,
      action: () => {
        navigate(`${prefix}/leads?create=true`);
      },
      category: 'Quick Actions',
    },
    {
      id: 'action-schedule-followup',
      label: 'Schedule Follow-up',
      description: 'Plan upcoming call, email or demo meeting',
      icon: CalendarClock,
      action: () => {
        navigate(`${prefix}/follow-ups?create=true`);
      },
      category: 'Quick Actions',
    },
  ];

  const allItems = [...navigationItems, ...quickActions];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredItems.length - 1) : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 p-3 sm:p-6 md:p-12 flex items-start justify-center animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Card */}
      <div
        onKeyDown={handleKeyDown}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col z-10 mt-4 sm:mt-12 animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, actions, or jump to..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-blue-600 translate-x-0.5'
                        : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">
                ↓
              </kbd>{' '}
              navigate
            </span>
            <span>&bull;</span>
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">
                ↵
              </kbd>{' '}
              select
            </span>
          </div>
          <span>Command Palette</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
}
