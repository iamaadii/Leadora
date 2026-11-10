// pdf.exporter.js
// Phase 9: Printable PDF Generation using PDFKit

import PDFDocument from 'pdfkit';

/**
 * Generates formatted PDF Buffer
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
export function generatePdf({
  title,
  orgName = 'Leadora CRM',
  dateRange = {},
  summary = {},
  columns = [],
  data = [],
}) {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 for wide CRM tables
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 36,
        bufferPages: true,
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - 72; // 36 left + 36 right margins

      // --- Document Header ---
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#0F172A')
        .text(title, 36, 36);

      const generatedStr = `Organization: ${orgName} | Generated: ${new Date().toISOString().substring(0, 19).replace('T', ' ')} UTC`;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748B')
        .text(generatedStr, 36, 56);

      if (dateRange.startDate && dateRange.endDate) {
        const rangeText = `Date Range: ${new Date(dateRange.startDate).toISOString().substring(0, 10)} to ${new Date(dateRange.endDate).toISOString().substring(0, 10)}`;
        doc.text(rangeText, 36, 68);
      }

      // Horizontal separator line
      doc
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .moveTo(36, 82)
        .lineTo(pageWidth - 36, 82)
        .stroke();

      let currentY = 92;

      // --- Summary KPIs Block ---
      if (summary && Object.keys(summary).length > 0) {
        const kpiEntries = Object.entries(summary).filter(([, v]) => typeof v !== 'object');
        if (kpiEntries.length > 0) {
          doc
            .rect(36, currentY, contentWidth, 32)
            .fillAndStroke('#F1F5F9', '#CBD5E1');

          const cardWidth = contentWidth / Math.min(kpiEntries.length, 5);
          kpiEntries.slice(0, 5).forEach(([key, val], idx) => {
            const cardX = 36 + idx * cardWidth;
            const readableKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            doc
              .font('Helvetica-Bold')
              .fontSize(8)
              .fillColor('#475569')
              .text(readableKey.substring(0, 20), cardX + 8, currentY + 6, {
                width: cardWidth - 16,
                align: 'left',
              });

            doc
              .font('Helvetica-Bold')
              .fontSize(11)
              .fillColor('#0F172A')
              .text(String(val), cardX + 8, currentY + 16, {
                width: cardWidth - 16,
                align: 'left',
              });
          });

          currentY += 42;
        }
      }

      // --- Table Setup ---
      // Distribute column widths dynamically
      const totalColWeight = columns.reduce((acc, col) => acc + (col.width || 1), 0);
      const colWidths = columns.map((col) => ((col.width || 1) / totalColWeight) * contentWidth);

      const renderHeaderRow = (yPos) => {
        doc.rect(36, yPos, contentWidth, 20).fill('#1E293B');

        let colX = 36;
        columns.forEach((col, idx) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor('#FFFFFF')
            .text(col.label, colX + 4, yPos + 5, {
              width: colWidths[idx] - 8,
              ellipsis: true,
            });
          colX += colWidths[idx];
        });
      };

      renderHeaderRow(currentY);
      currentY += 20;

      // --- Data Rows ---
      const bottomLimit = pageHeight - 45;

      data.forEach((row, rowIndex) => {
        // Pre-compute formatted cell values
        const cellValues = columns.map((col) => {
          let val = row[col.key];
          if (col.format && typeof col.format === 'function') {
            val = col.format(val, row);
          }
          if (val === null || val === undefined) val = '-';
          if (typeof val === 'object') val = JSON.stringify(val);
          return String(val);
        });

        // Compute dynamic row height based on text wrap across all columns
        doc.font('Helvetica').fontSize(8);
        let maxTextHeight = 10;
        columns.forEach((col, idx) => {
          const text = cellValues[idx];
          const availableWidth = colWidths[idx] - 8;
          const textHeight = doc.heightOfString(text, { width: availableWidth });
          if (textHeight > maxTextHeight) {
            maxTextHeight = textHeight;
          }
        });

        // Add 8pt padding (4pt top + 4pt bottom) and cap row height to 44pt (approx 3 lines) to prevent runaway rows
        const calculatedRowHeight = Math.max(18, Math.min(Math.ceil(maxTextHeight + 8), 44));

        // If row will overflow page, create a new page
        if (currentY + calculatedRowHeight > bottomLimit) {
          doc.addPage();
          currentY = 36;
          renderHeaderRow(currentY);
          currentY += 20;
        }

        // Alternating zebra background
        const isEven = rowIndex % 2 === 0;
        if (!isEven) {
          doc.rect(36, currentY, contentWidth, calculatedRowHeight).fill('#F8FAFC');
        }

        let colX = 36;
        columns.forEach((col, idx) => {
          const val = cellValues[idx];
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#1E293B')
            .text(val, colX + 4, currentY + 4, {
              width: colWidths[idx] - 8,
              height: calculatedRowHeight - 8,
              ellipsis: true,
              lineBreak: true,
            });

          colX += colWidths[idx];
        });

        // Bottom border line for each row
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(0.5)
          .moveTo(36, currentY + calculatedRowHeight)
          .lineTo(pageWidth - 36, currentY + calculatedRowHeight)
          .stroke();

        currentY += calculatedRowHeight;
      });

      // --- Page Footers: Page X of Y ---
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const prevBottomMargin = doc.page.margins.bottom;
        // Temporarily clear bottom margin check to prevent PDFKit from triggering auto addPage()
        doc.page.margins.bottom = 0;
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94A3B8')
          .text(
            `Page ${i + 1} of ${range.count} | Leadora Confidential`,
            36,
            pageHeight - 24,
            { align: 'center', width: contentWidth, lineBreak: false }
          );
        doc.page.margins.bottom = prevBottomMargin;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

