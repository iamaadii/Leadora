import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Global modal stack manager for locking scroll and blurring background
let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyPaddingRight = '';

function lockBackgroundScrollAndBlur() {
  if (typeof document === 'undefined') return;
  activeModalsCount += 1;

  if (activeModalsCount === 1) {
    // 1. Blur the entire background app container and disable background clicks
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.transition = 'filter 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      rootEl.style.filter = 'blur(4px)';
      rootEl.style.pointerEvents = 'none';
      rootEl.setAttribute('aria-hidden', 'true');
    }

    // 2. Measure scrollbar width to prevent page jump when overflow is hidden
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
}

function unlockBackgroundScrollAndBlur() {
  if (typeof document === 'undefined') return;
  activeModalsCount = Math.max(0, activeModalsCount - 1);

  if (activeModalsCount === 0) {
    // 1. Remove blur and restore background interactivity
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.filter = '';
      rootEl.style.pointerEvents = '';
      rootEl.removeAttribute('aria-hidden');
    }

    // 2. Restore previous scroll state
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!isOpen) return;

    lockBackgroundScrollAndBlur();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlockBackgroundScrollAndBlur();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = SIZES[size] || SIZES.md;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto p-2.5 sm:p-4 md:p-6 flex items-center justify-center animate-in fade-in duration-200"
    >
      {/* Dark frosted glass backdrop with rich blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-all duration-200"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full ${sizeClass} my-auto transform transition-all overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] z-10 animate-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="min-w-0 pr-3">
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 focus:outline-hidden"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50/90 border-t border-slate-100/90 flex flex-wrap items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
