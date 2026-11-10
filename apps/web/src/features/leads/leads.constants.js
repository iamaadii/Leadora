export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'CONVERTED',
  'LOST',
];

export const LEAD_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const LOSS_REASONS = [
  'Price too high',
  'Chose a competitor',
  'No response',
  'Not interested',
  'Budget unavailable',
  'Timing not suitable',
  'Requirements not matched',
  'Other',
];

export const LEAD_SOURCES = [
  'WEBSITE',
  'REFERRAL',
  'COLD_CALL',
  'LINKEDIN',
  'EVENT',
  'OTHER',
];

export const KANBAN_STAGES = [
  {
    id: 'NEW',
    label: 'New',
    color: 'border-t-sky-500',
    headerBg: 'bg-sky-50 text-sky-700',
    badgeDot: 'bg-sky-500',
    tagBg: 'bg-sky-100/80 text-sky-800',
  },
  {
    id: 'CONTACTED',
    label: 'Contacted',
    color: 'border-t-indigo-500',
    headerBg: 'bg-indigo-50 text-indigo-700',
    badgeDot: 'bg-indigo-500',
    tagBg: 'bg-indigo-100/80 text-indigo-800',
  },
  {
    id: 'INTERESTED',
    label: 'Interested',
    color: 'border-t-blue-500',
    headerBg: 'bg-blue-50 text-blue-700',
    badgeDot: 'bg-blue-500',
    tagBg: 'bg-blue-100/80 text-blue-800',
  },
  {
    id: 'QUALIFIED',
    label: 'Qualified',
    color: 'border-t-amber-500',
    headerBg: 'bg-amber-50 text-amber-700',
    badgeDot: 'bg-amber-500',
    tagBg: 'bg-amber-100/80 text-amber-800',
  },
  {
    id: 'PROPOSAL_SENT',
    label: 'Proposal Sent',
    color: 'border-t-purple-500',
    headerBg: 'bg-purple-50 text-purple-700',
    badgeDot: 'bg-purple-500',
    tagBg: 'bg-purple-100/80 text-purple-800',
  },
  {
    id: 'CONVERTED',
    label: 'Converted',
    color: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50 text-emerald-700',
    badgeDot: 'bg-emerald-500',
    tagBg: 'bg-emerald-100/80 text-emerald-800',
  },
  {
    id: 'LOST',
    label: 'Lost',
    color: 'border-t-rose-500',
    headerBg: 'bg-rose-50 text-rose-700',
    badgeDot: 'bg-rose-500',
    tagBg: 'bg-rose-100/80 text-rose-800',
  },
];
