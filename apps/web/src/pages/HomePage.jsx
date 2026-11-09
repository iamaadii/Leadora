import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { getApiHealth, getDbHealth } from '../services/api.js';
import { Link } from 'react-router-dom';
import {
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Activity,
  Terminal,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';

export function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [dbResult, setDbResult] = useState(null);
  const [backendError, setBackendError] = useState(null);

  const testConnectivity = async () => {
    setLoading(true);
    setBackendError(null);
    setApiResult(null);
    setDbResult(null);

    // 1. Test Backend API
    try {
      const apiData = await getApiHealth();
      setApiResult(apiData);
    } catch (apiErr) {
      const errorMsg =
        apiErr.response?.data?.message ||
        apiErr.response?.data?.error?.message ||
        (apiErr.response?.status === 500 || apiErr.response?.status === 503
          ? 'Backend Express server is not running on http://localhost:5000. Please start it using "npm run dev:api" or "npm run dev".'
          : apiErr.message || 'Failed to reach backend server');

      setBackendError(errorMsg);
      setLoading(false);
      return;
    }

    // 2. Test PostgreSQL Database
    try {
      const dbData = await getDbHealth();
      setDbResult(dbData);
    } catch (dbErr) {
      setDbResult({
        success: false,
        error: dbErr.response?.data?.error || {
          message: 'PostgreSQL database is currently disconnected. Make sure Docker container is running.',
          details: dbErr.message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Leadora
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          Every Lead. Every Opportunity. One Platform. Multi-tenant Business CRM & Lead Management.
        </p>
      </div>

      {/* Authenticated User Session Card */}
      {isAuthenticated && user ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
            <div className="flex items-center space-x-2.5 text-emerald-900 font-semibold text-sm">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Active Authenticated Session</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
              {user.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Logged-in User:</span>
              <strong className="text-slate-900">{user.firstName} {user.lastName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Email:</span>
              <strong className="text-slate-900 font-mono">{user.email}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Organization:</span>
              <strong className="text-slate-900">
                {user.organizationName ? `${user.organizationName} (${user.organizationSlug})` : 'Platform Global (Super Admin)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">User ID:</span>
              <span className="text-slate-600 font-mono text-[11px] truncate block">{user.id}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
            <span className="text-emerald-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>In-memory JWT access token active</span>
            </span>
            <button
              onClick={logout}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        /* Sign In Callout Banner if not authenticated */
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900">Sign in to test Phase 3 Auth</h3>
              <p className="text-xs text-blue-700">Test login with Admin, Manager, Employee or Super Admin</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Go to Login
          </Link>
        </div>
      )}

      {/* Connectivity Diagnostic Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">System Health & Connectivity</h2>
              <p className="text-xs text-slate-500">Test Express API and PostgreSQL connection</p>
            </div>
          </div>

          <button
            onClick={testConnectivity}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing...' : 'Test Backend Connectivity'}</span>
          </button>
        </div>

        {/* Backend Offline Error Banner */}
        {backendError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-800">Backend Server Unreachable</p>
                <p className="mt-0.5">{backendError}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-rose-200/60 flex items-center space-x-2 text-rose-800 font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
              <span>npm run dev:api</span>
              <span className="text-rose-500">or</span>
              <span>npm run dev</span>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="space-y-3">
          {/* Backend Express API */}
          <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2 text-slate-700">
              <Server className="w-4 h-4 text-slate-400" />
              <span>Backend API (/api/v1/health)</span>
            </div>
            {apiResult ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                ONLINE
              </span>
            ) : backendError ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                OFFLINE
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-mono">Not Tested</span>
            )}
          </div>

          {/* Database PostgreSQL */}
          <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2 text-slate-700">
              <Database className="w-4 h-4 text-slate-400" />
              <span>PostgreSQL DB (/api/v1/health/db)</span>
            </div>
            {dbResult ? (
              dbResult.success ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono">
                    {dbResult.data?.responseTimeMs}ms
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    CONNECTED
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  DISCONNECTED
                </span>
              )
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                {backendError ? 'WAITING FOR BACKEND' : 'Not Tested'}
              </span>
            )}
          </div>
        </div>

        {/* Database Disconnected Guidance */}
        {dbResult && !dbResult.success && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <p className="font-semibold text-amber-900">PostgreSQL is not reachable:</p>
            <p>{dbResult.error?.message || 'Connection refused on port 5432.'}</p>
            <div className="pt-1 flex items-center space-x-2 font-mono text-[11px] text-amber-900">
              <Terminal className="w-3.5 h-3.5" />
              <span>npm run db:up</span>
            </div>
          </div>
        )}

        {/* Successful Uptime & Env Details */}
        {apiResult?.data && (
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Uptime: {apiResult.data.uptime}s</span>
            <span>Database: {dbResult?.data?.database || 'None'}</span>
            <span>Env: {apiResult.data.environment}</span>
          </div>
        )}
      </div>
    </div>
  );
}
