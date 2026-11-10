import React from 'react';
import { Badge } from '../../../components/ui/Badge.jsx';

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', variant: 'neutral' },
  MEDIUM: { label: 'Medium', variant: 'info' },
  HIGH: { label: 'High', variant: 'warning' },
  URGENT: { label: 'Urgent', variant: 'danger' },
};

export function LeadPriorityBadge({ priority = 'MEDIUM', size = 'sm', className = '' }) {
  const config = PRIORITY_CONFIG[priority?.toUpperCase()] || {
    label: priority || 'Medium',
    variant: 'neutral',
  };

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}
