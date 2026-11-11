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

    // Minimum space needed for a comfortable dropdown (~180px)
    const shouldOpenUpwards =
      direction === 'up' ||
      (direction !== 'down' && spaceBelow < 190 && spaceAbove > spaceBelow);

    const isSmallScreen = window.innerWidth < 640;

    let left = null;
    let right = null;

    if (isSmallScreen) {
      // On mobile screens, ensure the menu stays within 12px of viewport edges
      if (align === 'right') {
        right = Math.max(12, window.innerWidth - rect.right);
      } else {
        left = Math.max(12, rect.left);
      }
    } else {
      if (align === 'right') {
        right = Math.max(8, window.innerWidth - rect.right);
      } else {
        left = Math.max(8, rect.left);
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

    const handleScrollOrResize = () => {
      calculatePosition();
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

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
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
