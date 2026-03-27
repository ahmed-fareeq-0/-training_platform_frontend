import { Specialization } from './index';

export interface ManagerPermission {
    manager_id: string;
    specialization_id: string;
    can_approve_enrollments: boolean;
    can_approve_content: boolean;
    can_manage_workshops: boolean;
    can_view_reports: boolean;
    created_at: string;
    specialization?: Specialization;
}

export interface ManagerCreateInput {
    email: string;
    password?: string;
    full_name: string;
    phone?: string;
    specialization_ids: string[];
}

export interface ManagerPermissionUpdateInput {
    permissions: Array<{
        specialization_id: string;
        can_approve_enrollments?: boolean;
        can_approve_content?: boolean;
        can_manage_workshops?: boolean;
        can_view_reports?: boolean;
    }>;
}
