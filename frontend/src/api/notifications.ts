import { api } from './client';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reservation_id: number | null;
}

export const notificationsApi = {
  list: () => api.get<{ notifications: AppNotification[] }>('/notifications/'),
  markRead: (id: number) => api.post<{ status: string }>(`/notifications/${id}/read/`, {}),
  markAllRead: () => api.post<{ status: string }>('/notifications/read-all/', {}),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count/'),
};
