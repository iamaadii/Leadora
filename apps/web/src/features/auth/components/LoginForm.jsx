import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Building, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('acme-sales');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({
        email,
        password,
        organizationSlug: isSuperAdmin ? undefined : organizationSlug.trim(),
      });

      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper for rapid local testing
  const applyPreset = (presetEmail, presetSlug, isSuper = false) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setIsSuperAdmin(isSuper);
    if (!isSuper) {
      setOrganizationSlug(presetSlug);
    }
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Demo Credentials Quick-Select Pill Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
        <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => applyPreset('admin@acme.com', 'acme-sales', false)}
            className="p-1.5 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-600 text-left transition"
          >
            <strong>Admin</strong>
            <span className="block text-[10px] text-slate-400">admin@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('manager@acme.com', 'acme-sales', false)}
            className="p-1.5 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-600 text-left transition"
          >
            <strong>Manager</strong>
            <span className="block text-[10px] text-slate-400">manager@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('alice@acme.com', 'acme-sales', false)}
            className="p-1.5 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-600 text-left transition"
          >
            <strong>Employee</strong>
            <span className="block text-[10px] text-slate-400">alice@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('superadmin@platform.com', '', true)}
            className="p-1.5 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-600 text-left transition"
          >
            <strong>Super Admin</strong>
            <span className="block text-[10px] text-slate-400">superadmin@</span>
          </button>
        </div>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Sign In Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Mode Toggle */}
        <div className="flex items-center justify-between py-1 text-xs text-slate-600">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSuperAdmin}
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>I am a Platform Super Admin (no organization slug)</span>
          </label>
        </div>

        {/* Organization Slug Field */}
        {!isSuperAdmin && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization Slug
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={organizationSlug}
                onChange={(e) => setOrganizationSlug(e.target.value)}
                placeholder="acme-sales"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Example: acme-sales</p>
          </div>
        )}

        {/* Email Address Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center space-x-2 disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
