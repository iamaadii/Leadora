import React from 'react';

export function Skeleton({ className = '', variant = 'rectangular' }) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded h-4 w-full'
        : 'rounded-xl';

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantClass} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`p-5 bg-white rounded-xl border border-slate-200 space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-full h-3" />
        ))}
      </div>
    </div>
  );
}

