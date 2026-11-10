// notification-navigation.js
// Resolves target redirect destinations for in-app notifications

/**
 * Extracts a quoted substring from text (e.g. `lead "John Connor"` => `John Connor`)
 */
function extractQuotedText(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/"([^"]+)"/) || text.match(/'([^']+)'/);
  return match ? match[1].trim() : null;
}

/**
 * Computes destination URL for a given notification item
 *
 * @param {Object} notif
 * @param {boolean} isDemo
 * @returns {string} URL to redirect to
 */
export function getNotificationRedirectUrl(notif, isDemo = false) {
  if (!notif) return isDemo ? '/demo' : '/dashboard';

  const prefix = isDemo ? '/demo' : '';
  const rawType = (notif.notificationType || notif.notification_type || notif.type || '').toUpperCase();
  const rawEntity = (notif.entityType || notif.entity_type || '').toUpperCase();
  const entityId = notif.entityId || notif.entity_id || notif.metadata?.leadId || notif.metadata?.followupId;
  const metadata = notif.metadata || {};
  const title = (notif.title || '').toLowerCase();
  const message = (notif.message || '').toLowerCase();

  // 1. Explicit link/url in metadata
  if (metadata.url || metadata.targetUrl || metadata.link) {
    const customUrl = metadata.url || metadata.targetUrl || metadata.link;
    if (isDemo && customUrl.startsWith('/') && !customUrl.startsWith('/demo')) {
      return `/demo${customUrl}`;
    }
    return customUrl;
  }

  // 2. Lead-related notification
  const isLead =
    rawEntity === 'LEAD' ||
    rawType.includes('LEAD') ||
    rawType.includes('DEAL') ||
    title.includes('lead') ||
    title.includes('deal');

  if (isLead) {
    // If entityId is a lead ID
    const leadId = rawEntity === 'LEAD' && entityId ? entityId : metadata.leadId;
    if (leadId) {
      return `${prefix}/leads/${leadId}`;
    }

    // Try extracting lead name from metadata or message
    const leadName = metadata.leadName || extractQuotedText(notif.message) || extractQuotedText(notif.title);
    if (leadName) {
      return `${prefix}/leads?search=${encodeURIComponent(leadName)}`;
    }

    return `${prefix}/leads`;
  }

  // 3. Follow-up / Task-related notification
  const isFollowup =
    rawEntity === 'FOLLOWUP' ||
    rawEntity === 'FOLLOW_UP' ||
    rawType.includes('FOLLOWUP') ||
    rawType.includes('TASK') ||
    title.includes('follow-up') ||
    title.includes('followup') ||
    title.includes('task');

  if (isFollowup) {
    // Overdue task alert
    if (rawType.includes('OVERDUE') || title.includes('overdue') || message.includes('overdue')) {
      return `${prefix}/follow-ups?tab=OVERDUE`;
    }

    // Due today task alert
    if (rawType.includes('DUE_TODAY') || title.includes('due today') || message.includes('due today') || message.includes('scheduled for today')) {
      return `${prefix}/follow-ups?tab=DUE_TODAY`;
    }

    // Task name search if available
    const taskName = metadata.taskTitle || metadata.followupTitle || extractQuotedText(notif.message);
    if (taskName) {
      return `${prefix}/follow-ups?search=${encodeURIComponent(taskName)}`;
    }

    return `${prefix}/follow-ups`;
  }

  // 4. Team-related notification
  const isTeam =
    rawEntity === 'TEAM' ||
    rawType.includes('TEAM') ||
    title.includes('team') ||
    message.includes('team');

  if (isTeam) {
    const teamId = rawEntity === 'TEAM' && entityId ? entityId : metadata.teamId;
    if (teamId) {
      return `${prefix}/teams/${teamId}`;
    }
    return `${prefix}/teams`;
  }

  // 5. Employee / User-related notification
  const isUser =
    rawEntity === 'USER' ||
    rawType.includes('EMPLOYEE') ||
    rawType.includes('USER') ||
    title.includes('employee');

  if (isUser) {
    return `${prefix}/employees`;
  }

  // 6. Organization-related notification
  if (rawEntity === 'ORGANIZATION' || rawType.includes('ORGANIZATION') || title.includes('organization')) {
    return '/platform/organizations';
  }

  // 7. General text fallback
  if (message.includes('lead')) {
    const quotedLead = extractQuotedText(notif.message);
    if (quotedLead) {
      return `${prefix}/leads?search=${encodeURIComponent(quotedLead)}`;
    }
    return `${prefix}/leads`;
  }

  if (message.includes('follow-up') || message.includes('task')) {
    return `${prefix}/follow-ups`;
  }

  return `${prefix}/notifications`;
}

/**
 * Returns human-friendly badge label for notification entity
 */
export function getNotificationEntityLabel(notif) {
  if (!notif) return null;
  const rawEntity = (notif.entityType || notif.entity_type || '').toUpperCase();
  const rawType = (notif.notificationType || notif.notification_type || notif.type || '').toUpperCase();
  const title = (notif.title || '').toLowerCase();

  if (rawEntity === 'LEAD' || rawType.includes('LEAD') || rawType.includes('DEAL') || title.includes('lead')) {
    return 'Lead';
  }
  if (rawEntity === 'FOLLOWUP' || rawEntity === 'FOLLOW_UP' || rawType.includes('FOLLOWUP') || title.includes('follow-up')) {
    return 'Follow-up';
  }
  if (rawEntity === 'TEAM' || rawType.includes('TEAM') || title.includes('team')) {
    return 'Team';
  }
  if (rawEntity === 'USER' || rawType.includes('EMPLOYEE') || title.includes('employee')) {
    return 'Employee';
  }
  return null;
}

