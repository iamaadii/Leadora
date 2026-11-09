import React from 'react';
import { Button } from './Button.jsx';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is currently no data to display here.',
  actionText,
  onAction,
  action,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs ${className}`}
    >
      <div className="w-12 h-12 bg-slate-100 rounded-2xl border border-slate-200/60 flex items-center justify-center mx-auto text-slate-500 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(action || (actionText && onAction)) && (
        <div className="pt-2">
          {action || (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
