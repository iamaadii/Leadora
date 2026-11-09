// excel.exporter.js
// Phase 9: Excel (.xlsx) Generation using ExcelJS

import ExcelJS from 'exceljs';

/**
 * Generates styled .xlsx workbook buffer
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.orgName]
 * @param {Object} [options.dateRange]
 * @param {Object} [options.summary]
 * @param {Array<{ label: string, key: string, width?: number, format?: Function }>} options.columns
 * @param {Array<Object>} options.data
 * @returns {Promise<Buffer>}
 */
export async function generateExcel({
  title,
  orgName = 'Business CRM',
  dateRange = {},
  summary = {},
  columns = [],
  data = [],
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Business CRM SaaS';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Report', {
    views: [{ showGridLines: true }],
  });

  // 1. Report Title & Organization Header
  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1E293B' } };
  titleRow.height = 24;

  const subRowText = `Organization: ${orgName} | Generated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`;
  const subRow = worksheet.addRow([subRowText]);
  subRow.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
  subRow.height = 18;

  if (dateRange.startDate && dateRange.endDate) {
    const rangeText = `Date Range: ${new Date(dateRange.startDate).toISOString().substring(0, 10)} to ${new Date(dateRange.endDate).toISOString().substring(0, 10)}`;
    const rangeRow = worksheet.addRow([rangeText]);
    rangeRow.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
    rangeRow.height = 18;
  }

  // 2. Summary Block (if present)
  if (summary && Object.keys(summary).length > 0) {
    worksheet.addRow([]); // Blank spacer
    const summaryHeader = worksheet.addRow(['--- Summary Overview ---']);
    summaryHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF334155' } };

    for (const [key, val] of Object.entries(summary)) {
      if (typeof val !== 'object') {
        const readableKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        const sumRow = worksheet.addRow([readableKey, val]);
        sumRow.font = { name: 'Segoe UI', size: 10 };
      }
    }
  }

  worksheet.addRow([]); // Blank spacer row

  // 3. Table Header Row
  const headerLabels = columns.map((col) => col.label);
  const headerRow = worksheet.addRow(headerLabels);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate-800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  // Freeze panes so header row stays visible on vertical scrolling
  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerRow.number,
      showGridLines: true,
    },
  ];

  // 4. Data Rows
  data.forEach((row, rowIndex) => {
    const rowValues = columns.map((col) => {
      let raw = row[col.key];
      if (col.format && typeof col.format === 'function') {
        return col.format(raw, row);
      }
      if (raw === null || raw === undefined) return '';
      if (typeof raw === 'object') return JSON.stringify(raw);
      return raw;
    });

    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 20;

    // Alternating zebra striping
    const isEven = rowIndex % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    dataRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgArgb },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // 5. Auto-fit column widths
  columns.forEach((col, index) => {
    let maxLen = col.label.length;
    data.forEach((row) => {
      const val = row[col.key];
      const str = val !== null && val !== undefined ? String(val) : '';
      if (str.length > maxLen) {
        maxLen = str.length;
      }
    });

    const colDef = worksheet.getColumn(index + 1);
    const calculatedWidth = Math.min(Math.max(maxLen + 3, col.width || 12), 45);
    colDef.width = calculatedWidth;
  });

  // Write to Buffer
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
