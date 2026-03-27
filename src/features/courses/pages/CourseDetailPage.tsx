import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Stack, CircularProgress, Avatar,
    Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemButton,
    ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    FormControl, InputLabel, Select, MenuItem, Alert, Grid, Card, CardContent, Divider, useTheme, alpha, Tabs, Tab, TextField,
    LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DescriptionIcon from '@mui/icons-material/Description';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

import { useCourseById, useEnrollInCourse, useMyEnrollments } from '../hooks/useCourses';
import { useCourseProgress } from '../hooks/useCourses';
import { useAuthStore } from '../../../store/authStore';
import { CourseSection, CourseLesson, UserRole, RequirementType } from '../../../types';
import { useUIStore } from '../../../store/uiStore';
import { useTrainingRequirements, useSubmitRequirement } from '../../requirements/hooks/useRequirements';
import { useUploads } from '../../../hooks/useUploads';
import toast from 'react-hot-toast';
import { CustomTabPanel, lessonIcons, levelLabels, formatDuration, formatHoursMinutes, SidebarInfoRow } from '../components/courseUtils';
import { useActionGuard } from '../../../hooks/useActionGuard';

const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuthStore();
    const { locale } = useUIStore();

    const { data: course, isLoading } = useCourseById(id!);
    const enrollMutation = useEnrollInCourse();
    const { data: myEnrollments } = useMyEnrollments({ enabled: !!user });
    const { guard: enrollGuard, isLocked: isEnrollLocked } = useActionGuard();

    // Check if user is actively enrolled in this course
    const myEnrollment = useMemo(() => {
        if (!myEnrollments || !id) return null;
        return (myEnrollments as any[])?.find((e: any) => e.course_id === id && (e.status === 'active' || e.status === 'completed'));
    }, [myEnrollments, id]);

    const { data: progressData } = useCourseProgress(myEnrollment ? id! : '');

    // Auto-redirect enrolled users directly to the learning page
    useEffect(() => {
        if (myEnrollment && id) {
            navigate(`/courses/${id}/learn`, { replace: true });
        }
    }, [myEnrollment, id, navigate]);

    const [enrollOpen, setEnrollOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
    const [previewLesson, setPreviewLesson] = useState<CourseLesson | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');

    const { data: requirements = [] } = useTrainingRequirements('course', id || '');
    const submitReqMutation = useSubmitRequirement();
    const { uploadDocuments } = useUploads();

    // Requirement form state
    const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});
    const [requirementNotes, setRequirementNotes] = useState<Record<string, string>>({});

    // Find the first preview video lesson to auto-play in hero
    const firstPreviewVideo = useMemo(() => {
        if (!course?.sections) return null;
        for (const section of course.sections) {
            if (!section.lessons) continue;
            for (const lesson of section.lessons) {
                if (lesson.is_preview && lesson.lesson_type === 'video' && lesson.media_url) {
                    return lesson;
                }
            }
        }
        return null;
    }, [course?.sections]);

    // Set the initial video when course data loads
    useEffect(() => {
        if (firstPreviewVideo && !currentVideoUrl) {
            setCurrentVideoUrl(firstPreviewVideo.media_url || null);
            setCurrentVideoTitle(locale === 'ar' ? firstPreviewVideo.title_ar : firstPreviewVideo.title_en);
        }
    }, [firstPreviewVideo, currentVideoUrl, locale]);

    const handleLessonClick = (lesson: CourseLesson) => {
        // If user is enrolled, navigate to the course player
        if (myEnrollment) {
            navigate(`/courses/${id}/learn`);
            return;
        }
        if (!lesson.is_preview) return;
        if (lesson.lesson_type === 'video' && lesson.media_url) {
            // Swap the hero video
            setCurrentVideoUrl(lesson.media_url);
            setCurrentVideoTitle(locale === 'ar' ? lesson.title_ar : lesson.title_en);
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Open dialog for PDF/text
            setPreviewLesson(lesson);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };


    const totalLessons = course?.sections?.reduce(
        (acc: number, sec: CourseSection) => acc + (sec.lessons?.length || 0), 0
    ) || 0;

    const hasRequirements = requirements.length > 0;
    const needsApproval = course?.requires_approval || hasRequirements;

    // Memoize Plyr props BEFORE any early returns to satisfy React's Rules of Hooks
    const heroVideoSrc = currentVideoUrl || course?.preview_video_url;
    const heroVideoSource = useMemo(() => {
        return heroVideoSrc ? { type: 'video' as const, sources: [{ src: heroVideoSrc, provider: 'html5' as const }] } : undefined;
    }, [heroVideoSrc]);

    const heroVideoOptions = useMemo(() => {
        return { autoplay: true, muted: true, controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'] };
    }, []);

    const previewVideoSrc = previewLesson?.media_url;
    const previewVideoSource = useMemo(() => {
        return previewVideoSrc ? { type: 'video' as const, sources: [{ src: previewVideoSrc, provider: 'html5' as const }] } : undefined;
    }, [previewVideoSrc]);

    const previewVideoOptions = useMemo(() => {
        return { autoplay: true };
    }, []);

    const handleEnroll = async () => {
        if (!id) return;

        // Validate requirement files if any
        const missingDocs = requirements.filter(req =>
            req.requirement_type === RequirementType.DOCUMENT &&
            req.is_required &&
            !requirementFiles[req.id]
        );

        if (missingDocs.length > 0) {
            toast.error(locale === 'ar' ? 'يرجى إرفاق جميع المستندات المطلوبة' : 'Please attach all required documents');
            return;
        }

        try {
            const enrollment: any = await enrollMutation.mutateAsync({
                courseId: id,
                data: { payment_method: paymentMethod },
            });

            const enrollmentId = enrollment.id || enrollment.data?.id; // backend usually returns the whole enrollment

            if (hasRequirements && enrollmentId) {
                const submissions = await Promise.all(
                    requirements.map(async (req) => {
                        let docUrl;
                        if (req.requirement_type === RequirementType.DOCUMENT && requirementFiles[req.id]) {
                            const res = await uploadDocuments.mutateAsync([requirementFiles[req.id]]);
                            docUrl = res[0].url;
                        }
                        return {
                            requirement_id: req.id,
                            document_url: docUrl,
                            notes: requirementNotes[req.id] || '',
                        };
                    })
                );

                await submitReqMutation.mutateAsync({
                    type: 'course',
                    enrollmentId: enrollmentId,
                    data: {
                        training_type: 'course',
                        training_id: id,
                        submissions,
                    }
                });

                toast.success(locale === 'ar' ? 'تم تقديم المستندات، التسجيل قيد المراجعة' : 'Documents submitted. Enrollment pending review.');
            }

            setEnrollOpen(false);
        } catch {
            // Error handled by mutation
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ py: 6, textAlign: 'center', width: '100%' }}>
                <Typography variant="h5">الدورة غير موجودة / Course not found</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/courses')}>
                    رجوع / Back
                </Button>
            </Box>
        );
    }

    const title = locale === 'ar' ? (course.title_ar || course.title_en) : (course.title_en || course.title_ar);
    const description = locale === 'ar' ? (course.description_ar || course.description_en) : (course.description_en || course.description_ar);

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={4}>
                {/* Main Content (Right side in RTL) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Hero Video Player Box */}
                    <Box sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        bgcolor: '#000',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 1,
                        position: 'relative',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        {(currentVideoUrl || course.preview_video_url) ? (
                            <Box sx={{
                                width: '100%', height: '100%',
                                '& .plyr': { height: '100%', borderRadius: 2, '--plyr-color-main': theme.palette.primary.main }
                            }}>
                                {heroVideoSource && (
                                    <Plyr
                                        source={heroVideoSource}
                                        options={heroVideoOptions}
                                    />
                                )}
                            </Box>
                        ) : (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: course.cover_image ? `url(${course.cover_image})` : undefined,
                                bgcolor: course.cover_image ? undefined : 'grey.900',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Box sx={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(4px)',
                                    border: '2px solid rgba(255,255,255,0.2)'
                                }}>
                                    <OndemandVideoIcon sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Now Playing label */}
                    {currentVideoTitle && (
                        <Box sx={{ mb: 3, px: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PlayCircleOutlineIcon sx={{ fontSize: 18 }} />
                                {locale === 'ar' ? 'يتم تشغيل:' : 'Now playing:'} <strong>{currentVideoTitle}</strong>
                            </Typography>
                        </Box>
                    )}

                    {/* Course Title (Moves under video in new layout) */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            {title}
                        </Typography>
                        {course.description_en && locale === 'ar' && (
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                {course.title_en}
                            </Typography>
                        )}
                    </Box>

                    {/* Tabs Navigation */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': { fontWeight: 600, fontSize: '1.05rem', minWidth: 100 },
                            }}
                        >
                            <Tab iconPosition="start" icon={<DescriptionIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'الوصف' : 'Description'} />
                            <Tab iconPosition="start" icon={<FormatListBulletedIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'الأقسام' : 'Curriculum'} />
                            <Tab iconPosition="start" icon={<SchoolIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'المدرّب' : 'Instructor'} />
                        </Tabs>
                    </Box>

                    {/* ----------- TAB 0: DESCRIPTION ----------- */}
                    <CustomTabPanel value={activeTab} index={0}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                            {locale === 'ar' ? 'عن هذه الدورة' : 'About this course'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem' }}>
                            {description || (locale === 'ar' ? 'لا يوجد وصف متوفر في الوقت الحالي.' : 'No description available at this time.')}
                        </Typography>
                    </CustomTabPanel>

                    {/* ----------- TAB 1: CURRICULUM ----------- */}
                    <CustomTabPanel value={activeTab} index={1}>
                        <Box sx={{ mb: 3, display: 'flex', gap: 3, color: 'text.secondary', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Typography variant="body2" fontWeight={600}>
                                {course.sections?.length || 0} {locale === 'ar' ? 'أقسام' : 'Sections'}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>•</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {totalLessons} {locale === 'ar' ? 'درس' : 'Lessons'}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>•</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {formatHoursMinutes(course.total_duration_minutes || 0)} {locale === 'ar' ? 'إجمالي المدة' : 'Total duration'}
                            </Typography>
                        </Box>

                        {course.sections && course.sections.length > 0 ? (
                            course.sections.map((section: CourseSection, idx: number) => (
                                <Accordion
                                    key={section.id}
                                    defaultExpanded={idx === 0}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        mb: 2,
                                        borderRadius: '16px !important',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '&:before': { display: 'none' },
                                        overflow: 'hidden'
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                            px: 3,
                                            py: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography fontWeight={700} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                                                    {locale === 'ar' ? (section.title_ar || section.title_en) : (section.title_en || section.title_ar)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    {section.lessons?.length || 0} {locale === 'ar' ? 'دروس' : 'Lessons'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ p: 0 }}>
                                        <List disablePadding>
                                            {section.lessons?.map((lesson: CourseLesson, lIdx: number) => (
                                                <React.Fragment key={lesson.id}>
                                                    {lIdx > 0 && <Divider component="li" />}
                                                    <ListItem disablePadding>
                                                        <ListItemButton
                                                            onClick={() => handleLessonClick(lesson)}
                                                            sx={{
                                                                px: 3,
                                                                py: 2,
                                                                cursor: (myEnrollment || lesson.is_preview) ? 'pointer' : 'default',
                                                                opacity: (myEnrollment || lesson.is_preview) ? 1 : 0.85,
                                                            }}
                                                        >
                                                            {/* Left side info (in RTL) - Duration & Lock */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                                                                {myEnrollment ? (
                                                                    <PlayCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                                                ) : lesson.is_preview ? (
                                                                    <VisibilityIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                                                ) : (
                                                                    <LockIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                                                                )}
                                                                {lesson.duration_seconds > 0 && (
                                                                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ minWidth: 40 }}>
                                                                        {formatDuration(lesson.duration_seconds)}
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {/* Center - Lesson Title */}
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body1" fontWeight={500}>
                                                                        {locale === 'ar' ? (lesson.title_ar || lesson.title_en) : (lesson.title_en || lesson.title_ar)}
                                                                    </Typography>
                                                                }
                                                            />

                                                            {/* Right side info (in RTL) - Index & Icon */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                                    {idx + 1}.{lIdx + 1}
                                                                </Typography>
                                                                <Box sx={{ color: (myEnrollment || lesson.is_preview) ? 'primary.main' : 'text.disabled', display: 'flex' }}>
                                                                    {lessonIcons[lesson.lesson_type] || lessonIcons.text}
                                                                </Box>
                                                            </Box>
                                                        </ListItemButton>
                                                    </ListItem>
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        ) : (
                            <Alert severity="info" sx={{ borderRadius: 3 }}>
                                {locale === 'ar' ? 'لم يتم إضافة محتوى للمنهج الدراسي بعد' : 'No curriculum content added yet'}
                            </Alert>
                        )}
                    </CustomTabPanel>

                    {/* ----------- TAB 2: INSTRUCTOR ----------- */}
                    <CustomTabPanel value={activeTab} index={2}>
                        {course.trainer_name ? (() => {
                            const isAr = locale === 'ar';
                            const isUniversityProf = course.trainer_type === 'university_professor';
                            const bio = isAr ? course.trainer_bio_ar : (course.trainer_bio_en || course.trainer_bio_ar);
                            const expYears = course.trainer_experience_years;

                            const academicDegreeLabels: Record<string, string> = {
                                'bachelor': isAr ? 'بكالوريوس' : 'Bachelor',
                                'master': isAr ? 'ماجستير' : 'Master',
                                'phd': isAr ? 'دكتوراه' : 'PhD',
                            };
                            const academicTitleLabels: Record<string, string> = {
                                'lecturer': isAr ? 'مدرّس' : 'Lecturer',
                                'assistant_professor': isAr ? 'أستاذ مساعد' : 'Assistant Professor',
                                'professor': isAr ? 'أستاذ' : 'Professor',
                            };

                            const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
                                    <Box sx={{ color: 'primary.main', mt: 0.3 }}>{icon}</Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {label}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>{value}</Typography>
                                    </Box>
                                </Box>
                            );

                            return (
                                <Stack spacing={3}>
                                    {/* Header Card: Avatar + Name + Type Badge */}
                                    <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', overflow: 'visible' }}>
                                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                                <Avatar
                                                    src={course.trainer_avatar}
                                                    sx={{
                                                        width: 96, height: 96,
                                                        bgcolor: theme.palette.primary.main,
                                                        fontSize: '2.5rem', fontWeight: 700,
                                                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                                    }}
                                                >
                                                    {course.trainer_name.charAt(0)}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h5" fontWeight={700}>
                                                        {course.trainer_name}
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.8,
                                                        mt: 1, px: 2, py: 0.6,
                                                        borderRadius: '12px',
                                                        bgcolor: isUniversityProf
                                                            ? alpha(theme.palette.secondary.main, 0.1)
                                                            : alpha(theme.palette.primary.main, 0.08),
                                                        color: isUniversityProf
                                                            ? theme.palette.secondary.main
                                                            : theme.palette.primary.main,
                                                    }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {isUniversityProf
                                                                ? (isAr ? 'أستاذ جامعي' : 'University Professor')
                                                                : (course.job_title || (isAr ? 'مدرب احترافي' : 'Professional Trainer'))}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    {/* Biography Card */}
                                    {bio && (
                                        <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                                    {isAr ? 'نبذة تعريفية' : 'Biography'}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                                                    {bio}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Details Card */}
                                    <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                {isUniversityProf
                                                    ? (isAr ? 'المؤهلات الأكاديمية' : 'Academic Credentials')
                                                    : (isAr ? 'الخبرات المهنية' : 'Professional Background')}
                                            </Typography>

                                            <Stack spacing={0} divider={<Divider />}>
                                                {/* University Professor fields */}
                                                {isUniversityProf && (
                                                    <>
                                                        {course.academic_degree && (
                                                            <InfoRow
                                                                icon={<SchoolIcon fontSize="small" />}
                                                                label={isAr ? 'الدرجة العلمية' : 'Academic Degree'}
                                                                value={academicDegreeLabels[course.academic_degree] || course.academic_degree}
                                                            />
                                                        )}
                                                        {course.academic_specialization && (
                                                            <InfoRow
                                                                icon={<WorkspacePremiumIcon fontSize="small" />}
                                                                label={isAr ? 'التخصص الأكاديمي' : 'Academic Specialization'}
                                                                value={course.academic_specialization}
                                                            />
                                                        )}
                                                        {course.academic_title && (
                                                            <InfoRow
                                                                icon={<DescriptionIcon fontSize="small" />}
                                                                label={isAr ? 'اللقب الأكاديمي' : 'Academic Title'}
                                                                value={academicTitleLabels[course.academic_title] || course.academic_title}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                {/* Professional Trainer fields */}
                                                {!isUniversityProf && (
                                                    <>
                                                        {course.job_title && (
                                                            <InfoRow
                                                                icon={<DescriptionIcon fontSize="small" />}
                                                                label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
                                                                value={course.job_title}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                {/* Shared fields */}
                                                {expYears != null && expYears > 0 && (
                                                    <InfoRow
                                                        icon={<AccessTimeIcon fontSize="small" />}
                                                        label={isAr ? 'سنوات الخبرة' : 'Years of Experience'}
                                                        value={isAr ? `${expYears} سنوات` : `${expYears} years`}
                                                    />
                                                )}

                                                {course.trainer_qualifications && (
                                                    <InfoRow
                                                        icon={<CheckCircleIcon fontSize="small" />}
                                                        label={isAr ? 'المؤهلات' : 'Qualifications'}
                                                        value={course.trainer_qualifications}
                                                    />
                                                )}

                                                {course.specialization_name_ar && (
                                                    <InfoRow
                                                        icon={<FormatListBulletedIcon fontSize="small" />}
                                                        label={isAr ? 'الفئة' : 'Category'}
                                                        value={isAr ? course.specialization_name_ar : (course.specialization_name_en || course.specialization_name_ar)}
                                                    />
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>

                                    {/* Core Skills Card (Professional only) */}
                                    {!isUniversityProf && course.core_skills && (
                                        <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                                    {isAr ? '🛠️ المهارات الأساسية' : '🛠️ Core Skills'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                                                    {course.core_skills.split(',').map((skill: string, i: number) => (
                                                        <Box key={i} sx={{
                                                            px: 2, py: 0.8,
                                                            borderRadius: '12px',
                                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                        }}>
                                                            {skill.trim()}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Stack>
                            );
                        })() : (
                            <Alert severity="info" sx={{ borderRadius: 3 }}>
                                {locale === 'ar' ? 'معلومات المدرب غير متوفرة' : 'Instructor information not available'}
                            </Alert>
                        )}
                    </CustomTabPanel>
                </Grid>

                {/* Sidebar Content (Left side in RTL) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Stack of Cards matching reference */}
                    <Stack spacing={3}>

                        {/* Sidebar Card 1: Pricing and CTA */}
                        {(!user || user.role === UserRole.TRAINEE) && (
                            <Card sx={{
                                borderRadius: '24px',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                                    <Typography variant="h5" fontWeight={800} gutterBottom>
                                        {locale === 'ar' ? 'ابدأ رحلتك التعليمية' : 'Start your learning journey'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                                        {locale === 'ar' ? 'احصل على وصول مدى الحياة لجميع محتويات وتحديثات الدورة.' : 'Get lifetime access to course content and updates once purchased.'}
                                    </Typography>

                                    {user?.role === UserRole.TRAINEE ? (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={() => setEnrollOpen(true)}
                                            sx={{ py: 1.8, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', px: 3 }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ShoppingCartIcon sx={{ fontSize: 22 }} />
                                                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                                    {needsApproval ? (locale === 'ar' ? 'طلب تسجيل' : 'Request Enrollment') : (locale === 'ar' ? 'التسجيل الآن' : 'Enroll Now')}
                                                </span>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 2, height: 24, alignSelf: 'center' }} />
                                                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                                                    {Number(course.price) > 0 ? `${Number(course.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
                                                </Typography>
                                            </Box>
                                        </Button>
                                    ) : !user && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={() => navigate('/login')}
                                            sx={{ py: 1.8, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', px: 3 }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LockIcon sx={{ fontSize: 22 }} />
                                                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                                    {locale === 'ar' ? 'تسجيل دخول' : 'Login'}
                                                </span>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 2, height: 24, alignSelf: 'center' }} />
                                                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                                                    {Number(course.price) > 0 ? `${Number(course.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
                                                </Typography>
                                            </Box>
                                        </Button>
                                    )}

                                    {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
                                                                                          <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                                                                                          <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                                                                    {locale === 'ar' ? 'ضمان استرداد الأموال لمدة 30 يومًا' : '30-Day Money-Back Guarantee'}
                                                                                          </Typography>
                                                                                </Box> */}
                                </CardContent>
                            </Card>
                        )}

                        {/* Sidebar Card: Progress (for enrolled users) */}
                        {myEnrollment && (
                            <Card sx={{
                                borderRadius: '24px',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                                overflow: 'hidden',
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
                            }}>
                                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={800} gutterBottom>
                                        {locale === 'ar' ? 'تقدمك في الدورة' : 'Your Progress'}
                                    </Typography>

                                    {progressData ? (
                                        <>
                                            <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                                                <CircularProgress
                                                    variant="determinate"
                                                    value={progressData.percentage}
                                                    size={100}
                                                    thickness={5}
                                                    sx={{
                                                        color: progressData.percentage === 100 ? 'success.main' : 'primary.main',
                                                        '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                                                    }}
                                                />
                                                <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5" fontWeight={800} color={progressData.percentage === 100 ? 'success.main' : 'primary.main'}>
                                                        {progressData.percentage}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {progressData.completed} / {progressData.total} {locale === 'ar' ? 'درس مكتمل' : 'lessons completed'}
                                            </Typography>
                                            {progressData.percentage === 100 && (
                                                <Typography variant="body2" color="success.main" fontWeight={700} sx={{ mb: 2 }}>
                                                    {locale === 'ar' ? '🎉 أكملت الدورة بنجاح!' : '🎉 Course completed!'}
                                                </Typography>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                                            {locale === 'ar' ? 'لم تبدأ بعد' : 'Not started yet'}
                                        </Typography>
                                    )}

                                    <LinearProgress
                                        variant="determinate"
                                        value={progressData?.percentage || 0}
                                        sx={{
                                            height: 8, borderRadius: 4, mb: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                background: (progressData?.percentage || 0) === 100
                                                    ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                                                    : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                            },
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate(`/courses/${id}/learn`)}
                                        startIcon={<PlayCircleOutlineIcon />}
                                        sx={{
                                            py: 1.8, borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem',
                                            textTransform: 'none',
                                            background: (progressData?.percentage || 0) > 0
                                                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                                                : undefined,
                                        }}
                                    >
                                        {(progressData?.percentage || 0) > 0
                                            ? (locale === 'ar' ? 'متابعة التعلم' : 'Continue Learning')
                                            : (locale === 'ar' ? 'بدء التعلم' : 'Start Learning')}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sidebar Card 3: Course Summary Details */}
                        <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                    {locale === 'ar' ? 'تفاصيل الدورة' : 'Course Details'}
                                </Typography>

                                <Stack spacing={2}>
                                    {course.specialization_name_ar && (
                                        <SidebarInfoRow icon={<SchoolIcon fontSize="small" />} label={locale === 'ar' ? 'الفئة' : 'Category'} value={locale === 'ar' ? course.specialization_name_ar : (course.specialization_name_en || course.specialization_name_ar)} />
                                    )}
                                    <SidebarInfoRow icon={<WorkspacePremiumIcon fontSize="small" />} label={locale === 'ar' ? 'المستوى' : 'Level'} value={levelLabels[course.level]} />
                                    <SidebarInfoRow icon={<FormatListBulletedIcon fontSize="small" />} label={locale === 'ar' ? 'عدد الأقسام' : 'Sections'} value={(course.sections?.length || 0).toString()} />
                                    <SidebarInfoRow icon={<PlayLessonRoundedIcon fontSize="small" />} label={locale === 'ar' ? 'عدد الدروس' : 'Lessons'} value={totalLessons.toString()} />
                                    <SidebarInfoRow icon={<AccessTimeIcon fontSize="small" />} label={locale === 'ar' ? 'المدة الكلية' : 'Total Duration'} value={formatHoursMinutes(course.total_duration_minutes || 0)} />
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Sidebar Card 4: Support */}
                        <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    {locale === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {locale === 'ar'
                                        ? 'تواصل مع فريق الدعم الفني عبر الواتساب لحل أي مشكلة تواجهك.'
                                        : 'Contact our support team via WhatsApp for any assistance.'}
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<WhatsAppIcon />}
                                    onClick={() => {
                                        const supportNumber = '+9647715503646'; // Replace with actual number
                                        const messageText = locale === 'ar'
                                            ? `مرحباً، أحتاج إلى مساعدة بخصوص الدورة.\n\nاسم الدورة: ${title}\nاسم الحساب: ${user?.full_name || ''}\nالبريد الإلكتروني: ${user?.email || ''}`
                                            : `Hello, I need assistance with a course.\n\nCourse Name: ${title}\nAccount Name: ${user?.full_name || ''}\nEmail: ${user?.email || ''}`;
                                        window.open(`https://wa.me/${supportNumber}?text=${encodeURIComponent(messageText)}`, '_blank');
                                    }}
                                    sx={{
                                        bgcolor: '#25D366',
                                        color: '#fff',
                                        borderRadius: '16px',
                                        py: 1.5,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#1DA851' }
                                    }}
                                >
                                    {locale === 'ar' ? 'تواصل عبر الواتساب' : 'Contact Support'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* Enrollment Dialog */}
            <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    {locale === 'ar' ? 'التسجيل في الدورة' : 'Enroll in Course'}
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        {locale === 'ar' ? 'سيتم تفعيل اشتراكك في الدورة بعد تأكيد الدفع من قبل الإدارة' : 'Your enrollment will be activated after payment is confirmed by the administration.'}
                    </Alert>

                    <Typography variant="body1" gutterBottom sx={{ mb: 1.5 }}>
                        <strong>{locale === 'ar' ? 'الدورة:' : 'Course:'}</strong> {title}
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                        <strong>{locale === 'ar' ? 'المبلغ المطلوب:' : 'Amount:'}</strong> <span style={{ color: theme.palette.primary.main, fontWeight: 800 }}>{Number(course.price).toLocaleString()} IQD</span>
                    </Typography>

                    {requirements.length > 0 && (
                        <Box sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                {locale === 'ar' ? 'المتطلبات الضرورية' : 'Required Information'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {locale === 'ar' ? 'يرجى إكمال المتطلبات التالية لإرسال طلب التسجيل.' : 'Please complete the following requirements to submit your enrollment request.'}
                            </Typography>

                            <Stack spacing={3}>
                                {requirements.map(req => (
                                    <Box key={req.id} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="body2" fontWeight={600} gutterBottom>
                                            {locale === 'ar' ? req.label_ar : req.label_en}
                                            {req.is_required && <Typography component="span" color="error"> *</Typography>}
                                        </Typography>
                                        {req.description_ar && (
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                {locale === 'ar' ? req.description_ar : (req.description_en || req.description_ar)}
                                            </Typography>
                                        )}

                                        {req.requirement_type === RequirementType.DOCUMENT && (
                                            <Button
                                                component="label"
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<CloudUploadIcon />}
                                                sx={{ mt: 1, py: 1, borderStyle: 'dashed', borderWidth: 2 }}
                                                color={requirementFiles[req.id] ? "success" : "primary"}
                                            >
                                                {requirementFiles[req.id]
                                                    ? requirementFiles[req.id].name
                                                    : (locale === 'ar' ? 'اختر ملف للإرفاق...' : 'Choose file to attach...')}
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setRequirementFiles(prev => ({ ...prev, [req.id]: e.target.files![0] }));
                                                        }
                                                    }}
                                                />
                                            </Button>
                                        )}

                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder={locale === 'ar' ? 'ملاحظات إضافية (اختياري)...' : 'Additional notes (optional)...'}
                                            value={requirementNotes[req.id] || ''}
                                            onChange={(e) => setRequirementNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                            sx={{ mt: req.requirement_type === RequirementType.DOCUMENT ? 2 : 1 }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>{locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</InputLabel>
                        <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                            label={locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="cash">💵 {locale === 'ar' ? 'نقداً / في المركز' : 'Cash / In Center'}</MenuItem>
                            <MenuItem value="bank_transfer">🏦 {locale === 'ar' ? 'تحويل بنكي / زين كاش' : 'Bank Transfer / Zain Cash'}</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button onClick={() => setEnrollOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={enrollGuard(handleEnroll)}
                        disabled={enrollMutation.isPending || isEnrollLocked}
                        startIcon={enrollMutation.isPending ? <CircularProgress size={18} /> : <CheckCircleIcon />}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                    >
                        {locale === 'ar' ? 'تأكيد التسجيل والدفع' : 'Confirm Enrollment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Lesson Dialog (Restructured logic remains the same) */}
            <Dialog open={!!previewLesson} onClose={() => setPreviewLesson(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                    <Box>
                        <VisibilityIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'info.main' }} />
                        {locale === 'ar' ? 'معاينة مجانية' : 'Free Preview'}
                    </Box>
                    <IconButton onClick={() => setPreviewLesson(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {previewLesson && (
                        <Box>
                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Typography fontWeight={600}>{locale === 'ar' ? previewLesson.title_ar : previewLesson.title_en}</Typography>
                                {previewLesson.title_en && locale === 'ar' && (
                                    <Typography variant="body2" color="text.secondary">{previewLesson.title_en}</Typography>
                                )}
                            </Box>
                            {previewLesson.lesson_type === 'video' && previewLesson.media_url && (
                                <Box sx={{
                                    position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#000',
                                    '& .plyr': { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', '--plyr-color-main': theme.palette.primary.main }
                                }}>
                                    {previewVideoSource && (
                                        <Plyr
                                            source={previewVideoSource}
                                            options={previewVideoOptions}
                                        />
                                    )}
                                </Box>
                            )}
                            {previewLesson.lesson_type === 'pdf' && previewLesson.media_url && (
                                <Box sx={{ height: 600 }}>
                                    <iframe
                                        src={previewLesson.media_url}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        title={previewLesson.title_en}
                                    />
                                </Box>
                            )}
                            {previewLesson.lesson_type === 'text' && (
                                <Box sx={{ p: 4 }}>
                                    <Typography>{locale === 'ar' ? previewLesson.title_ar : previewLesson.title_en}</Typography>
                                    {previewLesson.title_en && locale === 'ar' && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{previewLesson.title_en}</Typography>
                                    )}
                                </Box>
                            )}
                            {!previewLesson.media_url && previewLesson.lesson_type !== 'text' && (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        {locale === 'ar' ? 'لا يوجد ملف مرفوع لهذا الدرس' : 'No media uploaded for this lesson'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CourseDetailPage;
