import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import courseService from '../../../api/services/course.service';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { UserRole } from '../../../types';

// ==========================================
// COURSE REACT QUERY HOOKS
// ==========================================

export const courseKeys = {
  all: ['courses'] as const,
  published: (params?: Record<string, unknown>) => ['courses', 'published', params] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
  content: (id: string) => ['courses', 'content', id] as const,
  myCourses: ['courses', 'my-courses'] as const,
  myEnrollments: ['courses', 'my-enrollments'] as const,
  pendingEnrollments: (params?: Record<string, unknown>) => ['courses', 'pending-enrollments', params] as const,
  pendingCourses: (params?: Record<string, unknown>) => ['courses', 'pending-courses', params] as const,
};

// --- Queries ---

export const usePublishedCourses = (params?: { page?: number; limit?: number; specialization_id?: string }) => {
  return useQuery({
    queryKey: courseKeys.published(params),
    queryFn: () => courseService.getPublished(params),
  });
};

export const useCourseById = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id,
  });
};

export const useCourseContent = (id: string) => {
  return useQuery({
    queryKey: courseKeys.content(id),
    queryFn: () => courseService.getContent(id),
    enabled: !!id,
  });
};

export const useMyCourses = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: courseKeys.myCourses,
    queryFn: () => courseService.getMyCourses(),
    ...options,
  });
};

export const useMyEnrollments = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: courseKeys.myEnrollments,
    queryFn: () => courseService.getMyEnrollments(),
    ...options,
  });
};

export const usePendingEnrollments = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: courseKeys.pendingEnrollments(params),
    queryFn: () => courseService.getPendingEnrollments(params),
  });
};

export const useAllCourses = (params?: { page?: number; limit?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['courses', 'all', params],
    queryFn: () => courseService.getAll(params),
    ...options,
  });
};

// --- Mutations ---

export const useCreateCourse = () => {
  const qc = useQueryClient();
  const userRole = useAuthStore((s) => s.user?.role);
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => courseService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all });
      if (userRole === UserRole.TRAINER) {
        toast.success('سيتم نشر دورتك بعد موافقة المدير\nYour course will be published after Manager approval', { duration: 5000 });
      } else {
        toast.success('Course created successfully');
      }
    },
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      courseService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.all });
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useAddSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Record<string, unknown> }) =>
      courseService.addSection(courseId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sectionId }: { courseId: string; sectionId: string }) =>
      courseService.deleteSection(courseId, sectionId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sectionId, data }: { courseId: string; sectionId: string; data: Record<string, unknown> }) =>
      courseService.updateSection(courseId, sectionId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useAddLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sectionId, data }: { courseId: string; sectionId: string; data: Record<string, unknown> }) =>
      courseService.addLesson(courseId, sectionId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId, data }: { courseId: string; lessonId: string; data: Record<string, unknown> }) =>
      courseService.updateLesson(courseId, lessonId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      courseService.deleteLesson(courseId, lessonId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useEnrollInCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: { payment_method: string; payment_proof?: string } }) =>
      courseService.enroll(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.myEnrollments });
    },
  });
};

export const useConfirmEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: 'active' | 'cancelled' }) =>
      courseService.confirmEnrollment(enrollmentId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useUploadCourseMedia = () => {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      courseService.uploadMedia(file, folder),
  });
};

// --- Progress Tracking ---

export const useCourseProgress = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', 'progress', courseId],
    queryFn: () => courseService.getProgress(courseId),
    enabled: !!courseId,
  });
};

export const useMarkLessonComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      courseService.markLessonComplete(courseId, lessonId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['courses', 'progress', variables.courseId] });
      qc.invalidateQueries({ queryKey: courseKeys.myEnrollments });
    },
  });
};

export const useUpdateLessonPosition = () => {
  return useMutation({
    mutationFn: ({ courseId, lessonId, positionSeconds }: { courseId: string; lessonId: string; positionSeconds: number }) =>
      courseService.updateLessonPosition(courseId, lessonId, positionSeconds),
  });
};

// --- Course Reviews ---

export const useSubmitCourseReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: { rating: number; comment?: string } }) =>
      courseService.submitReview(courseId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      qc.invalidateQueries({ queryKey: ['courses', 'my-review', variables.courseId] });
    },
  });
};

export const useMyCourseReview = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', 'my-review', courseId],
    queryFn: () => courseService.getMyReview(courseId),
    enabled: !!courseId,
    retry: false, // 404 is expected if no review exists
  });
};

// --- Approval Workflow ---

export const usePendingCourses = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: courseKeys.pendingCourses(params),
    queryFn: () => courseService.getPendingCourses(params),
  });
};

export const useReviewCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { is_approved: boolean; rejection_reason?: string } }) =>
      courseService.reviewCourse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};
