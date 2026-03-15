import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, Notification } from '../../types';

const notificationService = {
          getAll: async (params?: { page?: number; limit?: number }) => {
                    const res = await api.get<PaginatedResponse<Notification>>(ENDPOINTS.NOTIFICATIONS.BASE, { params });
                    return res.data;
          },

          getUnreadCount: async () => {
                    const res = await api.get<ApiResponse<{ count: number }>>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
                    return res.data.data;
          },

          markAsRead: async (id: string) => {
                    const res = await api.patch<ApiResponse<Notification>>(ENDPOINTS.NOTIFICATIONS.READ(id));
                    return res.data.data;
          },

          markAllAsRead: async () => {
                    const res = await api.patch<ApiResponse<null>>(ENDPOINTS.NOTIFICATIONS.READ_ALL);
                    return res.data;
          },

          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.NOTIFICATIONS.DELETE(id));
                    return res.data;
          },
};

export default notificationService;
