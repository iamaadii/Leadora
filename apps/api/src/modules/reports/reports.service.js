// reports.service.js
// Phase 9: Reports & Data Export Business Logic & Exporter Orchestration

import { reportsRepository } from './reports.repository.js';
import { generateCsv } from './exporters/csv.exporter.js';
import { generateExcel } from './exporters/excel.exporter.js';
import { generatePdf } from './exporters/pdf.exporter.js';
import { AppError } from '../../errors/app-error.js';
import {
  REPORT_TYPES,
  PLATFORM_REPORT_TYPES,
  EXPORT_FORMATS,
  REPORT_TITLES,
  MAX_EXPORT_LIMIT,
} from './reports.constants.js';

// Table column mappings for each report category
const REPORT_COLUMNS = {
  [REPORT_TYPES.LEADS]: [
    { label: 'Lead Name', key: 'name', width: 20 },
    { label: 'Company', key: 'company', width: 18 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Phone', key: 'phone', width: 14 },
    { label: 'Source', key: 'source', width: 12 },
    { label: 'Status', key: 'status', width: 14 },
    { label: 'Assigned Rep', key: 'assignedTo', width: 18 },
    { label: 'Team', key: 'teamName', width: 15 },
    {
      label: 'Created Date',
      key: 'createdAt',
      width: 18,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
  ],
  [REPORT_TYPES.CONVERSIONS]: [
    { label: 'Lead Name', key: 'name', width: 20 },
    { label: 'Company', key: 'company', width: 18 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Source', key: 'source', width: 12 },
    { label: 'Assigned Rep', key: 'assignedTo', width: 18 },
    { label: 'Team', key: 'teamName', width: 15 },
    {
      label: 'Created Date',
      key: 'createdAt',
      width: 14,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
    {
      label: 'Converted Date',
      key: 'convertedAt',
      width: 14,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
    { label: 'Days to Convert', key: 'daysToConvert', width: 14 },
  ],
  [REPORT_TYPES.LOST_LEADS]: [
    { label: 'Lead Name', key: 'name', width: 20 },
    { label: 'Company', key: 'company', width: 18 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Source', key: 'source', width: 12 },
    { label: 'Assigned Rep', key: 'assignedTo', width: 18 },
    { label: 'Team', key: 'teamName', width: 15 },
    {
      label: 'Lost Date',
      key: 'lostAt',
      width: 14,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
    { label: 'Loss Reason / Note', key: 'lossNote', width: 30 },
  ],
  [REPORT_TYPES.FOLLOWUPS]: [
    { label: 'Follow-up Title', key: 'title', width: 22 },
    { label: 'Lead Name', key: 'leadName', width: 18 },
    { label: 'Company', key: 'company', width: 16 },
    { label: 'Type', key: 'type', width: 10 },
    { label: 'Priority', key: 'priority', width: 10 },
    { label: 'Status', key: 'status', width: 12 },
    {
      label: 'Due Date',
      key: 'dueAt',
      width: 16,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 16).replace('T', ' ') : ''),
    },
    { label: 'Assigned Rep', key: 'assignedTo', width: 18 },
    { label: 'Notes', key: 'notes', width: 25 },
  ],
  [REPORT_TYPES.EMPLOYEES]: [
    { label: 'Representative Name', key: 'name', width: 20 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Role', key: 'role', width: 12 },
    { label: 'Team', key: 'teamName', width: 15 },
    { label: 'Total Leads', key: 'totalLeads', width: 12 },
    { label: 'Won Leads', key: 'convertedLeads', width: 12 },
    { label: 'Lost Leads', key: 'lostLeads', width: 12 },
    {
      label: 'Conversion Rate',
      key: 'conversionRate',
      width: 15,
      format: (val) => `${val}%`,
    },
    { label: 'Total Follow-ups', key: 'totalFollowups', width: 14 },
    { label: 'Completed Follow-ups', key: 'completedFollowups', width: 16 },
    {
      label: 'Follow-up Completion Rate',
      key: 'followupCompletionRate',
      width: 18,
      format: (val) => `${val}%`,
    },
  ],
  [REPORT_TYPES.TEAMS]: [
    { label: 'Team Name', key: 'name', width: 20 },
    { label: 'Manager', key: 'managerName', width: 18 },
    { label: 'Members', key: 'memberCount', width: 10 },
    { label: 'Assigned Leads', key: 'totalLeads', width: 14 },
    { label: 'Won Leads', key: 'wonLeads', width: 12 },
    { label: 'Lost Leads', key: 'lostLeads', width: 12 },
    {
      label: 'Conversion Rate',
      key: 'conversionRate',
      width: 15,
      format: (val) => `${val}%`,
    },
    { label: 'Completed Follow-ups', key: 'completedFollowups', width: 18 },
    { label: 'Status', key: 'isActive', width: 10 },
  ],
  [REPORT_TYPES.ACTIVITIES]: [
    {
      label: 'Timestamp',
      key: 'createdAt',
      width: 18,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 19).replace('T', ' ') : ''),
    },
    { label: 'Activity Type', key: 'activityType', width: 18 },
    { label: 'Description', key: 'description', width: 30 },
    { label: 'Lead Name', key: 'leadName', width: 18 },
    { label: 'Company', key: 'company', width: 16 },
    { label: 'Actor', key: 'actorName', width: 18 },
    { label: 'Actor Email', key: 'actorEmail', width: 22 },
  ],
  [PLATFORM_REPORT_TYPES.ORGANIZATIONS]: [
    { label: 'Organization Name', key: 'name', width: 22 },
    { label: 'Slug', key: 'slug', width: 16 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Status', key: 'status', width: 10 },
    { label: 'Users', key: 'userCount', width: 10 },
    { label: 'Leads', key: 'leadCount', width: 10 },
    {
      label: 'Created Date',
      key: 'createdAt',
      width: 16,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
  ],
  [PLATFORM_REPORT_TYPES.USERS]: [
    { label: 'User Name', key: 'name', width: 20 },
    { label: 'Email', key: 'email', width: 22 },
    { label: 'Role', key: 'role', width: 14 },
    { label: 'Organization', key: 'organization', width: 20 },
    { label: 'Status', key: 'status', width: 10 },
    {
      label: 'Last Login',
      key: 'lastLoginAt',
      width: 16,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 16).replace('T', ' ') : 'Never'),
    },
    {
      label: 'Registered Date',
      key: 'createdAt',
      width: 16,
      format: (val) => (val ? new Date(val).toISOString().substring(0, 10) : ''),
    },
  ],
};

export const reportsService = {
  /**
   * Helper: Parse Date Range Query
   */
  _parseDateRange(query = {}) {
    const range = query.range || '30d';
    const now = new Date();

    let startDate;
    let endDate = new Date(now.getTime());

    switch (range) {
      case 'today': {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        break;
      }
      case '7d': {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case '90d': {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'this_month': {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        break;
      }
      case 'prev_month': {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        endDate = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
        );
        break;
      }
      case 'custom': {
        startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = query.endDate ? new Date(query.endDate) : now;
        break;
      }
      case '30d':
      default: {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
    }

    return {
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  },

  /**
   * Helper: Get Raw Report Data from Repository
   */
  async _fetchReportData(user, reportType, query, isExport = false) {
    const dateRange = this._parseDateRange(query);
    const filters = {
      ...query,
      startDate: query.startDate || dateRange.startDate,
      endDate: query.endDate || dateRange.endDate,
    };

    const limit = isExport ? MAX_EXPORT_LIMIT : (query.limit || 50);
    const offset = isExport ? 0 : ((query.page || 1) - 1) * limit;

    const commonParams = {
      organizationId: user.organizationId,
      role: user.role,
      userId: user.id,
      filters,
      limit,
      offset,
      isExport,
    };

    let result;
    switch (reportType) {
      case REPORT_TYPES.LEADS:
        result = await reportsRepository.getLeadReport(commonParams);
        break;
      case REPORT_TYPES.CONVERSIONS:
        result = await reportsRepository.getConversionReport(commonParams);
        break;
      case REPORT_TYPES.LOST_LEADS:
        result = await reportsRepository.getLostLeadsReport(commonParams);
        break;
      case REPORT_TYPES.FOLLOWUPS:
        result = await reportsRepository.getFollowupReport(commonParams);
        break;
      case REPORT_TYPES.EMPLOYEES:
        result = await reportsRepository.getEmployeeReport(commonParams);
        break;
      case REPORT_TYPES.TEAMS:
        result = await reportsRepository.getTeamReport(commonParams);
        break;
      case REPORT_TYPES.ACTIVITIES:
        result = await reportsRepository.getActivityReport(commonParams);
        break;
      default:
        throw AppError.badRequest(`Unknown report category: ${reportType}`, 'INVALID_REPORT_TYPE');
    }

    return {
      reportType,
      title: REPORT_TITLES[reportType] || 'CRM Report',
      columns: REPORT_COLUMNS[reportType] || [],
      dateRange,
      summary: result.summary,
      totalCount: result.totalCount,
      rows: result.rows,
    };
  },

  /**
   * 1. Get Tenant JSON Report Preview for Frontend UI
   */
  async getReport(user, reportType, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales reports.',
        'FORBIDDEN',
      );
    }

    const reportData = await this._fetchReportData(user, reportType, query, false);

    const page = query.page || 1;
    const limit = query.limit || 50;
    const totalPages = Math.ceil(reportData.totalCount / limit) || 1;

    return {
      reportType: reportData.reportType,
      title: reportData.title,
      columns: reportData.columns,
      dateRange: reportData.dateRange,
      summary: reportData.summary,
      data: reportData.rows,
      pagination: {
        page,
        limit,
        totalItems: reportData.totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * 2. Export Tenant Report in CSV, Excel, or PDF format
   */
  async exportReport(user, reportType, format, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales reports.',
        'FORBIDDEN',
      );
    }

    const reportData = await this._fetchReportData(user, reportType, query, true);
    const dateStamp = new Date().toISOString().substring(0, 10);

    const exportOptions = {
      title: reportData.title,
      orgName: user.organizationName || 'Business CRM',
      dateRange: reportData.dateRange,
      summary: reportData.summary,
      columns: reportData.columns,
      data: reportData.rows,
    };

    let buffer;
    let contentType;
    let filename;

    switch (format) {
      case EXPORT_FORMATS.CSV:
        buffer = generateCsv(exportOptions);
        contentType = 'text/csv; charset=utf-8';
        filename = `${reportType}-report-${dateStamp}.csv`;
        break;
      case EXPORT_FORMATS.EXCEL:
        buffer = await generateExcel(exportOptions);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${reportType}-report-${dateStamp}.xlsx`;
        break;
      case EXPORT_FORMATS.PDF:
        buffer = await generatePdf(exportOptions);
        contentType = 'application/pdf';
        filename = `${reportType}-report-${dateStamp}.pdf`;
        break;
      default:
        throw AppError.badRequest(`Unsupported export format: ${format}`, 'INVALID_EXPORT_FORMAT');
    }

    return {
      buffer,
      contentType,
      filename,
    };
  },

  /**
   * 3. Platform Super Admin JSON Reports
   */
  async getPlatformReport(user, reportType, query) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden(
        'Only Platform Super Admins can access platform reports.',
        'FORBIDDEN',
      );
    }

    const limit = query.limit || 50;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    let result;
    if (reportType === PLATFORM_REPORT_TYPES.ORGANIZATIONS) {
      result = await reportsRepository.getPlatformOrganizationsReport({ limit, offset, isExport: false });
    } else if (reportType === PLATFORM_REPORT_TYPES.USERS) {
      result = await reportsRepository.getPlatformUsersReport({ limit, offset, isExport: false });
    } else {
      throw AppError.badRequest(`Invalid platform report type: ${reportType}`, 'INVALID_REPORT_TYPE');
    }

    const totalPages = Math.ceil(result.totalCount / limit) || 1;

    return {
      reportType,
      title: REPORT_TITLES[reportType],
      columns: REPORT_COLUMNS[reportType] || [],
      summary: result.summary,
      data: result.rows,
      pagination: {
        page,
        limit,
        totalItems: result.totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * 4. Platform Super Admin Data Exports
   */
  async exportPlatformReport(user, reportType, format, _query) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden(
        'Only Platform Super Admins can access platform reports.',
        'FORBIDDEN',
      );
    }

    let result;
    if (reportType === PLATFORM_REPORT_TYPES.ORGANIZATIONS) {
      result = await reportsRepository.getPlatformOrganizationsReport({ isExport: true });
    } else if (reportType === PLATFORM_REPORT_TYPES.USERS) {
      result = await reportsRepository.getPlatformUsersReport({ isExport: true });
    } else {
      throw AppError.badRequest(`Invalid platform report type: ${reportType}`, 'INVALID_REPORT_TYPE');
    }

    const title = REPORT_TITLES[reportType];
    const columns = REPORT_COLUMNS[reportType] || [];
    const dateStamp = new Date().toISOString().substring(0, 10);

    const exportOptions = {
      title,
      orgName: 'Platform Central Administration',
      summary: result.summary,
      columns,
      data: result.rows,
    };

    let buffer;
    let contentType;
    let filename;

    switch (format) {
      case EXPORT_FORMATS.CSV:
        buffer = generateCsv(exportOptions);
        contentType = 'text/csv; charset=utf-8';
        filename = `platform-${reportType}-${dateStamp}.csv`;
        break;
      case EXPORT_FORMATS.EXCEL:
        buffer = await generateExcel(exportOptions);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `platform-${reportType}-${dateStamp}.xlsx`;
        break;
      case EXPORT_FORMATS.PDF:
        buffer = await generatePdf(exportOptions);
        contentType = 'application/pdf';
        filename = `platform-${reportType}-${dateStamp}.pdf`;
        break;
      default:
        throw AppError.badRequest(`Unsupported export format: ${format}`, 'INVALID_EXPORT_FORMAT');
    }

    return {
      buffer,
      contentType,
      filename,
    };
  },
};
