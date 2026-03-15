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
