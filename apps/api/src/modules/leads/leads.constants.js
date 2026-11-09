export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'CONVERTED',
  'LOST',
];

export const LEAD_SOURCES = [
  'WEBSITE',
  'REFERRAL',
  'COLD_CALL',
  'LINKEDIN',
  'EVENT',
  'OTHER',
];

export const LEAD_ACTIVITY_TYPES = {
  CREATED: 'LEAD_CREATED',
  UPDATED: 'LEAD_UPDATED',
  ASSIGNED: 'LEAD_ASSIGNED',
  STATUS_CHANGED: 'LEAD_STATUS_CHANGED',
  ARCHIVED: 'LEAD_ARCHIVED',
  RESTORED: 'LEAD_RESTORED',
};

export const ALLOWED_SORT_FIELDS = [
  'created_at',
  'updated_at',
  'name',
  'company',
  'status',
];

export const ALLOWED_SORT_ORDERS = ['ASC', 'DESC'];
