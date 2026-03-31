import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, useTheme, alpha, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, CircularProgress, Tooltip, Tabs, Tab, Badge,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { usePendingWorkshops, useReviewWorkshop } from '../../workshops/hooks/useWorkshops';
import { usePendingCourses, useReviewCourse } from '../../courses/hooks/useCourses';
import { useUIStore } from '../../../store/uiStore';

export default function ContentApprovalsPage() {
    const theme = useTheme();
    const { locale } = useUIStore();
    const isRTL = locale === 'ar';

    const [activeTab, setActiveTab] = useState(0);
    const [page] = useState(1);

    // ── Data ──
    const { data: workshopData, isLoading: workshopsLoading } = usePendingWorkshops({ page, limit: 50 });
    const { data: courseData, isLoading: coursesLoading } = usePendingCourses({ page, limit: 50 });

    const pendingWorkshops = workshopData?.data || [];
    const pendingCourses = courseData?.data || [];

    const workshopCount = workshopData?.pagination?.total || pendingWorkshops.length;
    const courseCount = courseData?.pagination?.total || pendingCourses.length;

    // ── Workshop Review ──
    const reviewWorkshopMutation = useReviewWorkshop();
    const [workshopDialog, setWorkshopDialog] = useState<{
        open: boolean;
        workshopId: string;
        action: 'approve' | 'reject';
        title: string;
    }>({ open: false, workshopId: '', action: 'approve', title: '' });
    const [workshopRejectReason, setWorkshopRejectReason] = useState('');

    const handleWorkshopReview = async () => {
        try {
            await reviewWorkshopMutation.mutateAsync({
                id: workshopDialog.workshopId,
                data: {
                    is_approved: workshopDialog.action === 'approve',
                    rejection_reason: workshopDialog.action === 'reject' ? workshopRejectReason : undefined,
                },
            });
            toast.success(
                workshopDialog.action === 'approve'
                    ? (isRTL ? 'تمت الموافقة على الورشة بنجاح' : 'Workshop approved successfully')
                    : (isRTL ? 'تم رفض الورشة' : 'Workshop rejected')
            );
        } catch {
            // handled by mutation
        }
        setWorkshopDialog({ open: false, workshopId: '', action: 'approve', title: '' });
        setWorkshopRejectReason('');
    };

    // ── Course Review ──
    const reviewCourseMutation = useReviewCourse();
    const [courseDialog, setCourseDialog] = useState<{
        open: boolean;
        courseId: string;
        action: 'approve' | 'reject';
        title: string;
    }>({ open: false, courseId: '', action: 'approve', title: '' });
    const [courseRejectReason, setCourseRejectReason] = useState('');

    const handleCourseReview = async () => {
        try {
            await reviewCourseMutation.mutateAsync({
                id: courseDialog.courseId,
                data: {
                    is_approved: courseDialog.action === 'approve',
                    rejection_reason: courseDialog.action === 'reject' ? courseRejectReason : undefined,
                },
            });
            toast.success(
                courseDialog.action === 'approve'
                    ? (isRTL ? 'تمت الموافقة على الدورة بنجاح' : 'Course approved successfully')
                    : (isRTL ? 'تم رفض الدورة' : 'Course rejected')
            );
        } catch {
            // handled by mutation
        }
        setCourseDialog({ open: false, courseId: '', action: 'approve', title: '' });
        setCourseRejectReason('');
    };

    const getField = (ar?: string, en?: string) => isRTL ? (ar || en || '—') : (en || ar || '—');

    const isLoading = workshopsLoading || coursesLoading;

    return (
        <Box>
            {/* ── Header ── */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    }}
                >
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        {isRTL ? 'موافقات المحتوى' : 'Content Approvals'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isRTL
                            ? 'مراجعة والموافقة أو رفض الورش والدورات المقدمة من المدربين'
                            : 'Review and approve or reject workshops and courses submitted by trainers'}
                    </Typography>
                </Box>
            </Box>

            {/* ── Tabs ── */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_e, v) => setActiveTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            minHeight: 48,
                        },
                    }}
                >
                    <Tab
                        icon={
                            <Badge badgeContent={workshopCount} color="warning" max={99}>
                                <SchoolIcon />
                            </Badge>
                        }
                        iconPosition="start"
                        label={isRTL ? 'الورشات المعلقة' : 'Pending Workshops'}
                    />
                    <Tab
                        icon={
                            <Badge badgeContent={courseCount} color="info" max={99}>
                                <MenuBookIcon />
                            </Badge>
                        }
                        iconPosition="start"
                        label={isRTL ? 'الدورات المعلقة' : 'Pending Courses'}
                    />
                </Tabs>
            </Box>

            {/* ── Loading ── */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* ═════════════════════════════════════════════
                        TAB 0: PENDING WORKSHOPS
                    ═════════════════════════════════════════════ */}
                    {activeTab === 0 && (
                        <>
                            {pendingWorkshops.length === 0 ? (
                                <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 6, textAlign: 'center' }}>
                                        <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                            {isRTL ? 'لا توجد ورشات معلقة للمراجعة' : 'No pending workshops to review'}
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                            {isRTL ? 'جميع الورشات تمت مراجعتها' : 'All workshops have been reviewed'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        borderRadius: '16px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        boxShadow: 'none',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.03)} 100%)`,
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'عنوان الورشة' : 'Workshop Title'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدرب' : 'Trainer'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'التخصص' : 'Specialization'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'السعر' : 'Price'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'تاريخ البدء' : 'Start Date'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المقاعد' : 'Seats'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'تاريخ الإنشاء' : 'Created'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'إجراءات' : 'Actions'}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pendingWorkshops.map((workshop: any, idx: number) => (
                                                <TableRow
                                                    key={workshop.id}
                                                    hover
                                                    sx={{
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                >
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                                                            {getField(workshop.title_ar, workshop.title_en)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={500}>
                                                            {workshop.trainer_name || '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getField(workshop.specialization_name_ar, workshop.specialization_name_en)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ borderRadius: '8px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={600}>
                                                            {Number(workshop.price).toLocaleString()} IQD
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {dayjs(workshop.start_date).format('DD/MM/YYYY')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={workshop.total_seats || workshop.max_participants || '—'}
                                                            size="small"
                                                            color="default"
                                                            sx={{ borderRadius: '8px', fontWeight: 600 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {dayjs(workshop.created_at).format('DD/MM/YYYY HH:mm')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Tooltip title={isRTL ? 'موافقة' : 'Approve'}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => setWorkshopDialog({
                                                                        open: true,
                                                                        workshopId: workshop.id,
                                                                        action: 'approve',
                                                                        title: getField(workshop.title_ar, workshop.title_en),
                                                                    })}
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                                                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.16) },
                                                                    }}
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={isRTL ? 'رفض' : 'Reject'}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => setWorkshopDialog({
                                                                        open: true,
                                                                        workshopId: workshop.id,
                                                                        action: 'reject',
                                                                        title: getField(workshop.title_ar, workshop.title_en),
                                                                    })}
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                                                                    }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {/* ═════════════════════════════════════════════
                        TAB 1: PENDING COURSES
                    ═════════════════════════════════════════════ */}
                    {activeTab === 1 && (
                        <>
                            {pendingCourses.length === 0 ? (
                                <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 6, textAlign: 'center' }}>
                                        <MenuBookIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                            {isRTL ? 'لا توجد دورات معلقة للمراجعة' : 'No pending courses to review'}
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                            {isRTL ? 'جميع الدورات تمت مراجعتها' : 'All courses have been reviewed'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        borderRadius: '16px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        boxShadow: 'none',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'عنوان الدورة' : 'Course Title'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدرب' : 'Trainer'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'التخصص' : 'Specialization'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'السعر' : 'Price'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المستوى' : 'Level'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'تاريخ الإنشاء' : 'Created'}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'إجراءات' : 'Actions'}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pendingCourses.map((course: any, idx: number) => (
                                                <TableRow
                                                    key={course.id}
                                                    hover
                                                    sx={{
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                >
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                                                            {getField(course.title_ar, course.title_en)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={500}>
                                                            {course.trainer_name || '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getField(course.specialization_name_ar, course.specialization_name_en)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ borderRadius: '8px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={600}>
                                                            {Number(course.price).toLocaleString()} IQD
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={
                                                                course.level === 'beginner'
                                                                    ? (isRTL ? 'مبتدئ' : 'Beginner')
                                                                    : course.level === 'intermediate'
                                                                        ? (isRTL ? 'متوسط' : 'Intermediate')
                                                                        : (isRTL ? 'متقدم' : 'Advanced')
                                                            }
                                                            size="small"
                                                            color={
                                                                course.level === 'beginner' ? 'success'
                                                                    : course.level === 'intermediate' ? 'warning' : 'error'
                                                            }
                                                            variant="outlined"
                                                            sx={{ borderRadius: '8px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {dayjs(course.created_at).format('DD/MM/YYYY HH:mm')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Tooltip title={isRTL ? 'موافقة' : 'Approve'}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => setCourseDialog({
                                                                        open: true,
                                                                        courseId: course.id,
                                                                        action: 'approve',
                                                                        title: getField(course.title_ar, course.title_en),
                                                                    })}
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                                                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.16) },
                                                                    }}
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={isRTL ? 'رفض' : 'Reject'}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => setCourseDialog({
                                                                        open: true,
                                                                        courseId: course.id,
                                                                        action: 'reject',
                                                                        title: getField(course.title_ar, course.title_en),
                                                                    })}
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                                                                    }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ═════════════════════════════════════════════
                WORKSHOP REVIEW DIALOG
            ═════════════════════════════════════════════ */}
            <Dialog
                open={workshopDialog.open}
                onClose={() => setWorkshopDialog({ open: false, workshopId: '', action: 'approve', title: '' })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px' },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        color: workshopDialog.action === 'approve' ? 'success.main' : 'error.main',
                        pb: 1,
                    }}
                >
                    {workshopDialog.action === 'approve'
                        ? (isRTL ? 'تأكيد الموافقة على الورشة' : 'Confirm Workshop Approval')
                        : (isRTL ? 'تأكيد رفض الورشة' : 'Confirm Workshop Rejection')}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        {workshopDialog.action === 'approve'
                            ? (isRTL
                                ? `هل أنت متأكد من الموافقة على الورشة "${workshopDialog.title}"؟ سيتم نشرها وجدولتها تلقائياً.`
                                : `Are you sure you want to approve "${workshopDialog.title}"? It will be published and scheduled.`)
                            : (isRTL
                                ? `هل أنت متأكد من رفض الورشة "${workshopDialog.title}"؟`
                                : `Are you sure you want to reject "${workshopDialog.title}"?`)}
                    </Typography>
                    {workshopDialog.action === 'reject' && (
                        <TextField
                            label={isRTL ? 'سبب الرفض' : 'Rejection Reason'}
                            fullWidth
                            multiline
                            rows={3}
                            value={workshopRejectReason}
                            onChange={(e) => setWorkshopRejectReason(e.target.value)}
                            placeholder={isRTL ? 'اذكر سبب رفض هذه الورشة...' : 'Please provide a reason for rejection...'}
                            sx={{ mt: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setWorkshopDialog({ open: false, workshopId: '', action: 'approve', title: '' })}
                        sx={{ borderRadius: '50px' }}
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        variant="contained"
                        color={workshopDialog.action === 'approve' ? 'success' : 'error'}
                        onClick={handleWorkshopReview}
                        disabled={reviewWorkshopMutation.isPending || (workshopDialog.action === 'reject' && !workshopRejectReason.trim())}
                        sx={{ borderRadius: '50px', fontWeight: 600, px: 3 }}
                    >
                        {reviewWorkshopMutation.isPending ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            workshopDialog.action === 'approve'
                                ? (isRTL ? 'موافقة' : 'Approve')
                                : (isRTL ? 'رفض' : 'Reject')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═════════════════════════════════════════════
                COURSE REVIEW DIALOG
            ═════════════════════════════════════════════ */}
            <Dialog
                open={courseDialog.open}
                onClose={() => setCourseDialog({ open: false, courseId: '', action: 'approve', title: '' })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px' },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        color: courseDialog.action === 'approve' ? 'success.main' : 'error.main',
                        pb: 1,
                    }}
                >
                    {courseDialog.action === 'approve'
                        ? (isRTL ? 'تأكيد الموافقة على الدورة' : 'Confirm Course Approval')
                        : (isRTL ? 'تأكيد رفض الدورة' : 'Confirm Course Rejection')}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        {courseDialog.action === 'approve'
                            ? (isRTL
                                ? `هل أنت متأكد من الموافقة على الدورة "${courseDialog.title}"؟ سيتم نشرها وإتاحتها للمتدربين.`
                                : `Are you sure you want to approve "${courseDialog.title}"? It will be published and available to trainees.`)
                            : (isRTL
                                ? `هل أنت متأكد من رفض الدورة "${courseDialog.title}"؟`
                                : `Are you sure you want to reject "${courseDialog.title}"?`)}
                    </Typography>
                    {courseDialog.action === 'reject' && (
                        <TextField
                            label={isRTL ? 'سبب الرفض' : 'Rejection Reason'}
                            fullWidth
                            multiline
                            rows={3}
                            value={courseRejectReason}
                            onChange={(e) => setCourseRejectReason(e.target.value)}
                            placeholder={isRTL ? 'اذكر سبب رفض هذه الدورة...' : 'Please provide a reason for rejection...'}
                            sx={{ mt: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setCourseDialog({ open: false, courseId: '', action: 'approve', title: '' })}
                        sx={{ borderRadius: '50px' }}
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        variant="contained"
                        color={courseDialog.action === 'approve' ? 'success' : 'error'}
                        onClick={handleCourseReview}
                        disabled={reviewCourseMutation.isPending || (courseDialog.action === 'reject' && !courseRejectReason.trim())}
                        sx={{ borderRadius: '50px', fontWeight: 600, px: 3 }}
                    >
                        {reviewCourseMutation.isPending ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            courseDialog.action === 'approve'
                                ? (isRTL ? 'موافقة' : 'Approve')
                                : (isRTL ? 'رفض' : 'Reject')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
