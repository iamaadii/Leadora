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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Restoring session...</p>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex justify-center pb-1">
          <BrandLogo
            variant="full"
            size="lg"
            showSubtitle={false}
            className="justify-center"
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Leadora
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Every Lead. Every Opportunity. One Platform.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          <LoginForm />

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Argon2 password verification &bull; Secure HttpOnly token rotation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
