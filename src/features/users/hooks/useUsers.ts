import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../api/services/admin.service';
import toast from 'react-hot-toast';

export const useUsers = (page: number, limit: number, roleFilter: string) => {
    return useQuery({
        queryKey: ['users', { page, role: roleFilter }],
        queryFn: () => userService.getAll({ page, limit, role: roleFilter || undefined }),
    });
};

export const useUserMutations = () => {
    const qc = useQueryClient();

    const activate = useMutation({
        mutationFn: userService.activate,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
            toast.success('User activated');
        }
    });

    const deactivate = useMutation({
        mutationFn: userService.deactivate,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deactivated');
        }
    });

    const remove = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted');
        }
    });

    return { activate, deactivate, remove };
};
