import React from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button.jsx';
import { Check, RotateCcw } from 'lucide-react';

export function UnsavedChangesBar({
  isVisible = false,
  message = 'Careful — you have unsaved changes!',
  onDiscard,
  onSave,
  isSaving = false,
  saveText = 'Save Changes',
  discardText = 'Discard',
}) {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 shadow-2xl rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onDiscard && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-2.5 py-1.5 h-auto rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {discardText}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 h-auto shadow-sm rounded-lg"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          {saveText}
        </Button>
      </div>
    </div>
  );
}

UnsavedChangesBar.propTypes = {
  isVisible: PropTypes.bool,
  message: PropTypes.string,
  onDiscard: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  saveText: PropTypes.string,
  discardText: PropTypes.string,
};
