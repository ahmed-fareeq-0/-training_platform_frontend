import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar, IconButton, useTheme, alpha, Chip } from '@mui/material';
import { FavoriteBorder, Favorite, MoreVert, AccessTimeRounded, MenuBookRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { useToggleBookmark } from '../hooks/useWorkshops';
import { getImageUrl } from '../../../utils/imageUtils';

export interface WorkshopCardProps {
    workshop: any;
    isAdminOrManager?: boolean;
    onMenuClick?: (e: React.MouseEvent, workshopId: string) => void;
}

export default function WorkshopCard({ workshop, isAdminOrManager, onMenuClick }: WorkshopCardProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { locale } = useUIStore();
    const { user } = useAuthStore();
    const toggleBookmark = useToggleBookmark();

    const getLocalizedField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');
    const title = getLocalizedField(workshop.title_ar, workshop.title_en);

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return navigate('/login');
        toggleBookmark.mutate(workshop.id);
    };

    return (
        <Card
            id={`workshop-card-${workshop.id}`}
            onClick={() => navigate(`/workshops/${workshop.id}`)}
            sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    '& .cover-image': {
                        transform: 'scale(1.04)'
                    }
                },
            }}
        >
            {/* Cover Image Section */}
            <Box sx={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                <CardMedia
                    className="cover-image"
                    sx={{
                        height: '100%',
                        background: workshop.cover_image
                            ? `url(${getImageUrl(workshop.cover_image)}) center/cover no-repeat`
                            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        transition: 'transform 0.5s ease',
                    }}
                />

                {/* Actions overlay */}
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2, display: 'flex', gap: 1 }}>
                    {isAdminOrManager && onMenuClick && (
                        <IconButton
                            onClick={(e) => onMenuClick(e, workshop.id)}
                            sx={{
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                backdropFilter: 'blur(4px)',
                                '&:hover': { bgcolor: theme.palette.background.paper },
                            }}
                            size="small"
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {/* Floating Badge (Top Right) */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2, display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={handleBookmark}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.6) : alpha(theme.palette.common.black, 0.8),
                            backdropFilter: 'blur(4px)',
                            borderRadius: '8px',
                            p: 0.5,
                            '&:hover': { transform: 'scale(1.05)' },
                            transition: 'all 0.2s',
                        }}
                        size="small"
                    >
                        {workshop.is_bookmarked ? (
                            <Favorite sx={{ color: theme.palette.common.white, fontSize: 16 }} />
                        ) : (
                            <FavoriteBorder sx={{ color: theme.palette.common.white, fontSize: 16 }} />
                        )}
                    </IconButton>
                </Box>
            </Box>

            {/* Workshop Content Area */}
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>

                {/* Tags Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Chip
                        label={workshop.specialization_name_ar || workshop.specialization_name_en || (locale === 'ar' ? 'عام' : 'General')}
                        size="small"
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            borderRadius: '16px'
                        }}
                    />
                    <Chip
                        icon={<AccessTimeRounded sx={{ fontSize: '14px !important' }} />}
                        label={`${workshop.duration_hours || 1} ${locale === 'ar' ? 'ساعات' : 'h'}`}
                        size="small"
                        sx={{
                            bgcolor: alpha(theme.palette.text.secondary, 0.08),
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '16px',
                            pl: 0.5
                        }}
                    />
                    {workshop.session_start_time && (
                        <Chip
                            icon={<AccessTimeRounded sx={{ fontSize: '14px !important' }} />}
                            label={workshop.session_end_time ? `${workshop.session_start_time.substring(0, 5)} - ${workshop.session_end_time.substring(0, 5)}` : workshop.session_start_time.substring(0, 5)}
                            size="small"
                            sx={{
                                bgcolor: alpha(theme.palette.text.secondary, 0.08),
                                color: 'text.secondary',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                borderRadius: '16px',
                                pl: 0.5
                            }}
                        />
                    )}
                </Box>

                {/* Workshop Title */}
                <Typography variant="h6" fontWeight={800} sx={{
                    mb: 2,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    lineHeight: 1.4, minHeight: '2.8em',
                }}>
                    {title}
                </Typography>

                {/* Author Pill */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '24px', p: 0.5, pr: 2,
                        bgcolor: 'background.paper'
                    }}>
                        <Avatar
                            src={getImageUrl(workshop.trainer_avatar)}
                            sx={{
                                width: 24, height: 24,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                fontWeight: 700,
                                fontSize: '0.75rem'
                            }}
                        >
                            {workshop.trainer_name ? workshop.trainer_name.charAt(0).toUpperCase() : 'M'}
                        </Avatar>
                        <Typography variant="caption" fontWeight={700} color="text.primary">
                            {workshop.trainer_name || (locale === 'ar' ? 'المدرب / Trainer' : 'Trainer')}
                        </Typography>
                    </Box>
                </Box>

                {/* Card Footer Section */}
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}`
                }}>
                    {/* Start Side (Price) */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" color="text.primary" fontWeight={800} sx={{ lineHeight: 1 }}>
                            {Number(workshop.price) > 0 ? `${Number(workshop.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
                        </Typography>
                    </Box>

                    {/* End Side (Book Icon) */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'text.secondary',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        p: 0.75,
                    }}>
                        <MenuBookRounded fontSize="small" />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
