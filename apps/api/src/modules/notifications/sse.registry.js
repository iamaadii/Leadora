// sse.registry.js
// Phase H: Server-Sent Events (SSE) Client Registry for Real-Time In-App Notifications

class SSERegistry {
  constructor() {
    // Map<userId, Set<{ id: string, organizationId: string, res: object }>>
    this.clientsByUser = new Map();

    // Heartbeat keep-alive ping every 25 seconds
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 25000);
    if (this.heartbeatInterval.unref) {
      this.heartbeatInterval.unref();
    }
  }

  /**
   * Register active SSE client connection
   */
  addClient(userId, organizationId, res) {
    if (!this.clientsByUser.has(userId)) {
      this.clientsByUser.set(userId, new Set());
    }

    const clientId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const client = { id: clientId, organizationId, res };

    this.clientsByUser.get(userId).add(client);

    return () => {
      this.removeClient(userId, client);
    };
  }

  /**
   * Remove disconnected client
   */
  removeClient(userId, client) {
    const userClients = this.clientsByUser.get(userId);
    if (userClients) {
      userClients.delete(client);
      if (userClients.size === 0) {
        this.clientsByUser.delete(userId);
      }
    }
  }

  /**
   * Heartbeat to prevent browser / proxy timeouts
   */
  sendHeartbeat() {
    for (const [userId, clients] of this.clientsByUser.entries()) {
      for (const client of clients) {
        try {
          client.res.write(': keepalive\n\n');
        } catch {
          this.removeClient(userId, client);
        }
      }
    }
  }

  /**
   * Write an event to a single client response
   */
  _sendEvent(res, eventType, data) {
    try {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // Stream write error - connection dead
    }
  }

  /**
   * Broadcast an event to a specific user within an organization
   */
  broadcastToUser(userId, organizationId, eventType, data) {
    const clients = this.clientsByUser.get(userId);
    if (!clients || clients.size === 0) return;

    for (const client of clients) {
      if (client.organizationId === organizationId) {
        this._sendEvent(client.res, eventType, data);
      }
    }
  }

  /**
   * Broadcast an event to all users within an organization
   */
  broadcastToOrganization(organizationId, eventType, data) {
    for (const [, clients] of this.clientsByUser.entries()) {
      for (const client of clients) {
        if (client.organizationId === organizationId) {
          this._sendEvent(client.res, eventType, data);
        }
      }
    }
  }
}

export const sseRegistry = new SSERegistry();
