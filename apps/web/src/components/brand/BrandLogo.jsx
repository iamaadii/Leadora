// BrandLogo.jsx
// Reusable Brand Identity Component for Leadora SaaS
import React from 'react';

const SIZE_MAP = {
  xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', gap: 'gap-1.5' },
  sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]', gap: 'gap-2' },
  md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[11px]', gap: 'gap-2.5' },
  lg: { icon: 'w-11 h-11', text: 'text-xl', sub: 'text-xs', gap: 'gap-3' },
  xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-sm', gap: 'gap-3.5' },
};

export function LeadoraIcon({ className = 'w-9 h-9' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-xs`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="leadora-vibrant-bg" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="leadora-accent-mint" x1="26" y1="18" x2="38" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* High-visibility vibrant blue/indigo squircle badge */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#leadora-vibrant-bg)" />
      <rect x="2.5" y="2.5" width="43" height="43" rx="11.5" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" />

      {/* Razor-sharp Pure White L Monogram */}
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H20C21.1046 10 22 10.8954 22 12V28C22 29.1046 22.8954 30 24 30H34C35.1046 30 36 30.8954 36 32V36C36 37.1046 35.1046 38 34 38H18C15.7909 38 14 36.2091 14 34V12Z"
        fill="#FFFFFF"
      />

      {/* High-luminance Mint Emerald Growth Arrow */}
      <path
        d="M26 18L37 7M37 7H29M37 7V15"
        stroke="url(#leadora-accent-mint)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="37" cy="7" r="2.75" fill="#34D399" />
    </svg>
  );
}

export function BrandLogo({
  variant = 'full', // 'full' | 'icon'
  size = 'md',     // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme = 'light',  // 'light' | 'dark'
  showSubtitle = true,
  subtitleText = 'CRM & Pipeline Platform',
  className = '',
}) {
  const conf = SIZE_MAP[size] || SIZE_MAP.md;
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`} title="Leadora">
        <LeadoraIcon className={conf.icon} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${conf.gap} ${className}`}>
      <LeadoraIcon className={conf.icon} />
      <div className="flex flex-col min-w-0 select-none">
        <span
          className={`font-black tracking-tight leading-none ${conf.text} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Lead<span className={isDark ? 'text-blue-400' : 'text-blue-600'}>ora</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-bold tracking-wider uppercase truncate mt-0.5 ${conf.sub} ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}
