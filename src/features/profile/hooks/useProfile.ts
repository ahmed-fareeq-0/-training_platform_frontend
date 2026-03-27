import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService, { type ChangePasswordPayload } from '../../../api/services/auth.service';
import { trainerService } from '../../../api/services/admin.service';
import { type User, UserRole } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store/uiStore';

export const useProfile = () => {
    return useQuery({
        queryKey: ['profile', 'me'],
        queryFn: authService.getMe,
    });
};

export const useTrainerProfile = (role?: string) => {
    return useQuery({
        queryKey: ['profile', 'trainer', 'me'],
        queryFn: trainerService.getMe,
        enabled: role === UserRole.TRAINER,
    });
};

export const useProfileMutations = () => {
    const qc = useQueryClient();
    const { setUser } = useAuthStore();
    const { locale } = useUIStore();

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Pick<User, 'full_name' | 'phone' | 'profile_image'>>) => authService.updateProfile(data),
        onSuccess: (updatedUser) => {
            qc.invalidateQueries({ queryKey: ['profile', 'me'] });
            // Ensure global auth store has the latest name/image
            setUser(updatedUser);
            toast.success(locale === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
        },
    });

    const updateTrainerProfile = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Record<string, any> }) => {
            return trainerService.update(id, data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['profile', 'me'] });
            qc.invalidateQueries({ queryKey: ['profile', 'trainer', 'me'] });
            toast.success(locale === 'ar' ? 'تم تحديث بيانات المدرب بنجاح' : 'Trainer profile updated successfully');
        },
    });

    const changePassword = useMutation({
        mutationFn: (data: ChangePasswordPayload) => authService.changePassword(data),
        onSuccess: () => {
            toast.success(locale === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        },
    });

    return { updateProfile, updateTrainerProfile, changePassword };
};
