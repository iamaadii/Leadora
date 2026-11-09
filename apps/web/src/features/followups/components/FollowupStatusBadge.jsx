import React from 'react';
import { Badge } from '../../../components/ui/Badge.jsx';

export function FollowupStatusBadge({ status, dueAt, isOverdue }) {
  const isPastDue = isOverdue || (status === 'PENDING' && dueAt && new Date(dueAt).getTime() < Date.now());

  if (status === 'COMPLETED') {
    return (
      <Badge variant="success" size="sm" dot>
        Completed
      </Badge>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <Badge variant="neutral" size="sm">
        Cancelled
      </Badge>
    );
  }

  if (isPastDue) {
    return (
      <Badge variant="danger" size="sm" dot>
        Overdue
      </Badge>
    );
  }

  return (
    <Badge variant="warning" size="sm" dot>
      Pending
    </Badge>
  );
}
