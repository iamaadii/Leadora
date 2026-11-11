import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';

export function DashboardLayout() {
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isDemo={isDemo}
        />

        {/* Main Layout Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar - Sticky Top-0 Header */}
          <Topbar onToggleMobileSidebar={() => setIsMobileOpen(true)} />

          {/* Page Content Viewport with mobile bottom padding */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setIsMobileOpen(true)} />
    </div>
  );
}

