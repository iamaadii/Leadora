// csv.exporter.js
// Phase 9: RFC 4180 CSV Generation with Formula Injection Mitigation

/**
 * Sanitizes a single cell value to mitigate CSV / Formula Injection (CWE-1236).
 * If a cell starts with formula characters (=, +, -, @, tab, CR),
 * prepend a single quote (') so spreadsheet engines treat it strictly as text.
 *
 * @param {any} value
 * @returns {string}
 */
export function sanitizeForCsv(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Check for formula injection triggers at the start of cell
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // RFC 4180 quoting rule: if cell contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Builds RFC 4180 CSV string with UTF-8 BOM for spreadsheet compatibility
 *
 * @param {Object} options
 * @param {Array<{ label: string, key: string, format?: Function }>} options.columns
 * @param {Array<Object>} options.data
 * @param {string} [options.title]
 * @param {Object} [options.summary]
 * @returns {Buffer}
 */
export function generateCsv({ columns, data, title, summary }) {
  const lines = [];

  // Table Header Row - placed at top for standard CSV import and spreadsheet compatibility
  const headerRow = columns.map((col) => sanitizeForCsv(col.label)).join(',');
  lines.push(headerRow);

  // Data Rows
  for (const row of data) {
    const rowValues = columns.map((col) => {
      let rawVal = row[col.key];
      if (col.format && typeof col.format === 'function') {
        rawVal = col.format(rawVal, row);
      }
      return sanitizeForCsv(rawVal);
    });
    lines.push(rowValues.join(','));
  }

  // Summary Metrics & Metadata Block (appended at bottom so tabular headers are undisturbed)
  if ((summary && Object.keys(summary).length > 0) || title) {
    lines.push(''); // blank line
    lines.push('Summary Metrics');
    if (title) {
      lines.push(`Report Title,${sanitizeForCsv(title)}`);
      lines.push(`Exported At,${sanitizeForCsv(new Date().toISOString())}`);
    }
    if (summary) {
      for (const [k, v] of Object.entries(summary)) {
        const readableKey = k
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        if (typeof v === 'object' && v !== null) {
          lines.push(`${sanitizeForCsv(readableKey)},${sanitizeForCsv(JSON.stringify(v))}`);
        } else {
          lines.push(`${sanitizeForCsv(readableKey)},${sanitizeForCsv(v)}`);
        }
      }
    }
  }

  // Prepend UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + lines.join('\r\n');
  return Buffer.from(csvContent, 'utf-8');
}

