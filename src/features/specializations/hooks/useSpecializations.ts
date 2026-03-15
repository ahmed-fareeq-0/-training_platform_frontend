import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import specializationService from '../../../api/services/specialization.service';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store/uiStore';
import type { Specialization } from '../../../types';

export const useSpecializations = () => {
          return useQuery({
                    queryKey: ['specializations'],
                    queryFn: specializationService.getAll
          });
};

export const useSpecializationMutations = (onSuccessCallback?: () => void) => {
          const qc = useQueryClient();
          const { locale } = useUIStore();

          const create = useMutation({
                    mutationFn: (data: Partial<Specialization>) => specializationService.create(data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['specializations'] });
                              toast.success(locale === 'ar' ? 'تم الإنشاء' : 'Created');
                              if (onSuccessCallback) onSuccessCallback();
                    },
          });

          const update = useMutation({
                    mutationFn: ({ id, data }: { id: string; data: Partial<Specialization> }) => specializationService.update(id, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['specializations'] });
                              toast.success(locale === 'ar' ? 'تم التحديث' : 'Updated');
                              if (onSuccessCallback) onSuccessCallback();
                    },
          });

          const toggle = useMutation({
                    mutationFn: ({ id, active }: { id: string; active: boolean }) => active ? specializationService.deactivate(id) : specializationService.activate(id),
                    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
          });

          const remove = useMutation({
                    mutationFn: specializationService.delete,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['specializations'] });
                              toast.success(locale === 'ar' ? 'تم الحذف' : 'Deleted');
                    },
          });

          return { create, update, toggle, remove };
};
