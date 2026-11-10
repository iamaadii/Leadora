# Real-Time Notifications with Server-Sent Events (SSE)

## Overview

Leadora delivers instantaneous in-app notification updates to connected users using Server-Sent Events (SSE). This replaces polling and delivers real-time notifications for:
- Lead assignments and reassignments
- Follow-up creation and overdue reminders
- Organization announcements

---

## Architecture

1. **Protocol**: HTTP/1.1 or HTTP/2 `text/event-stream` over persistent connections.
2. **Registry**: `apps/api/src/modules/notifications/sse.registry.js` manages active client streams in an in-memory `Map` keyed by `userId` and scoped by `organizationId`.
3. **Endpoint**: `GET /api/v1/notifications/stream` (authenticated via Bearer header or `?token=` query param).
4. **Heartbeat**: A periodic comment ping (`: keepalive\n\n`) is sent every 25 seconds to keep proxies (including Nginx and cloud load balancers) from dropping idle connections.
5. **Zero External Brokers**: No Redis, RabbitMQ, or Kafka required. Events are dispatched after existing database transactions commit.

---

## Event Types

| Event Name | Payload Description | Client Action |
|---|---|---|
| `connected` | `{ userId }` | Sets `isConnected = true` in frontend hook. |
| `notification.created` | Full notification record `{ id, title, message, ... }` | Invalidates TanStack Query cache; triggers toast alert. |
| `notification.read` | `{ id, readAt }` | Invalidates unread count and notification list cache. |
| `notification.all_read` | `{ timestamp }` | Resets unread counter badge to 0. |

---

## Frontend Integration

The custom hook `apps/web/src/features/notifications/hooks/useNotificationStream.js`:
- Uses the browser's native `EventSource`.
- Automatically connects on login and closes gracefully on logout or unmount.
- Automatically handles reconnection with backoff if network drops.
- Falls back gracefully to background polling (every 30s) if SSE is blocked by client firewall.
- Is automatically disabled when navigating in Demo Mode.

