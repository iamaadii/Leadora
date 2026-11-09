import React from 'react';
import { Badge } from '../../../components/ui/Badge.jsx';

const STATUS_CONFIG = {
  NEW: { label: 'New', variant: 'primary' },
  CONTACTED: { label: 'Contacted', variant: 'info' },
  INTERESTED: { label: 'Interested', variant: 'warning' },
  QUALIFIED: { label: 'Qualified', variant: 'primary' },
  PROPOSAL_SENT: { label: 'Proposal Sent', variant: 'warning' },
  CONVERTED: { label: 'Converted', variant: 'success' },
  LOST: { label: 'Lost', variant: 'danger' },
};

export function LeadStatusBadge({ status, size = 'sm', className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    variant: 'neutral',
  };

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}
