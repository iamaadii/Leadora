import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    children,
    className = '',
    containerClassName = '',
    id,
    disabled = false,
    required = false,
    ...rest
  },
  ref,
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName || 'w-full'}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        required={required}
        className={`block w-full text-xs sm:text-sm rounded-lg border py-2 px-3 transition bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20'
        } ${className}`}
        {...rest}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
      </select>

      {error ? (
        <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

