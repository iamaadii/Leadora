import React from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  variant,
  isLoading = false,
}) {
  const isDanger = isDestructive || variant === 'danger';
  const bodyMessage =
    message ||
    description ||
    'Are you sure you want to proceed with this action? This operation cannot be undone.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start space-x-3.5 py-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isDanger
              ? 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-xs'
              : 'bg-amber-50 text-amber-600 border-amber-200/80 shadow-xs'
          }`}
        >
          {isDanger ? (
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          ) : (
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          )}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-900 break-words">{title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed break-words">{bodyMessage}</p>
        </div>
      </div>
    </Modal>
  );
}
