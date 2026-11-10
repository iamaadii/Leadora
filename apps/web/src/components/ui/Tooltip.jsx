import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ARROW_CLASSES = {
  top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t',
  left: 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t',
  right: 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 120,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculateCoords = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 10;

    let top = 0;
    let left = 0;
    let transform = '';

    switch (position) {
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        transform = 'translateY(-50%)';
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        transform = 'translateX(-50%)';
        break;
      case 'top':
      default:
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
    }

    return { top, left, transform };
  };

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const computedCoords = calculateCoords();
      if (computedCoords) {
        setCoords(computedCoords);
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', handleScrollOrResize, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  if (!content) return children;

  const arrowClass = ARROW_CLASSES[position] || ARROW_CLASSES.top;

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && coords && typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.transform,
            }}
            className="fixed z-[9999] px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150 border border-slate-700/60"
          >
            {content}
            <span
              className={`absolute w-2 h-2 bg-slate-900 border-slate-700/60 rotate-45 ${arrowClass}`}
              aria-hidden="true"
            />
          </div>,
          document.body
        )}
    </div>
  );
}
