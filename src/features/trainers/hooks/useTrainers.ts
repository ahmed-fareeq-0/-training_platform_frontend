import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerService } from '../../../api/services/admin.service';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store/uiStore';

export const useTrainers = () => {
          const allQuery = useQuery({
                    queryKey: ['trainers', 'all'],
                    queryFn: () => trainerService.getAll()
          });

          const pendingQuery = useQuery({
                    queryKey: ['trainers', 'pending'],
                    queryFn: trainerService.getPending
          });

          return { allQuery, pendingQuery };
};

export const useTrainerMutations = () => {
          const qc = useQueryClient();
          const { locale } = useUIStore();

          const approve = useMutation({
                    mutationFn: trainerService.approve,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['trainers'] });
                              toast.success(locale === 'ar' ? 'تمت الموافقة' : 'Approved');
                    },
          });

          const reject = useMutation({
                    mutationFn: trainerService.reject,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['trainers'] });
                              toast.success(locale === 'ar' ? 'تم الرفض' : 'Rejected');
                    },
          });

          const remove = useMutation({
                    mutationFn: trainerService.delete,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['trainers'] });
                              toast.success(locale === 'ar' ? 'تم الحذف' : 'Deleted');
                    },
          });

          return { approve, reject, remove };
};
