import React, { forwardRef, useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    children,
    value,
    defaultValue,
    onChange,
    name,
    id,
    disabled = false,
    required = false,
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    size = 'md',
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? (value ?? '') : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuCoords, setMenuCoords] = useState(null);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options from either options prop or children (<option>)
  const normalizedOptions = React.useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt) => ({
        value: opt.value !== undefined && opt.value !== null ? String(opt.value) : '',
        label: opt.label !== undefined && opt.label !== null ? String(opt.label) : String(opt.value ?? ''),
        disabled: Boolean(opt.disabled),
      }));
    }

    if (children) {
      const extracted = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          const val = child.props.value !== undefined && child.props.value !== null ? String(child.props.value) : '';
          let lbl = child.props.children;
          if (typeof lbl !== 'string' && typeof lbl !== 'number') {
            lbl = child.props.label || val;
          }
          extracted.push({
            value: val,
            label: String(lbl ?? val),
            disabled: Boolean(child.props.disabled),
          });
        }
      });
      return extracted;
    }

    return [];
  }, [options, children]);

  // Selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(currentValue));

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const lower = searchTerm.toLowerCase();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [normalizedOptions, searchTerm]);

  // Update position of floating menu
  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const opensUpward = spaceBelow < 220 && spaceAbove > spaceBelow;

    const maxMenuHeight = Math.min(280, opensUpward ? spaceAbove - 16 : spaceBelow - 16);
    const targetWidth = Math.max(rect.width, 160);

    let left = rect.left;
    if (left + targetWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - targetWidth - 12);
    }

    setMenuCoords({
      left,
      width: targetWidth,
      top: opensUpward ? undefined : rect.bottom + 6,
      bottom: opensUpward ? viewportHeight - rect.top + 6 : undefined,
      maxHeight: Math.max(120, maxMenuHeight),
      opensUpward,
    });
  };

  // Open / Close toggling
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateMenuPosition();
      setIsOpen(true);
      setSearchTerm('');
      const currentIdx = filteredOptions.findIndex((opt) => String(opt.value) === String(currentValue));
      setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
    } else {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        triggerRef.current?.focus();
      }
    };

    const handleScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setIsOpen(false);
      setSearchTerm('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', updateMenuPosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen]);

  // Handle option selection
  const handleSelect = (opt) => {
    if (opt.disabled) return;
    if (!isControlled) {
      setInternalValue(opt.value);
    }
    setIsOpen(false);
    setSearchTerm('');
    triggerRef.current?.focus();

    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          id: selectId,
          value: opt.value,
        },
        currentTarget: {
          name,
          id: selectId,
          value: opt.value,
        },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  // Keyboard navigation on trigger button
  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Keyboard navigation inside dropdown menu
  const handleMenuKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const hasCustomWidth = className && /(?:^|\s)(?:w-|max-w-|min-w-|flex-|grow|shrink)/.test(className);
  const containerClass = containerClassName
    ? `space-y-1.5 ${containerClassName}`
    : hasCustomWidth
    ? `space-y-1.5 ${className}`
    : 'space-y-1.5 w-full';

  return (
    <div className={`relative ${containerClass}`}>
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => triggerRef.current?.focus()}
          className="block text-xs font-semibold text-slate-700 cursor-pointer"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden native select for form serialization & DOM compatibility */}
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={currentValue}
        onChange={onChange}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none absolute opacity-0"
        {...rest}
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled custom trigger button */}
      <button
        type="button"
        ref={triggerRef}
        id={`${selectId}-button`}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? selectId : undefined}
        className={`w-full flex items-center justify-between text-left rounded-xl border transition-all duration-150 select-none ${
          size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2 px-3 text-xs sm:text-sm'
        } ${
          disabled
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
            : isOpen
            ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 text-slate-900 shadow-sm'
            : error
            ? 'bg-white border-rose-300 text-slate-900 hover:border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs'
        }`}
      >
        <span
          className={`truncate flex-1 font-medium ${
            !selectedOption ? 'text-slate-400 font-normal' : 'text-slate-800'
          }`}
        >
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen &&
        menuCoords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            style={{
              position: 'fixed',
              top: menuCoords.top !== undefined ? `${menuCoords.top}px` : undefined,
              bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : undefined,
              left: `${menuCoords.left}px`,
              width: `${menuCoords.width}px`,
              maxHeight: `${menuCoords.maxHeight}px`,
            }}
            className="z-[9999] bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Optional search input for large lists (> 7 items) */}
            {normalizedOptions.length > 7 && (
              <div className="p-2 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* List of options */}
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-400">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  const isHighlighted = idx === activeIndex;

                  return (
                    <button
                      key={`${opt.value}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl text-left transition-colors duration-100 ${
                        opt.disabled
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-100/80 text-slate-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <span className="truncate flex-1">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}

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
