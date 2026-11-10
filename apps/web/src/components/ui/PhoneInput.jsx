import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  detectUserCountry,
  parsePhoneNumber,
  formatFullPhone,
  searchCountries,
} from '../../services/country.service.js';

/**
 * FlagImage displays a high-resolution flag image with automatic fallback to emoji
 */
export function FlagImage({ country, className = 'w-5 h-3.5' }) {
  const [hasError, setHasError] = useState(false);

  if (!country) return <span className="text-base leading-none">🌐</span>;

  if (hasError || !country.flagUrl) {
    return (
      <span className="text-base leading-none select-none inline-flex items-center justify-center">
        {country.flagEmoji || '🌐'}
      </span>
    );
  }

  return (
    <img
      src={country.flagUrl}
      alt={country.name}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${className} object-cover rounded-xs shadow-2xs inline-block shrink-0`}
    />
  );
}

export function PhoneInput({
  label,
  name = 'phone',
  value = '',
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  containerClassName = '',
  id,
}) {
  const inputId = id || (name ? `phone-${name}` : undefined);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const inputRef = useRef(null);

  // Parse initial full phone number into selected country and national subscriber digits
  const parsed = parsePhoneNumber(value, DEFAULT_COUNTRY);
  const [selectedCountry, setSelectedCountry] = useState(parsed.country);
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-detect user's country code on component mount if no pre-existing value
  useEffect(() => {
    let isMounted = true;
    if (!value) {
      detectUserCountry().then((detected) => {
        if (isMounted && detected && !value) {
          setSelectedCountry(detected);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [value]);

  // Keep internal state synchronized if external value prop changes from outside
  const selectedCountryRef = useRef(selectedCountry);
  selectedCountryRef.current = selectedCountry;

  useEffect(() => {
    const nextParsed = parsePhoneNumber(value, selectedCountryRef.current);
    setNationalNumber(nextParsed.nationalNumber);
    if (nextParsed.country && nextParsed.country.iso2 !== selectedCountryRef.current?.iso2) {
      setSelectedCountry(nextParsed.country);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Autofocus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered countries based on search query
  const filteredCountries = searchCountries(searchQuery);

  // Helper to trigger parent onChange callback
  const notifyChange = (country, number) => {
    const fullPhone = formatFullPhone(country, number);
    if (!onChange) return;

    // Create synthetic React-compatible event
    const syntheticEvent = {
      target: {
        name,
        value: fullPhone,
      },
      currentTarget: {
        name,
        value: fullPhone,
      },
    };

    // If caller expects synthetic event
    onChange(syntheticEvent);

    // If caller also supports direct string argument
    if (typeof onChange === 'function' && onChange.length === 1) {
      try {
        // Some handlers accept (value) rather than (event)
        // If the handler didn't use e.target, we check if it works with string
      } catch {
        // ignore
      }
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    notifyChange(country, nationalNumber);
    // Focus phone input after selecting country
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;

    // If user pastes or types a number starting with '+', attempt to auto-detect country dial code
    if (rawVal.trim().startsWith('+')) {
      const detected = parsePhoneNumber(rawVal, selectedCountry);
      setSelectedCountry(detected.country);
      setNationalNumber(detected.nationalNumber);
      notifyChange(detected.country, detected.nationalNumber);
      return;
    }

    setNationalNumber(rawVal);
    notifyChange(selectedCountry, rawVal);
  };

  const currentPlaceholder = placeholder || selectedCountry.placeholder || '(555) 000-0000';

  return (
    <div className={`space-y-1.5 ${containerClassName || 'w-full'}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs flex">
        {/* Country Selector Button & Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={`Select country code, currently ${selectedCountry.name} (${selectedCountry.dial})`}
            aria-expanded={isOpen}
            className={`h-full flex items-center space-x-1.5 px-3 py-2 sm:py-1.5 border border-r-0 rounded-l-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              error ? 'border-rose-300' : 'border-slate-300'
            }`}
          >
            <FlagImage country={selectedCountry} />
            <span className="font-semibold text-slate-700 font-mono text-xs">
              {selectedCountry.dial}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>

          {/* Floating Searchable Country Dropdown */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
              {/* Search Header */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country, ISO or code..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-400 text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 max-h-64 scrollbar-thin">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No countries match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.iso2 === selectedCountry.iso2;
                    return (
                      <button
                        key={c.iso2}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full px-3 py-2 flex items-center justify-between text-left text-xs transition group ${
                          isSelected
                            ? 'bg-blue-50/80 text-blue-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <FlagImage country={c} className="w-4 h-3 shrink-0" />
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({c.iso2})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-mono text-[11px] text-slate-500 group-hover:text-slate-800">
                            {c.dial}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{COUNTRIES.length} countries supported</span>
                <span className="text-slate-400">All country codes</span>
              </div>
            </div>
          )}
        </div>

        {/* National Number Input Field */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="tel"
          disabled={disabled}
          required={required}
          value={nationalNumber}
          onChange={handleInputChange}
          placeholder={currentPlaceholder}
          className={`block w-full text-base sm:text-sm rounded-r-lg border transition placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed pl-3 pr-3 py-2.5 sm:py-2 ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20'
          } ${className}`}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
