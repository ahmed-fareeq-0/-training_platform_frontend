import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, TrainingRequirement, EnrollmentRequirement } from '../../types';

// ==========================================
// REQUIREMENT SERVICE
// ==========================================

const requirementService = {
    // --- Training Requirements (what a course/workshop requires) ---

    /** Get all requirements for a course or workshop */
    getByTraining: async (type: 'course' | 'workshop', trainingId: string) => {
        const res = await api.get<ApiResponse<TrainingRequirement[]>>(
            ENDPOINTS.REQUIREMENTS.TRAINING(type, trainingId)
        );
        return res.data.data;
    },

    /** Add a requirement to a course or workshop */
    create: async (type: 'course' | 'workshop', trainingId: string, data: Partial<TrainingRequirement>) => {
        const res = await api.post<ApiResponse<TrainingRequirement>>(
            ENDPOINTS.REQUIREMENTS.TRAINING(type, trainingId),
            data
        );
        return res.data.data;
    },

    /** Update a requirement */
    update: async (reqId: string, data: Partial<TrainingRequirement>) => {
        const res = await api.patch<ApiResponse<TrainingRequirement>>(
            ENDPOINTS.REQUIREMENTS.BY_ID(reqId),
            data
        );
        return res.data.data;
    },

    /** Delete a requirement */
    delete: async (reqId: string) => {
        const res = await api.delete<ApiResponse<null>>(ENDPOINTS.REQUIREMENTS.BY_ID(reqId));
        return res.data;
    },

    // --- Enrollment Requirements (trainee submissions) ---

    /** Get trainee submissions for a specific enrollment/booking */
    getEnrollmentSubmissions: async (type: 'course' | 'workshop', enrollmentId: string) => {
        const res = await api.get<ApiResponse<EnrollmentRequirement[]>>(
            ENDPOINTS.REQUIREMENTS.ENROLLMENT(type, enrollmentId)
        );
        return res.data.data;
    },

    /** Submit requirement documents for an enrollment/booking */
    submitRequirement: async (type: 'course' | 'workshop', enrollmentId: string, data: {
        training_type: string;
        training_id: string;
        submissions: Array<{ requirement_id: string; document_url?: string; notes?: string }>;
    }) => {
        const res = await api.post<ApiResponse<EnrollmentRequirement[]>>(
            ENDPOINTS.REQUIREMENTS.ENROLLMENT(type, enrollmentId),
            data
        );
        return res.data.data;
    },

    /** Review (approve/reject) a requirement submission */
    reviewSubmission: async (submissionId: string, data: {
        is_satisfied: boolean;
        notes?: string;
    }) => {
        const res = await api.patch<ApiResponse<EnrollmentRequirement>>(
            ENDPOINTS.REQUIREMENTS.REVIEW(submissionId),
            data
        );
        return res.data.data;
    },

    /** Get all pending enrollment requests */
    getPending: async (params?: { page?: number; limit?: number; type?: string }) => {
        const res = await api.get<any>(ENDPOINTS.REQUIREMENTS.PENDING, { params });
        return res.data;
    },

    /** Check if trainee meets requirements for a course/workshop */
    checkRequirements: async (type: 'course' | 'workshop', trainingId: string) => {
        const res = await api.get<ApiResponse<{
            has_requirements: boolean;
            requirements: TrainingRequirement[];
            all_met: boolean;
        }>>(ENDPOINTS.REQUIREMENTS.CHECK(type, trainingId));
        return res.data.data;
    },
};

export default requirementService;
