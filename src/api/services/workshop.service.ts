import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, Workshop } from '../../types';

export interface WorkshopFilters {
          page?: number;
          limit?: number;
          specialization_id?: string;
          status?: string;
          trainer_id?: string;
}

const workshopService = {
          getUpcoming: async (params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.UPCOMING, { params });
                    return res.data;
          },

          getAll: async (params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BASE, { params });
                    return res.data;
          },

          getPending: async (params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.PENDING, { params });
                    return res.data;
          },

          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BY_ID(id));
                    return res.data.data;
          },

          getByTrainer: async (trainerId: string, params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BY_TRAINER(trainerId), { params });
                    return res.data;
          },

          getMyWorkshops: async (params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.MY_WORKSHOPS, { params });
                    return res.data;
          },

          getBookmarked: async (params?: WorkshopFilters) => {
                    const res = await api.get<PaginatedResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BOOKMARKED, { params });
                    return res.data;
          },

          create: async (data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BASE, data);
                    return res.data.data;
          },

          update: async (id: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<Workshop>>(ENDPOINTS.WORKSHOPS.BY_ID(id), data);
                    return res.data.data;
          },

          review: async (id: string, data: { is_approved: boolean; rejection_reason?: string }) => {
                    const res = await api.post<ApiResponse<Workshop>>(ENDPOINTS.WORKSHOPS.REVIEW(id), data);
                    return res.data.data;
          },

          updateStatus: async (id: string, status: string) => {
                    const res = await api.patch<ApiResponse<Workshop>>(ENDPOINTS.WORKSHOPS.STATUS(id), { status });
                    return res.data.data;
          },

          isFull: async (id: string) => {
                    const res = await api.get<ApiResponse<{ is_full: boolean; available_seats: number }>>(ENDPOINTS.WORKSHOPS.IS_FULL(id));
                    return res.data.data;
          },

          getStatistics: async (id: string) => {
                    const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.WORKSHOPS.STATISTICS(id));
                    return res.data.data;
          },

          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.BY_ID(id));
                    return res.data;
          },

          toggleBookmark: async (id: string) => {
                    const res = await api.post<ApiResponse<{ is_bookmarked: boolean }>>(ENDPOINTS.WORKSHOPS.BY_ID(id) + '/bookmark');
                    return res.data.data;
          },

          // --- Syllabus Content ---
          getContent: async (workshopId: string) => {
                    const res = await api.get<ApiResponse<any[]>>(ENDPOINTS.WORKSHOPS.CONTENT(workshopId));
                    return res.data.data;
          },

          addContent: async (workshopId: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.CONTENT(workshopId), data);
                    return res.data.data;
          },

          updateContent: async (workshopId: string, contentId: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.CONTENT_ITEM(workshopId, contentId), data);
                    return res.data.data;
          },

          deleteContent: async (workshopId: string, contentId: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.CONTENT_ITEM(workshopId, contentId));
                    return res.data;
          },
};

export default workshopService;
