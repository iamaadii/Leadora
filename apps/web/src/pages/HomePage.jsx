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
          ? 'Backend API server is not running on http://localhost:5000. Please start the application backend.'
          : apiErr.message || 'Failed to reach backend server');

      setBackendError(errorMsg);
      setLoading(false);
      return;
    }

    // 2. Test Primary Database
    try {
      const dbData = await getDbHealth();
      setDbResult(dbData);
    } catch (dbErr) {
      setDbResult({
        success: false,
        error: dbErr.response?.data?.error || {
          message: 'Primary database service is currently disconnected. Make sure the database service is running.',
          details: dbErr.message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-4 max-w-2xl mx-auto w-full">
      {/* Title Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Leadora
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto px-2 leading-relaxed">
          Every Lead. Every Opportunity. One Platform. Multi-tenant Business CRM & Lead Management.
        </p>
      </div>

      {/* Authenticated User Session Card */}
      {isAuthenticated && user ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 w-full space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60">
            <div className="flex items-center space-x-2.5 text-emerald-900 font-semibold text-xs sm:text-sm">
              <UserCheck className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 shrink-0" />
              <span>Active Authenticated Session</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-200 text-emerald-800 self-start sm:self-auto">
              {user.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[11px]">Logged-in User:</span>
              <strong className="text-slate-900 truncate block">{user.firstName} {user.lastName}</strong>
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 block text-[11px]">Email:</span>
              <strong className="text-slate-900 font-mono text-[11px] sm:text-xs truncate block">{user.email}</strong>
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 block text-[11px]">Organization:</span>
              <strong className="text-slate-900 truncate block">
                {user.organizationName ? `${user.organizationName} (${user.organizationSlug})` : 'Platform Global (Super Admin)'}
              </strong>
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 block text-[11px]">User ID:</span>
              <span className="text-slate-600 font-mono text-[10px] sm:text-[11px] truncate block">{user.id}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <span className="text-emerald-800 flex items-center space-x-1.5 text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Secure authenticated session active</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition text-center cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        /* Sign In Callout Banner if not authenticated */
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3 min-w-0">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-blue-900">Sign in to your account</h3>
              <p className="text-[11px] sm:text-xs text-blue-700 leading-tight">Access your workspace as Admin, Manager, or Employee</p>
            </div>
          </div>
          <Link
            to="/login"
            className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition shrink-0"
          >
            Go to Login
          </Link>
        </div>
      )}

      {/* Connectivity Diagnostic Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6 w-full space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 text-xs sm:text-sm">System Health & Connectivity</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Test API and database connectivity</p>
            </div>
          </div>

          <button
            type="button"
            onClick={testConnectivity}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing...' : 'Test Backend Connectivity'}</span>
          </button>
        </div>

        {/* Backend Offline Error Banner */}
        {backendError && (
          <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-rose-800">Backend Server Unreachable</p>
                <p className="mt-0.5 text-[11px] sm:text-xs break-words">{backendError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Backend API */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-slate-700 min-w-0">
              <Server className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Application API (/api/v1/health)</span>
            </div>
            <div className="shrink-0">
              {apiResult ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  ONLINE
                </span>
              ) : backendError ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-rose-100 text-rose-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  OFFLINE
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Not Tested</span>
              )}
            </div>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-slate-700 min-w-0">
              <Database className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Primary Database (/api/v1/health/db)</span>
            </div>
            <div className="shrink-0">
              {dbResult ? (
                dbResult.success ? (
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                      {dbResult.data?.responseTimeMs}ms
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      CONNECTED
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    DISCONNECTED
                  </span>
                )
              ) : (
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                  {backendError ? 'WAITING' : 'Not Tested'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Database Disconnected Guidance */}
        {dbResult && !dbResult.success && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <p className="font-semibold text-amber-900">Database is not reachable:</p>
            <p className="text-[11px] sm:text-xs break-words">{dbResult.error?.message || 'Connection refused.'}</p>
          </div>
        )}

        {/* Successful Uptime & Env Details */}
        {apiResult?.data && (
          <div className="text-[11px] sm:text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span>Uptime: {apiResult.data.uptime}s</span>
            <span>Status: Connected</span>
            <span>Env: {apiResult.data.environment}</span>
          </div>
        )}
      </div>
    </div>
  );
}
