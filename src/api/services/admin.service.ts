import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, User, Trainer } from '../../types';

export interface UserFilters { page?: number; limit?: number; role?: string; q?: string; }

const userService = {
          getAll: async (params?: UserFilters) => {
                    const res = await api.get<PaginatedResponse<User>>(ENDPOINTS.USERS.BASE, { params });
                    return res.data;
          },
          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id));
                    return res.data.data;
          },
          search: async (params?: UserFilters) => {
                    const res = await api.get<PaginatedResponse<User>>(ENDPOINTS.USERS.SEARCH, { params });
                    return res.data;
          },
          update: async (id: string, data: Partial<User>) => {
                    const res = await api.patch<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id), data);
                    return res.data.data;
          },
          activate: async (id: string) => {
                    const res = await api.post<ApiResponse<User>>(ENDPOINTS.USERS.ACTIVATE(id));
                    return res.data.data;
          },
          deactivate: async (id: string) => {
                    const res = await api.post<ApiResponse<User>>(ENDPOINTS.USERS.DEACTIVATE(id));
                    return res.data.data;
          },
          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.USERS.BY_ID(id));
                    return res.data;
          },
          getStatistics: async () => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.USERS.STATISTICS);
                    return res.data.data;
          },
};

const trainerService = {
          getAll: async (params?: { page?: number; limit?: number }) => {
                    const res = await api.get<PaginatedResponse<Trainer>>(ENDPOINTS.TRAINERS.BASE, { params });
                    return res.data;
          },
          getApproved: async (params?: { page?: number }) => {
                    const res = await api.get<PaginatedResponse<Trainer>>(ENDPOINTS.TRAINERS.APPROVED, { params });
                    return res.data;
          },
          getPending: async () => {
                    const res = await api.get<PaginatedResponse<Trainer>>(ENDPOINTS.TRAINERS.PENDING);
                    return res.data;
          },
          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.BY_ID(id));
                    return res.data.data;
          },
          getMe: async () => {
                    const res = await api.get<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.ME);
                    return res.data.data;
          },
          create: async (data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.BASE, data);
                    return res.data.data;
          },
          update: async (id: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.BY_ID(id), data);
                    return res.data.data;
          },
          approve: async (id: string) => {
                    const res = await api.post<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.APPROVE(id));
                    return res.data.data;
          },
          reject: async (id: string) => {
                    const res = await api.post<ApiResponse<Trainer>>(ENDPOINTS.TRAINERS.REJECT(id));
                    return res.data.data;
          },
          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.TRAINERS.BY_ID(id));
                    return res.data;
          },
};

const managerService = {
          getAll: async (params?: { page?: number; limit?: number }) => {
                    const res = await api.get<PaginatedResponse<User>>(ENDPOINTS.MANAGERS.BASE, { params });
                    return res.data;
          },
          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<User>>(ENDPOINTS.MANAGERS.BY_ID(id));
                    return res.data.data;
          },
          create: async (data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<User>>(ENDPOINTS.MANAGERS.BASE, data);
                    return res.data.data;
          },
          getPermissions: async (id: string) => {
                    const res = await api.get<ApiResponse<unknown[]>>(ENDPOINTS.MANAGERS.PERMISSIONS(id));
                    return res.data.data;
          },
          addPermission: async (id: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<unknown>>(ENDPOINTS.MANAGERS.PERMISSIONS(id), data);
                    return res.data.data;
          },
          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.MANAGERS.BY_ID(id));
                    return res.data;
          },
};



const reviewService = {
          getByWorkshop: async (wid: string, params?: { page?: number }) => {
                    const res = await api.get<PaginatedResponse<Record<string, unknown>>>(ENDPOINTS.REVIEWS.BY_WORKSHOP(wid), { params });
                    return res.data;
          },
          create: async (data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<Record<string, unknown>>>(ENDPOINTS.REVIEWS.BASE, data);
                    return res.data.data;
          },
          update: async (id: string, data: Record<string, unknown>) => {
                    const res = await api.put<ApiResponse<Record<string, unknown>>>(ENDPOINTS.REVIEWS.BY_ID(id), data);
                    return res.data.data;
          },
          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.REVIEWS.BY_ID(id));
                    return res.data;
          },
};

const statisticsService = {
          getDashboard: async () => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.STATISTICS.DASHBOARD);
                    return res.data.data;
          },
          getWorkshopStats: async () => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.STATISTICS.WORKSHOPS);
                    return res.data.data;
          },
          getTrainerStats: async () => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.STATISTICS.TRAINERS);
                    return res.data.data;
          },
};

export { userService, trainerService, managerService, reviewService, statisticsService };
