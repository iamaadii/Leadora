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
      className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 sm:px-6 py-2 border-b border-amber-600/30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto">
        {/* Mobile View (< sm): balanced top row + clean centered notice */}
        <div className="sm:hidden flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-black text-[10px] uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Demo Mode</span>
            </span>
            <button
              type="button"
              onClick={handleExitDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title="Exit product demo and return to home page"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-300" />
              <span>Exit Demo</span>
            </button>
          </div>
          <p className="text-slate-950 font-medium text-[11px] leading-snug text-center">
            You are exploring a sample Leadora workspace. Changes are disabled and no real customer information is displayed.
          </p>
        </div>

        {/* Desktop View (>= sm): streamlined single row */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-black text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Demo Mode</span>
            </span>
            <span className="text-slate-950 font-bold text-xs sm:text-sm leading-tight">
              You are exploring a sample Leadora workspace. Changes are disabled and no real customer information is displayed.
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExitDemo}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition transform active:scale-95 cursor-pointer"
              title="Exit product demo and return to home page"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-300" />
              <span>Exit Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
