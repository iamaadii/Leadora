import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { LogOut, Sparkles } from 'lucide-react';

export function DemoBanner() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleExitDemo = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      role="banner"
      aria-label="Demo Mode Indicator"
      className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm sticky top-0 z-40 border-b border-amber-600/30"
    >
      <div className="flex items-center space-x-2.5 text-center sm:text-left min-w-0">
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Demo Mode</span>
        </span>
        <span className="text-slate-950 font-bold leading-tight line-clamp-2 sm:line-clamp-1">
          DEMO MODE: You are exploring a sample Leadora workspace. Changes are disabled and no real customer information is displayed.
        </span>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={handleExitDemo}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition transform active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5 text-amber-300" />
          <span>Exit Demo</span>
        </button>
      </div>
    </div>
  );
}

