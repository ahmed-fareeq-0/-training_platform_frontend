import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, Course, CourseEnrollment } from '../../types';

// ==========================================
// COURSE API SERVICE
// ==========================================

const courseService = {
          // --- Browse ---
          getPublished: async (params?: { page?: number; limit?: number; specialization_id?: string }) => {
                    const res = await api.get<PaginatedResponse<Course>>(ENDPOINTS.COURSES.BASE, { params });
                    return res.data;
          },

          getAll: async (params?: { page?: number; limit?: number }) => {
                    const res = await api.get<PaginatedResponse<Course>>(ENDPOINTS.COURSES.ALL, { params });
                    return res.data;
          },

          getById: async (id: string) => {
                    const res = await api.get<ApiResponse<Course>>(ENDPOINTS.COURSES.BY_ID(id));
                    return res.data.data;
          },

          getMyCourses: async () => {
                    const res = await api.get<ApiResponse<Course[]>>(ENDPOINTS.COURSES.MY_COURSES);
                    return res.data.data;
          },

          // --- CRUD ---
          create: async (data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<Course>>(ENDPOINTS.COURSES.BASE, data);
                    return res.data.data;
          },

          update: async (id: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<Course>>(ENDPOINTS.COURSES.BY_ID(id), data);
                    return res.data.data;
          },

          delete: async (id: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.COURSES.BY_ID(id));
                    return res.data;
          },

          // --- Sections ---
          addSection: async (courseId: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<unknown>>(ENDPOINTS.COURSES.SECTIONS(courseId), data);
                    return res.data.data;
          },

          updateSection: async (courseId: string, sectionId: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<unknown>>(ENDPOINTS.COURSES.SECTION(courseId, sectionId), data);
                    return res.data.data;
          },

          deleteSection: async (courseId: string, sectionId: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.COURSES.SECTION(courseId, sectionId));
                    return res.data;
          },

          // --- Lessons ---
          addLesson: async (courseId: string, sectionId: string, data: Record<string, unknown>) => {
                    const res = await api.post<ApiResponse<unknown>>(ENDPOINTS.COURSES.LESSONS(courseId, sectionId), data);
                    return res.data.data;
          },

          updateLesson: async (courseId: string, lessonId: string, data: Record<string, unknown>) => {
                    const res = await api.patch<ApiResponse<unknown>>(ENDPOINTS.COURSES.LESSON(courseId, lessonId), data);
                    return res.data.data;
          },

          deleteLesson: async (courseId: string, lessonId: string) => {
                    const res = await api.delete<ApiResponse<null>>(ENDPOINTS.COURSES.LESSON(courseId, lessonId));
                    return res.data;
          },

          // --- Enrollments ---
          enroll: async (courseId: string, data: { payment_method: string; payment_proof?: string }) => {
                    const res = await api.post<ApiResponse<CourseEnrollment>>(ENDPOINTS.COURSES.ENROLL(courseId), data);
                    return res.data.data;
          },

          getMyEnrollments: async () => {
                    const res = await api.get<ApiResponse<CourseEnrollment[]>>(ENDPOINTS.COURSES.MY_ENROLLMENTS);
                    return res.data.data;
          },

          getPendingEnrollments: async (params?: { page?: number; limit?: number }) => {
                    const res = await api.get<PaginatedResponse<CourseEnrollment>>(ENDPOINTS.COURSES.PENDING_ENROLLMENTS, { params });
                    return res.data;
          },

          confirmEnrollment: async (enrollmentId: string, status: 'active' | 'cancelled') => {
                    const res = await api.patch<ApiResponse<CourseEnrollment>>(ENDPOINTS.COURSES.CONFIRM_ENROLLMENT(enrollmentId), { status });
                    return res.data.data;
          },

          // --- Content (enrolled only) ---
          getContent: async (id: string) => {
                    const res = await api.get<ApiResponse<Course>>(ENDPOINTS.COURSES.CONTENT(id));
                    return res.data.data;
          },

          // --- Media Upload to R2 ---
          uploadMedia: async (file: File, folder = 'media') => {
                    const formData = new FormData();
                    formData.append('media', file);
                    const res = await api.post<ApiResponse<{ url: string }>>(
                              `${ENDPOINTS.COURSES.UPLOAD_MEDIA}?folder=${folder}`,
                              formData,
                              { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                    return res.data.data;
          },
};

export default courseService;
