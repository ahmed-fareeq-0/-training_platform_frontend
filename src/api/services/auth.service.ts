import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, LoginResponse, User } from '../../types';

export interface LoginPayload {
          email: string;
          password: string;
}

export interface RegisterPayload {
          email: string;
          password: string;
          full_name: string;
          phone?: string;
          role: string;
}

export interface RegisterTrainerPayload extends Omit<RegisterPayload, 'role'> {
          trainer_type: 'professional' | 'university_prof';
          category_id: string;
          experience_years: number;
          bio_ar?: string;
          bio_en?: string;
          
          job_title?: string;
          core_skills?: string;
          
          academic_degree?: string;
          academic_specialization?: string;
          academic_title?: string;
}

export interface ChangePasswordPayload {
          oldPassword: string;
          newPassword: string;
}

const authService = {
          login: async (data: LoginPayload) => {
                    const res = await api.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.LOGIN, data);
                    return res.data.data;
          },

          register: async (data: RegisterPayload) => {
                    const res = await api.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.REGISTER, data);
                    return res.data.data;
          },

          registerTrainer: async (data: RegisterTrainerPayload) => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.REGISTER_TRAINER, data);
                    return res.data; // we want the message from the api response wrapper
          },

          getMe: async () => {
                    const res = await api.get<ApiResponse<User>>(ENDPOINTS.AUTH.ME);
                    return res.data.data;
          },

          updateProfile: async (data: Partial<Pick<User, 'full_name' | 'phone' | 'profile_image'>>) => {
                    const res = await api.patch<ApiResponse<User>>(ENDPOINTS.AUTH.ME, data);
                    return res.data.data;
          },

          changePassword: async (data: ChangePasswordPayload) => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
                    return res.data;
          },

          logout: async (refreshToken: string) => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
                    return res.data;
          },

          logoutAll: async () => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT_ALL);
                    return res.data;
          },
};

export default authService;
