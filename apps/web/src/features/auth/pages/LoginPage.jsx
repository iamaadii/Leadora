import React from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { Building2, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex p-3 bg-blue-600 text-white rounded-xl shadow-md">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Business CRM
        </h1>
        <p className="text-xs text-slate-500">
          Enterprise multi-tenant lead management and sales acceleration platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-8">
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
