import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';
import { BrandLogo } from '../components/brand/BrandLogo.jsx';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

export function DemoLayout() {
  const { user, startDemoSession } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!user?.isDemo);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeDemo() {
      if (user?.isDemo) {
        setIsInitializing(false);
        return;
      }

      try {
        setInitError(null);
        await startDemoSession();
        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (err) {
        if (isMounted) {
          setInitError(
            err.response?.data?.message ||
              err.response?.data?.error?.message ||
              'Unable to initialize demo workspace. Please check your network and try again.',
          );
          setIsInitializing(false);
        }
      }
    }

    initializeDemo();

    return () => {
      isMounted = false;
    };
  }, [user?.isDemo, startDemoSession]);

  // Loading Screen while acquiring demo session
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="flex justify-center">
            <BrandLogo variant="full" size="md" theme="dark" showSubtitle subtitleText="Interactive Demo Sandbox" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="w-10 h-10 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Initializing Demo Environment
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Provisioning isolated read-only sample organization, sales leads, pipeline stages, and follow-up activities...
            </p>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-700/60">
            <span>Sample Organization: </span>
            <code className="text-emerald-400 font-mono">leadora-demo</code>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen if demo session could not be established
  if (initError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-rose-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">Demo Initialization Failed</h3>
            <p className="text-xs text-rose-300 leading-relaxed">{initError}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsInitializing(true);
                setInitError(null);
                startDemoSession()
                  .then(() => setIsInitializing(false))
                  .catch((err) => {
                    setInitError(err.message || 'Initialization failed.');
                    setIsInitializing(false);
                  });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Initialization</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Navigation configured for Demo */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isDemo={true}
        />

        {/* Main Layout Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar - Sticky Top-0 Header */}
          <Topbar onToggleMobileSidebar={() => setIsMobileOpen(true)} />

          {/* Page Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}

