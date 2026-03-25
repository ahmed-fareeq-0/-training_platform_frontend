import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import workshopService, { type WorkshopFilters } from '../../../api/services/workshop.service';
import toast from 'react-hot-toast';

export const workshopKeys = {
          all: ['workshops'] as const,
          lists: () => [...workshopKeys.all, 'list'] as const,
          list: (filters: WorkshopFilters) => [...workshopKeys.lists(), filters] as const,
          upcoming: (filters: WorkshopFilters) => [...workshopKeys.all, 'upcoming', filters] as const,
          pending: (filters: WorkshopFilters) => [...workshopKeys.all, 'pending', filters] as const,
          bookmarked: (filters: WorkshopFilters) => [...workshopKeys.all, 'bookmarked', filters] as const,
          details: () => [...workshopKeys.all, 'detail'] as const,
          detail: (id: string) => [...workshopKeys.details(), id] as const,
          isFull: (id: string) => [...workshopKeys.all, 'isFull', id] as const,
};

export const useUpcomingWorkshops = (filters: WorkshopFilters = { page: 1, limit: 12 }) =>
          useQuery({
                    queryKey: workshopKeys.upcoming(filters),
                    queryFn: () => workshopService.getUpcoming(filters),
          });

export const useAllWorkshops = (filters: WorkshopFilters = { page: 1, limit: 10 }) =>
          useQuery({
                    queryKey: workshopKeys.list(filters),
                    queryFn: () => workshopService.getAll(filters),
          });

export const useMyWorkshops = (filters: WorkshopFilters = { page: 1, limit: 10 }, options?: { enabled?: boolean }) =>
          useQuery({
                    queryKey: [...workshopKeys.all, 'my', filters],
                    queryFn: () => workshopService.getMyWorkshops(filters),
                    ...options,
          });

export const useBookmarkedWorkshops = (filters: WorkshopFilters = { page: 1, limit: 12 }) =>
          useQuery({
                    queryKey: workshopKeys.bookmarked(filters),
                    queryFn: () => workshopService.getBookmarked(filters),
          });

export const useWorkshopDetail = (id: string) =>
          useQuery({
                    queryKey: workshopKeys.detail(id),
                    queryFn: () => workshopService.getById(id),
                    enabled: !!id,
          });

export const useWorkshopAvailability = (id: string) =>
          useQuery({
                    queryKey: workshopKeys.isFull(id),
                    queryFn: () => workshopService.isFull(id),
                    enabled: !!id,
          });

export const useReviewWorkshop = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ id, data }: { id: string; data: { is_approved: boolean; rejection_reason?: string } }) =>
                              workshopService.review(id, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              toast.success('Workshop reviewed successfully');
                    },
          });
};

export const useUpdateWorkshopStatus = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ id, status }: { id: string; status: string }) =>
                              workshopService.updateStatus(id, status),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              toast.success('Workshop status updated');
                    },
          });
};

export const useCreateWorkshop = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (data: Record<string, unknown>) => workshopService.create(data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              qc.invalidateQueries({ queryKey: ['workshops', 'upcoming'] });
                              toast.success('Workshop created successfully');
                    },
                    onError: (error: any) => {
                              const data = error.response?.data;
                              if (data?.errors && Array.isArray(data.errors)) {
                                        toast.error(data.errors.map((e: any) => e.message).join('\n'));
                              } else {
                                        toast.error(data?.message || 'Failed to create workshop');
                              }
                    }
          });
};

export const useUpdateWorkshop = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => workshopService.update(id, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              qc.invalidateQueries({ queryKey: workshopKeys.detail(variables.id) });
                              toast.success('Workshop updated successfully');
                    },
                    onError: (error: any) => {
                              const data = error.response?.data;
                              if (data?.errors && Array.isArray(data.errors)) {
                                        toast.error(data.errors.map((e: any) => e.message).join('\n'));
                              } else {
                                        toast.error(data?.message || 'Failed to update workshop');
                              }
                    }
          });
};

export const useDeleteWorkshop = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (id: string) => workshopService.delete(id),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              toast.success('Workshop deleted successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to delete workshop');
                    }
          });
};

export const useToggleBookmark = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (id: string) => workshopService.toggleBookmark(id),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                    }
          });
};

// --- Syllabus (Sections & Lessons) Hooks ---

export const useWorkshopSyllabus = (workshopId: string) =>
          useQuery({
                    queryKey: [...workshopKeys.all, 'syllabus', workshopId],
                    queryFn: () => workshopService.getSyllabus(workshopId),
                    enabled: !!workshopId,
          });

export const useAddWorkshopSection = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, data }: { workshopId: string; data: Record<string, unknown> }) =>
                              workshopService.addSection(workshopId, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Section added successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to add section');
                    }
          });
};

export const useUpdateWorkshopSection = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, sectionId, data }: { workshopId: string; sectionId: string; data: Record<string, unknown> }) =>
                              workshopService.updateSection(sectionId, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Section updated successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to update section');
                    }
          });
};

export const useDeleteWorkshopSection = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, sectionId }: { workshopId: string; sectionId: string }) =>
                              workshopService.deleteSection(sectionId),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Section deleted successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to delete section');
                    }
          });
};

export const useReorderWorkshopSections = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, sections }: { workshopId: string; sections: { id: string; order: number }[] }) =>
                              workshopService.reorderSections(workshopId, sections),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to reorder sections');
                    }
          });
};

export const useAddWorkshopLesson = () => {
          const qc = useQueryClient();
          return useMutation({
                    // data includes sectionId inside it for the request, or we pass sectionId separately
                    mutationFn: ({ workshopId, sectionId, data }: { workshopId: string; sectionId: string; data: Record<string, unknown> }) =>
                              workshopService.addLesson(sectionId, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Topic added successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to add topic');
                    }
          });
};

export const useUpdateWorkshopLesson = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, lessonId, data }: { workshopId: string; lessonId: string; data: Record<string, unknown> }) =>
                              workshopService.updateLesson(lessonId, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Topic updated successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to update topic');
                    }
          });
};

export const useDeleteWorkshopLesson = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, lessonId }: { workshopId: string; lessonId: string }) =>
                              workshopService.deleteLesson(lessonId),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                              toast.success('Topic deleted successfully');
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to delete topic');
                    }
          });
};

export const useReorderWorkshopLessons = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ workshopId, sectionId, lessons }: { workshopId: string; sectionId: string; lessons: { id: string; order: number }[] }) =>
                              workshopService.reorderLessons(sectionId, lessons),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: [...workshopKeys.all, 'syllabus', variables.workshopId] });
                    },
                    onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to reorder topics');
                    }
          });
};
