import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, Specialization } from '../../types';

const specializationService = {
          getAll: async () => {
                    const res = await api.get<PaginatedResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.BASE);
                    return res.data;
          },

          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.BY_ID(id));
                    return res.data.data;
          },

          create: async (data: Partial<Specialization>) => {
                    const res = await api.post<ApiResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.BASE, data);
                    return res.data.data;
          },

          update: async (id: string, data: Partial<Specialization>) => {
                    const res = await api.patch<ApiResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.BY_ID(id), data);
                    return res.data.data;
          },

          activate: async (id: string) => {
                    const res = await api.post<ApiResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.ACTIVATE(id));
                    return res.data.data;
          },

          deactivate: async (id: string) => {
                    const res = await api.post<ApiResponse<Specialization>>(ENDPOINTS.SPECIALIZATIONS.DEACTIVATE(id));
                    return res.data.data;
          },

          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.SPECIALIZATIONS.BY_ID(id));
                    return res.data;
          },

          getStatistics: async (id: string) => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.SPECIALIZATIONS.STATISTICS(id));
                    return res.data.data;
          },
};

export default specializationService;
