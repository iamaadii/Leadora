// reports.service.js
// Phase 9: Reports & Data Export API Client

import { apiClient } from '../../../services/api.js';

export const reportsService = {
  /**
   * Fetch paginated tenant report data with filters
   * @param {string} reportType
   * @param {object} params
   */
  async getReport(reportType, params = {}) {
    const res = await apiClient.get(`/v1/reports/${reportType}`, { params });
    return res.data;
  },

  /**
   * Export tenant report as direct file download (CSV, Excel, or PDF)
   * @param {string} reportType
   * @param {'csv'|'excel'|'pdf'} format
   * @param {object} params
   */
  async exportReport(reportType, format, params = {}) {
    const response = await apiClient.get(`/v1/reports/${reportType}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    });

    return this._triggerDownload(response, `${reportType}-report.${format === 'excel' ? 'xlsx' : format}`);
  },

  /**
   * Fetch paginated platform report data (Super Admin only)
   * @param {string} reportType
   * @param {object} params
   */
  async getPlatformReport(reportType, params = {}) {
    const res = await apiClient.get(`/v1/platform/reports/${reportType}`, { params });
    return res.data;
  },

  /**
   * Export platform report as direct file download (CSV, Excel, or PDF)
   * @param {string} reportType
   * @param {'csv'|'excel'|'pdf'} format
   * @param {object} params
   */
  async exportPlatformReport(reportType, format, params = {}) {
    const response = await apiClient.get(`/v1/platform/reports/${reportType}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    });

    return this._triggerDownload(response, `platform-${reportType}.${format === 'excel' ? 'xlsx' : format}`);
  },

  /**
   * Helper: Trigger browser file download from Blob response
   */
  _triggerDownload(response, defaultFilename) {
    let filename = defaultFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return filename;
  },
};
