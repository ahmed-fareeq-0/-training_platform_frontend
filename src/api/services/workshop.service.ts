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

          // --- Syllabus (Sections & Lessons) ---
          getSyllabus: async (workshopId: string) => {
                    const res = await api.get<ApiResponse<any[]>>(ENDPOINTS.WORKSHOPS.SYLLABUS(workshopId));
                    return res.data.data;
          },

          addSection: async (workshopId: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.SECTIONS(workshopId), data);
                    return res.data.data;
          },

          updateSection: async (sectionId: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.SECTION(sectionId), data);
                    return res.data.data;
          },

          deleteSection: async (sectionId: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.SECTION(sectionId));
                    return res.data;
          },

          reorderSections: async (workshopId: string, sections: { id: string; order: number }[]) => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.REORDER_SECTIONS(workshopId), { sections });
                    return res.data;
          },

          addLesson: async (sectionId: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.LESSONS(sectionId), data);
                    return res.data.data;
          },

          updateLesson: async (lessonId: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<any>>(ENDPOINTS.WORKSHOPS.LESSON(lessonId), data);
                    return res.data.data;
          },

          deleteLesson: async (lessonId: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.LESSON(lessonId));
                    return res.data;
          },

          reorderLessons: async (sectionId: string, lessons: { id: string; order: number }[]) => {
                    const res = await api.post<ApiResponse<null>>(ENDPOINTS.WORKSHOPS.REORDER_LESSONS(sectionId), { lessons });
                    return res.data;
          },
};

export default workshopService;
