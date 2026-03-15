import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../../../api/services/notification.service';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store/uiStore';

export const useNotifications = (page: number = 1, limit: number = 30) => {
          return useQuery({
                    queryKey: ['notifications', page],
                    queryFn: () => notificationService.getAll({ page, limit }),
          });
};

export const useUnreadCount = () => {
          return useQuery({
                    queryKey: ['notifications', 'unread'],
                    queryFn: notificationService.getUnreadCount,
          });
};

export const useNotificationMutations = () => {
          const qc = useQueryClient();
          const { locale } = useUIStore();

          const markRead = useMutation({
                    mutationFn: notificationService.markAsRead,
                    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
          });

          const markAllRead = useMutation({
                    mutationFn: notificationService.markAllAsRead,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['notifications'] });
                              toast.success(locale === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read');
                    },
          });

          const remove = useMutation({
                    mutationFn: notificationService.delete,
                    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
          });

          return { markRead, markAllRead, remove };
};
