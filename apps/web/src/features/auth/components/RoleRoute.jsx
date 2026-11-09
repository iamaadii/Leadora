import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ShieldAlert } from 'lucide-react';

export function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-lg mx-auto text-center space-y-4 my-12 shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          Your current role (<code className="font-mono text-rose-600 bg-rose-50 px-1 rounded">{user.role}</code>)
          does not have permission to view this resource.
        </p>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
