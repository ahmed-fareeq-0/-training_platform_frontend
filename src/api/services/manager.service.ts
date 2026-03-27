import api from '../axios';
import { ApiResponse, PaginatedResponse, User } from '../../types';
import { ManagerCreateInput, ManagerPermission, ManagerPermissionUpdateInput } from '../../types/manager.types';
import { ENDPOINTS } from '../endpoints';

export const managerService = {
    // Get all managers (with optional pagination/search)
    getManagers: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get<PaginatedResponse<User>>(ENDPOINTS.MANAGERS.BASE, { params });
        return data;
    },

    // Get specific manager by ID
    getManagerById: async (id: string) => {
        const { data } = await api.get<ApiResponse<User>>(ENDPOINTS.MANAGERS.BY_ID(id));
        return data;
    },

    // Create new manager
    createManager: async (payload: ManagerCreateInput) => {
        const { data } = await api.post<ApiResponse<User>>(ENDPOINTS.MANAGERS.BASE, payload);
        return data;
    },

    // Delete a manager
    deleteManager: async (id: string) => {
        const { data } = await api.delete<ApiResponse<void>>(ENDPOINTS.MANAGERS.BY_ID(id));
        return data;
    },

    // Get permissions for a specific manager
    getManagerPermissions: async (managerId: string) => {
        const { data } = await api.get<ApiResponse<ManagerPermission[]>>(ENDPOINTS.MANAGERS.PERMISSIONS(managerId));
        return data;
    },

    // Add permission to a manager for a specialization
    addManagerPermission: async (managerId: string, payload: ManagerPermissionUpdateInput) => {
        const { data } = await api.post<ApiResponse<ManagerPermission>>(ENDPOINTS.MANAGERS.PERMISSIONS(managerId), payload);
        return data;
    },

    // Update manager permission
    updateManagerPermission: async (managerId: string, payload: ManagerPermissionUpdateInput) => {
        const { data } = await api.patch<ApiResponse<ManagerPermission>>(ENDPOINTS.MANAGERS.PERMISSIONS(managerId), payload);
        return data;
    },

    // Remove permission from manager
    removeManagerPermission: async (managerId: string, specializationId: string) => {
        const { data } = await api.delete<ApiResponse<void>>(ENDPOINTS.MANAGERS.REMOVE_PERMISSION(managerId, specializationId));
        return data;
    },
};
