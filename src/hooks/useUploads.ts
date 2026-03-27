import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import toast from 'react-hot-toast';
import { useUIStore } from '../store/uiStore';

interface UploadResponse {
    url: string;
    originalName: string;
    size: number;
    mimeType: string;
}

export const useUploads = () => {
    const { locale } = useUIStore();
    const [progress, setProgress] = useState(0);

    const uploadCV = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('cv_file', file);

            const res = await api.post<{ data: UploadResponse }>(ENDPOINTS.UPLOADS.CV, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                }
            });
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(locale === 'ar' ? 'تم رفع السيرة الذاتية بنجاح' : 'CV uploaded successfully');
            setProgress(0);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to upload CV');
            setProgress(0);
        }
    });

    const uploadDocuments = useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach(f => formData.append('documents', f));

            const res = await api.post<{ data: UploadResponse[] }>(ENDPOINTS.UPLOADS.DOCUMENTS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                }
            });
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(locale === 'ar' ? 'تم رفع المستندات بنجاح' : 'Documents uploaded successfully');
            setProgress(0);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to upload documents');
            setProgress(0);
        }
    });

    const uploadWorkshopCover = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('cover_image', file);

            const res = await api.post<{ data: UploadResponse }>(ENDPOINTS.UPLOADS.WORKSHOP_COVER, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                }
            });
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(locale === 'ar' ? 'تم رفع صورة الغلاف بنجاح' : 'Cover image uploaded successfully');
            setProgress(0);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to upload cover image');
            setProgress(0);
        }
    });

    const deleteUpload = useMutation({
        mutationFn: async (file_path: string) => {
            const res = await api.delete(ENDPOINTS.UPLOADS.DELETE, { data: { file_path } });
            return res.data;
        },
        onSuccess: () => {
            toast.success(locale === 'ar' ? 'تم حذف الملف بنجاح' : 'File deleted successfully');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete file');
        }
    });

    return {
        uploadCV,
        uploadDocuments,
        uploadWorkshopCover,
        deleteUpload,
        progress
    };
};
