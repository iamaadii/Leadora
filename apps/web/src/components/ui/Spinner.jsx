import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({
  size = 'md',
  className = '',
  color = 'text-blue-600',
}) {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <Loader2
      className={`animate-spin shrink-0 ${sizeClass} ${color} ${className}`}
      aria-label="Loading"
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <Spinner size="lg" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}

