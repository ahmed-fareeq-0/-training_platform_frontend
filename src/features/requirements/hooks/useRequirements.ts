import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import requirementService from '../../../api/services/requirement.service';
import type { TrainingRequirement } from '../../../types';

// ==========================================
// TRAINING REQUIREMENTS HOOKS
// ==========================================

/** Fetch requirements for a specific course or workshop */
export function useTrainingRequirements(type: 'course' | 'workshop', trainingId: string) {
          return useQuery({
                    queryKey: ['training_requirements', type, trainingId],
                    queryFn: () => requirementService.getByTraining(type, trainingId),
                    enabled: !!trainingId,
          });
}

/** Add a requirement */
export function useCreateRequirement(type: 'course' | 'workshop', trainingId: string) {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (data: Partial<TrainingRequirement>) =>
                              requirementService.create(type, trainingId, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['training_requirements', type, trainingId] });
                    },
          });
}

/** Update a requirement */
export function useUpdateRequirement(type: 'course' | 'workshop', trainingId: string) {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ reqId, data }: { reqId: string; data: Partial<TrainingRequirement> }) =>
                              requirementService.update(reqId, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['training_requirements', type, trainingId] });
                    },
          });
}

/** Delete a requirement */
export function useDeleteRequirement(type: 'course' | 'workshop', trainingId: string) {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (reqId: string) => requirementService.delete(reqId),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['training_requirements', type, trainingId] });
                    },
          });
}

// ==========================================
// ENROLLMENT REQUIREMENT HOOKS
// ==========================================

/** Fetch submissions for a specific enrollment/booking */
export function useEnrollmentSubmissions(type: 'course' | 'workshop', enrollmentId: string) {
          return useQuery({
                    queryKey: ['enrollment_requirements', type, enrollmentId],
                    queryFn: () => requirementService.getEnrollmentSubmissions(type, enrollmentId),
                    enabled: !!enrollmentId,
          });
}

/** Submit requirement data */
export function useSubmitRequirement() {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ type, enrollmentId, data }: {
                              type: 'course' | 'workshop';
                              enrollmentId: string;
                              data: {
                                        training_type: string;
                                        training_id: string;
                                        submissions: Array<{ requirement_id: string; document_url?: string; notes?: string }>
                              }
                    }) =>
                              requirementService.submitRequirement(type, enrollmentId, data),
                    onSuccess: (_, variables) => {
                              qc.invalidateQueries({ queryKey: ['enrollment_requirements', variables.type, variables.enrollmentId] });
                    },
          });
}

/** Review a submission (approve/reject) */
export function useReviewSubmission() {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ submissionId, data }: { submissionId: string; data: { is_satisfied: boolean; notes?: string } }) =>
                              requirementService.reviewSubmission(submissionId, data),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['enrollment_requirements'] });
                              qc.invalidateQueries({ queryKey: ['pending_enrollment_requests'] });
                    },
          });
}

/** Get all pending enrollment requests (admin/manager) */
export function usePendingEnrollmentRequests(params?: { page?: number; limit?: number; type?: string }) {
          return useQuery({
                    queryKey: ['pending_enrollment_requests', params],
                    queryFn: () => requirementService.getPending(params),
          });
}

/** Check if trainee meets requirements */
export function useCheckRequirements(type: 'course' | 'workshop', trainingId: string) {
          return useQuery({
                    queryKey: ['check_requirements', type, trainingId],
                    queryFn: () => requirementService.checkRequirements(type, trainingId),
                    enabled: !!trainingId,
          });
}
