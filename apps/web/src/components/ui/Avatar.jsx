import React from 'react';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
};

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-slate-400',
};

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 'md',
  status,
  className = '',
}) {
  const sizeClass = SIZES[size] || SIZES.md;
  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClass} rounded-full object-cover border border-slate-200/80 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center select-none shadow-xs`}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            STATUS_COLORS[status] || STATUS_COLORS.online
          }`}
        />
      )}
    </div>
  );
}
