import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerService } from '../../../api/services/manager.service';
import { ManagerCreateInput, ManagerPermissionUpdateInput } from '../../../types';
import toast from 'react-hot-toast';

export const useManagers = (params?: { page?: number; limit?: number; search?: string }) => {
          return useQuery({
                    queryKey: ['managers', params],
                    queryFn: () => managerService.getManagers(params),
                    staleTime: 5 * 60 * 1000, // 5 minutes
          });
};

export const useManagerDetail = (id: string) => {
          return useQuery({
                    queryKey: ['manager', id],
                    queryFn: () => managerService.getManagerById(id),
                    enabled: !!id,
          });
};

export const useCreateManager = () => {
          const queryClient = useQueryClient();

          return useMutation({
                    mutationFn: (data: ManagerCreateInput) => managerService.createManager(data),
                    onSuccess: () => {
                              toast.success('تم إضافة المدير بنجاح / Manager created successfully');
                              queryClient.invalidateQueries({ queryKey: ['managers'] });
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'فشل في إضافة المدير / Failed to create manager');
                    },
          });
};

export const useDeleteManager = () => {
          const queryClient = useQueryClient();

          return useMutation({
                    mutationFn: (id: string) => managerService.deleteManager(id),
                    onSuccess: () => {
                              toast.success('تم حذف المدير بنجاح / Manager deleted successfully');
                              queryClient.invalidateQueries({ queryKey: ['managers'] });
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'فشل في حذف المدير / Failed to delete manager');
                    },
          });
};

export const useManagerPermissions = (managerId: string) => {
          return useQuery({
                    queryKey: ['manager_permissions', managerId],
                    queryFn: () => managerService.getManagerPermissions(managerId),
                    enabled: !!managerId,
          });
};

export const useUpdateManagerPermission = () => {
          const queryClient = useQueryClient();

          return useMutation({
                    mutationFn: ({ managerId, data }: { managerId: string; data: ManagerPermissionUpdateInput }) =>
                              managerService.updateManagerPermission(managerId, data),
                    onSuccess: (_, variables) => {
                              toast.success('تم تحديث الصلاحيات بنجاح / Permissions updated successfully');
                              queryClient.invalidateQueries({ queryKey: ['manager_permissions', variables.managerId] });
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'فشل في تحديث الصلاحيات / Failed to update permissions');
                    },
          });
};


