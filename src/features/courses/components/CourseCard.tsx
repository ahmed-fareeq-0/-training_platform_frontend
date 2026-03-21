import React from 'react';
import {
        Card, CardContent, CardMedia, Typography, Box, Chip, Avatar, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../../types';
import { useMyEnrollments } from '../hooks/useCourses';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import { useUIStore } from '../../../store/uiStore';

interface CourseCardProps {
        course: Course;
}

const levelColors: Record<string, 'success' | 'warning' | 'error'> = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'error',
};

const levelLabels: Record<string, string> = {
        beginner: 'مبتدئ / Beginner',
        intermediate: 'متوسط / Intermediate',
        advanced: 'متقدم / Advanced',
};

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
        const navigate = useNavigate();
        const theme = useTheme();
        const { locale } = useUIStore();
        const { data: myEnrollments } = useMyEnrollments();

        const isEnrolled = React.useMemo(() => {
                if (!myEnrollments || !course.id) return false;
                return (myEnrollments as any[]).some(e => e.course_id === course.id && (e.status === 'active' || e.status === 'completed'));
        }, [myEnrollments, course.id]);

        const formatDuration = (minutes: number) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
                if (hours > 0) return `${hours}h`;
                return `${mins}m`;
        };

        return (
                <Card
                        id={`course-card-${course.id}`}
                        onClick={() => navigate(isEnrolled ? `/courses/${course.id}/learn` : `/courses/${course.id}`)}
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
                                                background: course.cover_image
                                                        ? `url(${course.cover_image}) center/cover no-repeat`
                                                        : 'linear-gradient(135deg, #1C75BC 0%, #025589 100%)',
                                                transition: 'transform 0.5s ease',
                                        }}
                                />
                                {/* Floating Badge (Top Right) */}
                                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                        <Chip
                                                label={levelLabels[course.level] || course.level}
                                                color={levelColors[course.level] || 'default'}
                                                size="small"
                                                sx={{
                                                        fontWeight: 800,
                                                        fontSize: '0.75rem',
                                                        borderRadius: '8px',
                                                        px: 0.5,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}
                                        />
                                </Box>
                        </Box>

                        {/* Course Content Area */}
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>

                                {/* Tags Row */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                                        {course.specialization_name_ar && (
                                                <Chip
                                                        label={course.specialization_name_ar}
                                                        size="small"
                                                        sx={{
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                color: 'primary.main',
                                                                fontWeight: 800,
                                                                fontSize: '0.7rem',
                                                                borderRadius: '16px'
                                                        }}
                                                />
                                        )}
                                        <Chip
                                                icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                                                label={formatDuration(course.total_duration_minutes || 0)}
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
                                </Box>

                                {/* Course Title */}
                                <Typography variant="h6" fontWeight={800} sx={{
                                        mb: 2,
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        lineHeight: 1.4, minHeight: '2.8em',
                                }}>
                                        {course.title_ar || course.title_en}
                                </Typography>

                                {/* Author and Rating Pill */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        {/* Author Pill */}
                                        <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: '24px', p: 0.5, pr: 2,
                                                bgcolor: 'background.paper'
                                        }}>
                                                <Avatar
                                                        src={course.trainer_avatar}
                                                        sx={{
                                                                width: 24, height: 24,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                color: 'primary.main',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem'
                                                        }}
                                                >
                                                        {course.trainer_name ? course.trainer_name.charAt(0).toUpperCase() : 'M'}
                                                </Avatar>
                                                <Typography variant="caption" fontWeight={700} color="text.primary">
                                                        {course.trainer_name || 'المدرب / Trainer'}
                                                </Typography>
                                        </Box>

                                        {/* Rating Pill */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <StarIcon sx={{ color: '#FAAF00', fontSize: 18 }} />
                                                <Typography variant="body2" fontWeight={800} color="text.primary">
                                                        {Number(course.average_rating || 0).toFixed(1)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        ({course.review_count || 0})
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
                                                        {Number(course.price) > 0 ? `${Number(course.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
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
                                                <MenuBookIcon fontSize="small" />
                                        </Box>
                                </Box>
                        </CardContent>
                </Card>
        );
};

export default CourseCard;
