import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service.js';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationsService.getNotifications(params),
    ...options,
  });
}

export function useUnreadNotificationCount(options = {}) {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
    ...options,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}
