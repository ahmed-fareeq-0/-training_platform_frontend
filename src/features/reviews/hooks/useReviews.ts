import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../../api/services/admin.service';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store/uiStore';

export const useWorkshopReviews = (workshopId: string | null) => {
          return useQuery({
                    queryKey: ['reviews', workshopId],
                    queryFn: () => reviewService.getByWorkshop(workshopId!),
                    enabled: !!workshopId,
          });
};

export const useReviewMutations = (onSuccessCallback?: () => void) => {
          const qc = useQueryClient();
          const { locale } = useUIStore();

          const createReview = useMutation({
                    mutationFn: (data: Record<string, unknown>) => reviewService.create(data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['reviews'] });
                              toast.success(locale === 'ar' ? 'تم إرسال التقييم' : 'Review submitted');
                              if (onSuccessCallback) onSuccessCallback();
                    },
          });

          const updateReview = useMutation({
                    mutationFn: ({ id, data }: { id: string, data: Record<string, unknown> }) => reviewService.update(id, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['reviews'] });
                              toast.success(locale === 'ar' ? 'تم تحديث التقييم' : 'Review updated');
                              if (onSuccessCallback) onSuccessCallback();
                    },
          });

          const deleteReview = useMutation({
                    mutationFn: (id: string) => reviewService.delete(id),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['reviews'] });
                              toast.success(locale === 'ar' ? 'تم حذف التقييم' : 'Review deleted');
                              if (onSuccessCallback) onSuccessCallback();
                    },
          });

          return { createReview, updateReview, deleteReview };
};
