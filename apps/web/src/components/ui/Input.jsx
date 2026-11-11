import React, { forwardRef, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    rightAction,
    prefix,
    isValid,
    clearable,
    onClear,
    className = '',
    containerClassName = '',
    id,
    disabled = false,
    required = false,
    type = 'text',
    value,
    onChange,
    inputMode,
    autoComplete,
    autoFocus = false,
    ...rest
  },
  ref,
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const [internalValue, setInternalValue] = useState(value ?? '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = {
        target: { id: inputId, value: '' },
        currentTarget: { id: inputId, value: '' },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  // Determine auto-validation indicator for email/url/tel when valid
  const hasValue = String(currentValue).trim().length > 0;
  const isAutoValid =
    isValid !== undefined
      ? isValid
      : type === 'email' && hasValue
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(currentValue))
      : false;

  const showClear = clearable && hasValue && !disabled;

  return (
    <div className={`space-y-1.5 ${containerClassName || 'w-full'}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-xl border transition-all duration-150 bg-white shadow-2xs ${
          disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
            : error
            ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
            : isAutoValid
            ? 'border-emerald-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10'
            : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10'
        }`}
      >
        {/* Integrated Currency / Unit Prefix Badge */}
        {prefix && (
          <span className="inline-flex items-center px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-r border-slate-200 rounded-l-xl select-none shrink-0">
            {prefix}
          </span>
        )}

        {/* Left Icon */}
        {LeftIcon && (
          <div className="pl-3.5 flex items-center pointer-events-none text-slate-400 shrink-0">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`block w-full text-xs sm:text-sm font-medium text-slate-800 bg-transparent py-2.5 px-3.5 transition placeholder:text-slate-400 placeholder:font-normal focus:outline-none disabled:cursor-not-allowed ${
            prefix ? 'rounded-r-xl' : 'rounded-xl'
          } ${LeftIcon ? 'pl-2.5' : ''} ${className}`}
          {...rest}
        />

        {/* Right Actions / Validation / Clear Buttons */}
        <div className="pr-3 flex items-center space-x-1.5 shrink-0">
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isAutoValid && (
            <div className="text-emerald-600 animate-in fade-in zoom-in-75 duration-150" title="Valid input">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          {rightAction ? (
            rightAction
          ) : RightIcon ? (
            <div className="text-slate-400 pointer-events-none">
              <RightIcon className="w-4 h-4" />
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 mt-1 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});
