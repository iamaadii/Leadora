import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export function Dropdown({
  trigger,
  children,
  align = 'right',
  direction = 'auto',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    top: null,
    bottom: null,
    left: null,
    right: null,
    openUpwards: false,
  });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Minimum space needed for a comfortable dropdown (~190px)
    const shouldOpenUpwards =
      direction === 'up' ||
      (direction !== 'down' && spaceBelow < 190 && spaceAbove > spaceBelow);

    const viewportWidth = window.innerWidth;
    const menuWidth = 224; // standard w-56 width
    const safeMargin = 12;

    let left = null;
    let right = null;

    if (align === 'right') {
      // Preferred: align menu's right edge to trigger's right edge
      const intendedLeft = rect.right - menuWidth;
      if (intendedLeft < safeMargin) {
        // Menu would spill off the left edge of the screen! Clamp to left safeMargin
        left = safeMargin;
        right = null;
      } else {
        right = Math.max(safeMargin, viewportWidth - rect.right);
        left = null;
      }
    } else {
      // Preferred: align menu's left edge to trigger's left edge
      const intendedRight = rect.left + menuWidth;
      if (intendedRight > viewportWidth - safeMargin) {
        // Menu would spill off the right edge of the screen! Clamp to right safeMargin
        right = safeMargin;
        left = null;
      } else {
        left = Math.max(safeMargin, rect.left);
        right = null;
      }
    }

    if (shouldOpenUpwards) {
      setPosition({
        top: null,
        bottom: window.innerHeight - rect.top + 6,
        left,
        right,
        openUpwards: true,
      });
    } else {
      setPosition({
        top: rect.bottom + 6,
        bottom: null,
        left,
        right,
        openUpwards: false,
      });
    }
  }, [align, direction]);

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScroll = (event) => {
      // If the scroll is happening inside the dropdown menu itself, let it scroll
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }
      // Otherwise, scrolling the page or container automatically dismisses the dropdown
      setIsOpen(false);
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, calculatePosition]);

  const menuStyle = {
    position: 'fixed',
    zIndex: 9999,
    ...(position.top !== null ? { top: `${position.top}px` } : {}),
    ...(position.bottom !== null ? { bottom: `${position.bottom}px` } : {}),
    ...(position.left !== null ? { left: `${position.left}px` } : {}),
    ...(position.right !== null ? { right: `${position.right}px` } : {}),
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={triggerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className={`w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-slate-200/90 py-1.5 focus:outline-hidden animate-in fade-in zoom-in-95 duration-100 overflow-hidden ${
              position.openUpwards ? 'origin-bottom-right' : 'origin-top-right'
            }`}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  danger = false,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition ${
        danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="h-px bg-slate-100 my-1" />;
}
