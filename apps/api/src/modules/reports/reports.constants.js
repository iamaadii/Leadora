// reports.constants.js
// Phase 9: Reports & Data Export Constants

export const REPORT_TYPES = {
  LEADS: 'leads',
  CONVERSIONS: 'conversions',
  LOST_LEADS: 'lost-leads',
  FOLLOWUPS: 'followups',
  EMPLOYEES: 'employees',
  TEAMS: 'teams',
  ACTIVITIES: 'activities',
};

export const PLATFORM_REPORT_TYPES = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
};

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
};

export const REPORT_TITLES = {
  [REPORT_TYPES.LEADS]: 'Lead Pipeline & Acquisition Report',
  [REPORT_TYPES.CONVERSIONS]: 'Lead Conversion & Sales Velocity Report',
  [REPORT_TYPES.LOST_LEADS]: 'Lost Leads & Deal Drop-off Report',
  [REPORT_TYPES.FOLLOWUPS]: 'Follow-up Task & Scheduling Report',
  [REPORT_TYPES.EMPLOYEES]: 'Sales Representative Performance Report',
  [REPORT_TYPES.TEAMS]: 'Team Performance & Conversion Report',
  [REPORT_TYPES.ACTIVITIES]: 'System Activity & Audit Log Report',
  [PLATFORM_REPORT_TYPES.ORGANIZATIONS]: 'Platform Organizations & Growth Report',
  [PLATFORM_REPORT_TYPES.USERS]: 'Platform Users & Role Distribution Report',
};

export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_EXPORT_LIMIT = 10000;

