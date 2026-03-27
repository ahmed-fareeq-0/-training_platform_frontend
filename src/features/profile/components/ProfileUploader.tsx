import { useState } from 'react';
import { Box, Button, Typography, Avatar, CircularProgress, useTheme } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../utils/imageUtils';

interface ProfileUploaderProps {
    currentImage?: string;
    onUploadSuccess: (newUrl: string) => void;
}

export default function ProfileUploader({ currentImage, onUploadSuccess }: ProfileUploaderProps) {
    const { t } = useTranslation();
    const theme = useTheme();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error(t('validation.invalidImageType', 'Invalid image type'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('validation.imageSize', 'Image size must be less than 5MB'));
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('profile_image', file);

        try {
            const res = await api.post(ENDPOINTS.UPLOADS.PROFILE_IMAGE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newUrl = res.data.data.url;
            onUploadSuccess(newUrl);
            toast.success(t('validation.imageUploaded', 'Image uploaded successfully'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
                src={getImageUrl(currentImage)}
                sx={{ width: 120, height: 120, bgcolor: theme.palette.primary.main, fontSize: 40 }}
            />

            <Box sx={{ position: 'relative' }}>
                <input
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                <label htmlFor="profile-image-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUpload />}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : (t('nav.profile') + ' Image')}
                    </Button>
                </label>
            </Box>
            <Typography variant="caption" color="text.secondary">
                JPEG, PNG, WebP • Max 5MB
            </Typography>
        </Box>
    );
}
