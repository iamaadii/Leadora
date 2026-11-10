/**
 * Currency Formatting Utilities
 * Uses Intl.NumberFormat with active organization currency and appropriate locales
 */

const CURRENCY_LOCALES = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

/**
 * Format monetary amount with organization currency
 * @param {number|string|null|undefined} amount
 * @param {string} [currency='USD']
 * @param {object} [options={}]
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD', options = {}) {
  if (amount === null || amount === undefined || amount === '') {
    return options.fallback !== undefined ? options.fallback : '—';
  }

  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numericValue)) {
    return options.fallback !== undefined ? options.fallback : '—';
  }

  const upperCurrency = (currency || 'USD').toUpperCase();
  const locale = CURRENCY_LOCALES[upperCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: upperCurrency,
      maximumFractionDigits: options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2,
      minimumFractionDigits: options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0,
    }).format(numericValue);
  } catch (_e) {
    // Safe fallback if currency code is unexpected
    const symbol = CURRENCY_SYMBOLS[upperCurrency] || '$';
    return `${symbol}${numericValue.toLocaleString()}`;
  }
}

/**
 * Get currency symbol for organization currency
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function getCurrencySymbol(currency = 'USD') {
  return CURRENCY_SYMBOLS[(currency || 'USD').toUpperCase()] || '$';
}

