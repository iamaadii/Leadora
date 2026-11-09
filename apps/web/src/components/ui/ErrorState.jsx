import React from 'react';
import { Button } from './Button.jsx';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs ${className}`}
    >
      <div className="w-12 h-12 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-xs">
        <AlertCircle className="w-6 h-6 stroke-[1.75]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={RotateCcw}
          >
            Retry Action
          </Button>
        </div>
      )}
    </div>
  );
}
