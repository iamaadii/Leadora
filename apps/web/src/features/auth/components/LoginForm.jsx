import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  Building,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('acme-sales');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-3.5 text-xs space-y-2.5">
        <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => applyPreset('admin@acme.com', 'acme-sales', false)}
            className="p-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl hover:border-blue-500 hover:bg-slate-700/60 text-left transition shadow-2xs active:scale-[0.98] focus:outline-hidden"
          >
            <strong className="block text-white font-bold">Admin</strong>
            <span className="block text-[10px] text-slate-400 truncate">admin@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('manager@acme.com', 'acme-sales', false)}
            className="p-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl hover:border-blue-500 hover:bg-slate-700/60 text-left transition shadow-2xs active:scale-[0.98] focus:outline-hidden"
          >
            <strong className="block text-white font-bold">Manager</strong>
            <span className="block text-[10px] text-slate-400 truncate">manager@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('alice@acme.com', 'acme-sales', false)}
            className="p-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl hover:border-blue-500 hover:bg-slate-700/60 text-left transition shadow-2xs active:scale-[0.98] focus:outline-hidden"
          >
            <strong className="block text-white font-bold">Employee</strong>
            <span className="block text-[10px] text-slate-400 truncate">alice@acme</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('superadmin@platform.com', '', true)}
            className="p-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl hover:border-blue-500 hover:bg-slate-700/60 text-left transition shadow-2xs active:scale-[0.98] focus:outline-hidden"
          >
            <strong className="block text-white font-bold">Super Admin</strong>
            <span className="block text-[10px] text-slate-400 truncate">superadmin@</span>
          </button>
        </div>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-rose-200">Sign In Failed</p>
            <p className="mt-0.5 leading-snug break-words text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Mode Toggle */}
        <label className="flex items-start sm:items-center space-x-2.5 cursor-pointer p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-700/80 transition select-none text-xs text-slate-300">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={(e) => setIsSuperAdmin(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500/30 w-4 h-4 mt-0.5 sm:mt-0 shrink-0"
          />
          <span className="font-medium leading-tight">
            Platform Super Admin <span className="text-slate-400 font-normal">(no organization slug required)</span>
          </span>
        </label>

        {/* Organization Slug Field */}
        {!isSuperAdmin && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Organization Slug
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={organizationSlug}
                onChange={(e) => setOrganizationSlug(e.target.value)}
                placeholder="acme-sales"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2.5 text-base sm:text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500">Example: acme-sales</p>
          </div>
        )}

        {/* Email Address Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-9 pr-3 py-2.5 sm:py-2.5 text-base sm:text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Password Field with Show/Hide Toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Password
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-10 py-2.5 sm:py-2.5 text-base sm:text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-hidden"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition flex items-center justify-center space-x-2 disabled:opacity-60 shadow-lg shadow-blue-600/30 active:scale-[0.99] focus:outline-hidden"
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
        </div>
      </form>
    </div>
  );
}
