/**
 * Date and Time Formatting Utilities
 * Uses Intl.DateTimeFormat with explicit IANA timezone from active organization settings
 */

/**
 * Format a timestamp into a localized date string in organization timezone
 * @param {string|Date|number|null} date
 * @param {string} [timeZone='America/New_York']
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, timeZone = 'America/New_York', options = {}) {
  if (!date) return '—';

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';

  const tz = timeZone || 'America/New_York';

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(d);
  } catch (_e) {
    return d.toLocaleDateString();
  }
}

/**
 * Format a timestamp into date and time in organization timezone
 * @param {string|Date|number|null} date
 * @param {string} [timeZone='America/New_York']
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDateTime(date, timeZone = 'America/New_York', options = {}) {
  if (!date) return '—';

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';

  const tz = timeZone || 'America/New_York';

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    }).format(d);
  } catch (_e) {
    return d.toLocaleString();
  }
}

/**
 * Format relative time (e.g. "5m ago", "2h ago", "yesterday")
 * @param {string|Date|number|null} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '—';

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}

