import React, { forwardRef, useState, useRef, useEffect } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    rows = 3,
    maxLength,
    showCount = false,
    autoGrow = true,
    className = '',
    id,
    disabled = false,
    required = false,
    value,
    defaultValue,
    onChange,
    autoFocus = false,
    ...rest
  },
  ref,
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const internalRef = useRef(null);
  const actualRef = ref || internalRef;

  const [internalVal, setInternalVal] = useState(defaultValue ?? '');
  const currentVal = value !== undefined ? value : internalVal;
  const currentLength = String(currentVal ?? '').length;

  const handleChange = (e) => {
    if (value === undefined) {
      setInternalVal(e.target.value);
    }
    onChange?.(e);
  };

  // Auto-grow height based on content
  useEffect(() => {
    if (!autoGrow || !actualRef.current) return;
    const el = actualRef.current;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, rows * 24)}px`;
  }, [currentVal, autoGrow, rows, actualRef]);

  // Compute character limit color warning
  const isNearLimit = maxLength && currentLength > maxLength * 0.85;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        {(showCount || maxLength) && (
          <span
            className={`text-[11px] font-mono transition-colors ${
              isAtLimit
                ? 'text-rose-600 font-bold'
                : isNearLimit
                ? 'text-amber-600 font-semibold'
                : 'text-slate-400'
            }`}
          >
            {currentLength}
            {maxLength ? ` / ${maxLength}` : ' chars'}
          </span>
        )}
      </div>

      <textarea
        ref={actualRef}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        className={`block w-full text-xs sm:text-sm font-medium text-slate-800 rounded-xl border py-2.5 px-3.5 transition-all duration-150 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed shadow-2xs ${
          disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
            : error
            ? 'border-rose-300 text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
            : 'border-slate-200 text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        } ${className}`}
        {...rest}
      />

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
