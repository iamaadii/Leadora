import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 3500 }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const newToast = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { title, message, type, duration } = e.detail || {};
      if (message) {
        addToast({ title, message, type: type || 'info', duration: duration || 4000 });
      }
    };
    window.addEventListener('app:toast', handleToastEvent);
    return () => window.removeEventListener('app:toast', handleToastEvent);
  }, [addToast]);

  const toast = {
    info: (message, title) => addToast({ title, message, type: 'info' }),
    success: (message, title) => addToast({ title, message, type: 'success' }),
    warning: (message, title) => addToast({ title, message, type: 'warning' }),
    error: (message, title) => addToast({ title, message, type: 'error' }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Toast Notification Container:
          - Mobile: Bottom-Center (floating, natural thumb zone & eye level)
          - Laptop/Desktop (sm+): Top-Right (standard unobtrusive eye path)
      */}
      <div
        aria-live="polite"
        className="fixed z-50 pointer-events-none flex flex-col space-y-2.5 w-[calc(100%-2rem)] max-w-sm bottom-4 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-5 sm:right-5 sm:left-auto sm:translate-x-0"
      >
        {toasts.map((item) => {
          const hasDistinctTitle =
            item.title &&
            item.message &&
            item.title.toLowerCase() !== item.type.toLowerCase() &&
            item.title.toLowerCase() !== item.message.toLowerCase();

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex ${
                hasDistinctTitle ? 'items-start' : 'items-center'
              } space-x-3 p-3.5 sm:p-4 rounded-xl border shadow-lg transition-all duration-200 transform translate-y-0 ${
                item.type === 'success'
                  ? 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/5'
                  : item.type === 'error'
                    ? 'bg-white border-rose-200 text-slate-800 shadow-rose-500/5'
                    : item.type === 'warning'
                      ? 'bg-white border-amber-200 text-slate-800 shadow-amber-500/5'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-500/5'
              }`}
            >
              <div className={`shrink-0 ${hasDistinctTitle ? 'mt-0.5' : ''}`}>
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {item.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                {hasDistinctTitle ? (
                  <>
                    <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-800 leading-snug">
                    {item.message || item.title}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
