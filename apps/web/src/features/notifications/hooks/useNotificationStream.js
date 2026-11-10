// useNotificationStream.js
// Phase H: Real-Time Server-Sent Events (SSE) Hook for In-App Notifications

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { getMemoryToken } from '../../../services/api.js';
import { useToast } from '../../../components/ui/Toast.jsx';
import { NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useNotifications.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function useNotificationStream() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    // Disable in Demo mode, for Super Admins (platform level), or when not authenticated
    if (isDemo || isSuperAdmin || !user?.id) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    if (typeof window === 'undefined' || !window.EventSource) {
      // Fallback to polling mode
      return;
    }

    function connectSSE() {
      const token = getMemoryToken();
      if (!token) {
        // Retry shortly if token is momentarily refreshing
        reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
        return;
      }

      const streamUrl = `${API_BASE_URL}/v1/notifications/stream?token=${encodeURIComponent(token)}`;

      try {
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.addEventListener('connected', () => {
          setIsConnected(true);
        });

        es.addEventListener('notification.created', (event) => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

          try {
            const data = JSON.parse(event.data);
            if (data?.title) {
              toast.info(data.message || data.title, data.title);
            }
          } catch {
            // Non-JSON payload
          }
        });

        es.addEventListener('notification.read', () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
        });

        es.addEventListener('notification.all_read', () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
        });

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          eventSourceRef.current = null;
          // Reconnect with exponential backoff / retry after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connectSSE, 5000);
        };
      } catch {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectSSE, 5000);
      }
    }

    connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user?.id, isDemo, isSuperAdmin, queryClient, toast]);

  return { isConnected };
}
