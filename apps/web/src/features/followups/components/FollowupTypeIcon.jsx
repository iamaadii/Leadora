import React from 'react';
import { Phone, Mail, Video, CheckSquare } from 'lucide-react';

export function FollowupTypeIcon({ type, className = 'w-4 h-4' }) {
  switch (type) {
    case 'CALL':
      return <Phone className={`${className} text-blue-600`} />;
    case 'EMAIL':
      return <Mail className={`${className} text-indigo-600`} />;
    case 'MEETING':
      return <Video className={`${className} text-purple-600`} />;
    case 'TASK':
    default:
      return <CheckSquare className={`${className} text-emerald-600`} />;
  }
}

export function FollowupTypeLabel({ type }) {
  const labels = {
    CALL: 'Phone Call',
    EMAIL: 'Email Follow-up',
    MEETING: 'Meeting / Demo',
    TASK: 'General Task',
  };

  return <span>{labels[type] || type}</span>;
}
