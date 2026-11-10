import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoginForm } from '../components/LoginForm.jsx';
import { BrandLogo } from '../../../components/brand/BrandLogo.jsx';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // If restoring session, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs text-slate-400 font-medium">Restoring session...</p>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient glows matching Landing Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Container - Extended width for larger devices (max-w-md -> sm:max-w-lg -> lg:max-w-xl) */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto space-y-5 sm:space-y-6 relative z-10">
        {/* Top Header: Back to Home on the left, Logo on the right */}
        <div className="w-full flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xs transition group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="inline-flex items-center" aria-label="Leadora Home">
            <BrandLogo
              variant="full"
              size="md"
              theme="dark"
              showSubtitle={false}
            />
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sign In to Leadora
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Every Lead. Every Opportunity. One Unified Platform.
          </p>
        </div>

        {/* Login Form Card - Extended Width & Dark Landing Page Theme */}
        <div className="bg-slate-800/85 backdrop-blur-xl py-6 sm:py-8 px-5 sm:px-8 shadow-2xl shadow-black/50 border border-slate-700/80 rounded-2xl w-full">
          <LoginForm />

          <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted sessions &bull; Enterprise-grade access control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
