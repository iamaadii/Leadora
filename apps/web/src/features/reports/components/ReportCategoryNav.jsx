// ReportCategoryNav.jsx
// Phase 9: Report Category Navigation Bar

import React from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Award,
  Users2,
  Clock,
  Building,
  Shield,
} from 'lucide-react';

export const TENANT_CATEGORIES = [
  { id: 'leads', label: 'Lead Pipeline', icon: Users, description: 'Leads volume, stages & reps' },
  { id: 'conversions', label: 'Conversions', icon: TrendingUp, description: 'Win rates & sales velocity' },
  { id: 'lost-leads', label: 'Lost Deals', icon: AlertTriangle, description: 'Loss reasons & drop-offs' },
  { id: 'followups', label: 'Follow-ups', icon: Calendar, description: 'Tasks, deadlines & completion' },
  { id: 'employees', label: 'Sales Reps', icon: Award, description: 'Individual rep performance' },
  { id: 'teams', label: 'Teams', icon: Users2, description: 'Team conversions & workloads' },
  { id: 'activities', label: 'Activity Audit', icon: Clock, description: 'Full event & audit timeline' },
];

export const PLATFORM_CATEGORIES = [
  { id: 'organizations', label: 'Organizations', icon: Building, description: 'Tenant accounts & growth' },
  { id: 'users', label: 'Platform Users', icon: Shield, description: 'User roles & system status' },
];

export function ReportCategoryNav({ activeCategory, onSelectCategory, isSuperAdmin = false }) {
  const categories = isSuperAdmin ? PLATFORM_CATEGORIES : TENANT_CATEGORIES;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs">
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
