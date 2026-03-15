import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
          Box, Typography, Container, Button, CircularProgress, Tab, Tabs,
          Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
          InputLabel, Select, MenuItem, Stack, IconButton, Alert, Chip, Menu,
          Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
          useTheme, alpha, Card, CardContent, ButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublishIcon from '@mui/icons-material/Publish';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import {
          useMyCourses, useAllCourses, useCreateCourse, useDeleteCourse, useUpdateCourse,
          usePendingEnrollments, useConfirmEnrollment, useUploadCourseMedia,
} from '../hooks/useCourses';
import { useMyWorkshops, useAllWorkshops, useDeleteWorkshop } from '../../workshops/hooks/useWorkshops';
import { useAuthStore } from '../../../store/authStore';
import { Course, CourseEnrollment, UserRole, Workshop } from '../../../types';
import { useSpecializations } from '../../specializations/hooks/useSpecializations';
import WorkshopFormDialog from '../../workshops/components/WorkshopFormDialog';
import dayjs from 'dayjs';

type EntityType = 'courses' | 'workshops';

const CourseManagePage: React.FC = () => {
          const navigate = useNavigate();
          const { user } = useAuthStore();
          const theme = useTheme();
          const { i18n } = useTranslation();
          const isRTL = i18n.language === 'ar';
          const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;

          // Entity toggle: courses vs workshops
          const [entityType, setEntityType] = useState<EntityType>('courses');

          const [tab, setTab] = useState(0);
          const [courseDialog, setCourseDialog] = useState(false);
          const [courseForm, setCourseForm] = useState<Record<string, string | number | boolean>>({});
          const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
          const [actionMenuCourse, setActionMenuCourse] = useState<Course | null>(null);
          const [workshopActionMenuAnchor, setWorkshopActionMenuAnchor] = useState<null | HTMLElement>(null);
          const [workshopActionTarget, setWorkshopActionTarget] = useState<Workshop | null>(null);

          // New Workshop dialog
          const [workshopFormOpen, setWorkshopFormOpen] = useState(false);

          const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
                    event.stopPropagation();
                    setActionMenuAnchor(event.currentTarget);
                    setActionMenuCourse(course);
          };
          const handleActionMenuClose = () => {
                    setActionMenuAnchor(null);
                    setActionMenuCourse(null);
          };

          const handleWorkshopMenuOpen = (event: React.MouseEvent<HTMLElement>, workshop: Workshop) => {
                    event.stopPropagation();
                    setWorkshopActionMenuAnchor(event.currentTarget);
                    setWorkshopActionTarget(workshop);
          };
          const handleWorkshopMenuClose = () => {
                    setWorkshopActionMenuAnchor(null);
                    setWorkshopActionTarget(null);
          };

          const getLevelLabel = (level: string) => {
                    const labels: Record<string, { ar: string; en: string }> = {
                              beginner: { ar: 'مبتدئ', en: 'Beginner' },
                              intermediate: { ar: 'متوسط', en: 'Intermediate' },
                              advanced: { ar: 'متقدم', en: 'Advanced' },
                    };
                    return labels[level]?.[isRTL ? 'ar' : 'en'] || level;
          };

          const formatDuration = (totalSeconds: number) => {
                    if (!totalSeconds || totalSeconds <= 0) return '-';
                    const totalMinutes = Math.floor(totalSeconds / 60);
                    const h = Math.floor(totalMinutes / 60);
                    const m = totalMinutes % 60;
                    if (h > 0 && m > 0) return `${h}${isRTL ? 'س' : 'h'} ${m}${isRTL ? 'د' : 'm'}`;
                    if (h > 0) return `${h}${isRTL ? 'س' : 'h'}`;
                    return `${m}${isRTL ? 'د' : 'm'}`;
          };

          const getStatusLabel = (status: string) => {
                    const map: Record<string, { ar: string; en: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
                              scheduled: { ar: 'مجدولة', en: 'Scheduled', color: 'success' },
                              approved: { ar: 'معتمدة', en: 'Approved', color: 'info' },
                              draft: { ar: 'مسودة', en: 'Draft', color: 'warning' },
                              pending: { ar: 'بانتظار الموافقة', en: 'Pending', color: 'warning' },
                              completed: { ar: 'مكتملة', en: 'Completed', color: 'default' },
                              cancelled: { ar: 'ملغاة', en: 'Cancelled', color: 'error' },
                    };
                    const entry = map[status] || { ar: status, en: status, color: 'default' as const };
                    return { label: isRTL ? entry.ar : entry.en, color: entry.color };
          };

          // Course data
          const { data: myCourses, isLoading: loadingMy } = useMyCourses();
          const { data: allCoursesData, isLoading: loadingAll } = useAllCourses();
          const { data: pendingData, isLoading: loadingPending } = usePendingEnrollments();
          const { data: specializations } = useSpecializations();

          // Workshop data
          const { data: myWorkshopsData, isLoading: loadingMyWorkshops } = useMyWorkshops();
          const { data: allWorkshopsData, isLoading: loadingAllWorkshops } = useAllWorkshops();

          const createCourse = useCreateCourse();
          const deleteCourse = useDeleteCourse();
          const updateCourse = useUpdateCourse();
          const confirmEnrollment = useConfirmEnrollment();
          const uploadMedia = useUploadCourseMedia();
          const deleteWorkshop = useDeleteWorkshop();

          const myWorkshops: Workshop[] = myWorkshopsData?.data || [];
          const allWorkshops: Workshop[] = allWorkshopsData?.data || [];

          const handleCreateCourse = async () => {
                    try {
                              const result = await createCourse.mutateAsync(courseForm) as any;
                              setCourseDialog(false);
                              setCourseForm({});
                              if (result?.id) {
                                        navigate(`/courses/${result.id}/edit`);
                              }
                    } catch { /* handled */ }
          };

          const handleTogglePublish = async (course: Course) => {
                    try {
                              await updateCourse.mutateAsync({ id: course.id, data: { is_published: !course.is_published } });
                    } catch { /* handled */ }
          };

          const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                              const result = await uploadMedia.mutateAsync({ file, folder: 'covers' }) as { url: string } | undefined;
                              if (result?.url) {
                                        setCourseForm(prev => ({ ...prev, cover_image: result.url }));
                              }
                    } catch { /* handled */ }
          };

          // Switch entity type and reset tab
          const handleEntitySwitch = (type: EntityType) => {
                    setEntityType(type);
                    setTab(0);
          };

          // Render Course Table
          const renderCourseTable = (courses: Course[], loading: boolean, emptyMessage: string) => (
                    <>
                              {loading && <CircularProgress />}
                              {!loading && courses.length === 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>{emptyMessage}</Alert>
                              )}
                              {!loading && courses.length > 0 && (
                                        <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                                                  <Table>
                                                            <TableHead>
                                                                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                                <TableCell sx={{ fontWeight: 700, width: 56 }}></TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المستوى' : 'Level'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'عنوان الدورة' : 'Course Title'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الفئة' : 'Category'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدة' : 'Duration'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدرب' : 'Trainer'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }} align="right">{isRTL ? 'السعر' : 'Price'}</TableCell>
                                                                      </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                      {courses.map((course: Course) => (
                                                                                <TableRow
                                                                                          key={course.id}
                                                                                          hover
                                                                                          sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                          onClick={() => navigate(`/courses/${course.id}/edit`)}
                                                                                >
                                                                                          <TableCell>
                                                                                                    <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, course)}>
                                                                                                              <MoreVertIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Chip
                                                                                                              label={getLevelLabel(course.level)}
                                                                                                              size="small"
                                                                                                              color={course.level === 'beginner' ? 'info' : course.level === 'intermediate' ? 'warning' : 'error'}
                                                                                                              variant="outlined"
                                                                                                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                                                                                    />
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                                                                                                              {isRTL ? (course.title_ar || course.title_en) : (course.title_en || course.title_ar)}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                              {isRTL ? (course.specialization_name_ar || course.specialization_name_en || '-') : (course.specialization_name_en || course.specialization_name_ar || '-')}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                                                                              {formatDuration((course as any).total_duration_seconds || 0)}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Chip
                                                                                                              label={course.is_published ? (isRTL ? 'منشورة' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                                                                                                              size="small"
                                                                                                              color={course.is_published ? 'success' : 'warning'}
                                                                                                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                                                                                    />
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography variant="body2">
                                                                                                              {course.trainer_name || '-'}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell align="right">
                                                                                                    <Typography variant="body2" fontWeight={700} color="primary">
                                                                                                              {Number(course.price) > 0 ? `${Number(course.price).toLocaleString()} ${isRTL ? 'د.ع' : 'IQD'}` : (isRTL ? 'مجاني' : 'Free')}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                </TableRow>
                                                                      ))}
                                                            </TableBody>
                                                  </Table>
                                        </TableContainer>
                              )}
                    </>
          );

          // Render Workshop Table
          const renderWorkshopTable = (workshops: Workshop[], loading: boolean, emptyMessage: string) => (
                    <>
                              {loading && <CircularProgress />}
                              {!loading && workshops.length === 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>{emptyMessage}</Alert>
                              )}
                              {!loading && workshops.length > 0 && (
                                        <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                                                  <Table>
                                                            <TableHead>
                                                                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                                <TableCell sx={{ fontWeight: 700, width: 56 }}></TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'عنوان الورشة' : 'Workshop Title'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'التاريخ' : 'Date'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدة' : 'Duration'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المقاعد' : 'Seats'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المدرب' : 'Trainer'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }} align="right">{isRTL ? 'السعر' : 'Price'}</TableCell>
                                                                      </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                      {workshops.map((ws: Workshop) => {
                                                                                const status = getStatusLabel(ws.status);
                                                                                return (
                                                                                          <TableRow
                                                                                                    key={ws.id}
                                                                                                    hover
                                                                                                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                                    onClick={() => navigate(`/workshops/${ws.id}/edit`)}
                                                                                          >
                                                                                                    <TableCell>
                                                                                                              <IconButton size="small" onClick={(e) => handleWorkshopMenuOpen(e, ws)}>
                                                                                                                        <MoreVertIcon fontSize="small" />
                                                                                                              </IconButton>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                                                                                                                        {isRTL ? (ws.title_ar || ws.title_en) : (ws.title_en || ws.title_ar)}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2" color="text.secondary">
                                                                                                                        {ws.start_date ? dayjs(ws.start_date).format('YYYY-MM-DD') : '-'}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                                                                                        {ws.duration_hours ? `${ws.duration_hours}${isRTL ? 'س' : 'h'}` : '-'}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2" color="text.secondary">
                                                                                                                        {ws.total_seats || '-'}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Chip
                                                                                                                        label={status.label}
                                                                                                                        size="small"
                                                                                                                        color={status.color}
                                                                                                                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                                                                                              />
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2">
                                                                                                                        {ws.trainer_name || '-'}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell align="right">
                                                                                                              <Typography variant="body2" fontWeight={700} color="primary">
                                                                                                                        {Number(ws.price) > 0 ? `${Number(ws.price).toLocaleString()} ${isRTL ? 'د.ع' : 'IQD'}` : (isRTL ? 'مجاني' : 'Free')}
                                                                                                              </Typography>
                                                                                                    </TableCell>
                                                                                          </TableRow>
                                                                                );
                                                                      })}
                                                            </TableBody>
                                                  </Table>
                                        </TableContainer>
                              )}
                    </>
          );

          const pageTitle = entityType === 'courses'
                    ? (isRTL ? 'إدارة الدورات' : 'Manage Courses')
                    : (isRTL ? 'إدارة الورش' : 'Manage Workshops');

          const pageSubtitle = entityType === 'courses'
                    ? (isRTL ? 'أضف دورات جديدة وقم بإدارة المحتوى التدريبي الخاص بك' : 'Add new courses and manage your training content')
                    : (isRTL ? 'أضف ورش جديدة وقم بإدارة الورش التدريبية الخاصة بك' : 'Add new workshops and manage your training workshops');

          return (
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                              {/* ========== HEADER ========== */}
                              {isAdmin ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                  <Typography variant="h4" fontWeight={700}>
                                                            {pageTitle}
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                            {/* Entity Switcher */}
                                                            <ButtonGroup variant="outlined" sx={{ borderRadius: 2 }}>
                                                                      <Button
                                                                                onClick={() => handleEntitySwitch('courses')}
                                                                                variant={entityType === 'courses' ? 'contained' : 'outlined'}
                                                                                sx={{ borderRadius: '8px 0 0 8px', fontWeight: 600 }}
                                                                      >
                                                                                {isRTL ? 'الدورات' : 'Courses'}
                                                                      </Button>
                                                                      <Button
                                                                                onClick={() => handleEntitySwitch('workshops')}
                                                                                variant={entityType === 'workshops' ? 'contained' : 'outlined'}
                                                                                sx={{ borderRadius: '0 8px 8px 0', fontWeight: 600 }}
                                                                      >
                                                                                {isRTL ? 'الورش' : 'Workshops'}
                                                                      </Button>
                                                            </ButtonGroup>
                                                            {/* New Button */}
                                                            <Button
                                                                      variant="contained"
                                                                      startIcon={<AddIcon />}
                                                                      onClick={() => {
                                                                                if (entityType === 'courses') {
                                                                                          setCourseForm({});
                                                                                          setCourseDialog(true);
                                                                                } else {
                                                                                          setWorkshopFormOpen(true);
                                                                                }
                                                                      }}
                                                                      sx={{ borderRadius: 2 }}
                                                            >
                                                                      {entityType === 'courses'
                                                                                ? (isRTL ? 'دورة جديدة' : 'New Course')
                                                                                : (isRTL ? 'ورشة جديدة' : 'New Workshop')}
                                                            </Button>
                                                  </Box>
                                        </Box>
                              ) : (
                                        <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                                                      <Box>
                                                                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                                                                          {pageTitle}
                                                                                </Typography>
                                                                                <Typography variant="body1" color="text.secondary">
                                                                                          {pageSubtitle}
                                                                                </Typography>
                                                                      </Box>
                                                                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                                                {/* Entity Switcher */}
                                                                                <ButtonGroup variant="outlined" sx={{ borderRadius: 2 }}>
                                                                                          <Button
                                                                                                    onClick={() => handleEntitySwitch('courses')}
                                                                                                    variant={entityType === 'courses' ? 'contained' : 'outlined'}
                                                                                                    sx={{ borderRadius: '8px 0 0 8px', fontWeight: 600 }}
                                                                                          >
                                                                                                    {isRTL ? 'الدورات' : 'Courses'}
                                                                                          </Button>
                                                                                          <Button
                                                                                                    onClick={() => handleEntitySwitch('workshops')}
                                                                                                    variant={entityType === 'workshops' ? 'contained' : 'outlined'}
                                                                                                    sx={{ borderRadius: '0 8px 8px 0', fontWeight: 600 }}
                                                                                          >
                                                                                                    {isRTL ? 'الورش' : 'Workshops'}
                                                                                          </Button>
                                                                                </ButtonGroup>
                                                                                <Button
                                                                                          variant="contained"
                                                                                          startIcon={<AddIcon />}
                                                                                          onClick={() => {
                                                                                                    if (entityType === 'courses') {
                                                                                                              setCourseForm({});
                                                                                                              setCourseDialog(true);
                                                                                                    } else {
                                                                                                              setWorkshopFormOpen(true);
                                                                                                    }
                                                                                          }}
                                                                                          sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
                                                                                >
                                                                                          {entityType === 'courses'
                                                                                                    ? (isRTL ? 'دورة جديدة' : 'New Course')
                                                                                                    : (isRTL ? 'ورشة جديدة' : 'New Workshop')}
                                                                                </Button>
                                                                      </Box>
                                                            </Box>
                                                  </CardContent>
                                        </Card>
                              )}

                              {/* ========== TABS ========== */}
                              {entityType === 'courses' && isAdmin && (
                                        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                                                  <Tab label={isRTL ? 'دوراتي' : 'My Courses'} />
                                                  <Tab label={isRTL ? 'كل الدورات' : 'All Courses'} />
                                                  <Tab label={isRTL ? 'طلبات التسجيل' : 'Pending Enrollments'} />
                                        </Tabs>
                              )}

                              {entityType === 'workshops' && isAdmin && (
                                        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                                                  <Tab label={isRTL ? 'ورشاتي' : 'My Workshops'} />
                                                  <Tab label={isRTL ? 'كل الورش' : 'All Workshops'} />
                                        </Tabs>
                              )}

                              {/* ========== COURSES CONTENT ========== */}
                              {entityType === 'courses' && (
                                        <>
                                                  {tab === 0 && renderCourseTable(
                                                            myCourses || [],
                                                            loadingMy,
                                                            isRTL ? 'لم تقم بإنشاء أي دورات بعد. اضغط على "دورة جديدة" للبدء!' : 'You haven\'t created any courses yet. Click "New Course" to start!'
                                                  )}
                                                  {tab === 1 && isAdmin && renderCourseTable(
                                                            allCoursesData?.data || [],
                                                            loadingAll,
                                                            isRTL ? 'لا توجد دورات.' : 'No courses found.'
                                                  )}
                                                  {tab === 2 && isAdmin && (
                                                            <>
                                                                      {loadingPending && <CircularProgress />}
                                                                      {!loadingPending && (pendingData?.data || []).length === 0 && (
                                                                                <Alert severity="info">لا يوجد طلبات تسجيل معلقة / No pending enrollments</Alert>
                                                                      )}
                                                                      {!loadingPending && (pendingData?.data || []).length > 0 && (
                                                                                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                                                                                          <Table>
                                                                                                    <TableHead>
                                                                                                              <TableRow>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>الطالب / Student</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>الدورة / Course</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>المبلغ / Amount</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>طريقة الدفع / Method</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>إجراء / Action</TableCell>
                                                                                                              </TableRow>
                                                                                                    </TableHead>
                                                                                                    <TableBody>
                                                                                                              {(pendingData?.data || []).map((enrollment: CourseEnrollment) => (
                                                                                                                        <TableRow key={enrollment.id}>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>{enrollment.user_name}</Typography>
                                                                                                                                            <Typography variant="caption" color="text.secondary">{enrollment.user_email}</Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>{enrollment.course_title_ar || enrollment.course_title_en}</TableCell>
                                                                                                                                  <TableCell>{Number(enrollment.amount_paid).toLocaleString()} IQD</TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip label={enrollment.payment_method === 'cash' ? 'نقداً' : 'تحويل'} size="small" />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Stack direction="row" spacing={1}>
                                                                                                                                                      <IconButton
                                                                                                                                                                color="success"
                                                                                                                                                                onClick={() => confirmEnrollment.mutate({ enrollmentId: enrollment.id, status: 'active' })}
                                                                                                                                                      >
                                                                                                                                                                <CheckCircleIcon />
                                                                                                                                                      </IconButton>
                                                                                                                                                      <IconButton
                                                                                                                                                                color="error"
                                                                                                                                                                onClick={() => confirmEnrollment.mutate({ enrollmentId: enrollment.id, status: 'cancelled' })}
                                                                                                                                                      >
                                                                                                                                                                <CancelIcon />
                                                                                                                                                      </IconButton>
                                                                                                                                            </Stack>
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

                              {/* ========== WORKSHOPS CONTENT ========== */}
                              {entityType === 'workshops' && (
                                        <>
                                                  {tab === 0 && renderWorkshopTable(
                                                            myWorkshops,
                                                            loadingMyWorkshops,
                                                            isRTL ? 'لم تقم بإنشاء أي ورش بعد. اضغط على "ورشة جديدة" للبدء!' : 'You haven\'t created any workshops yet. Click "New Workshop" to start!'
                                                  )}
                                                  {tab === 1 && isAdmin && renderWorkshopTable(
                                                            allWorkshops,
                                                            loadingAllWorkshops,
                                                            isRTL ? 'لا توجد ورش.' : 'No workshops found.'
                                                  )}
                                        </>
                              )}

                              {/* ========== COURSE ACTIONS MENU ========== */}
                              <Menu
                                        anchorEl={actionMenuAnchor}
                                        open={Boolean(actionMenuAnchor)}
                                        onClose={handleActionMenuClose}
                                        PaperProps={{ sx: { borderRadius: 2, minWidth: 180, boxShadow: 3 } }}
                              >
                                        <MenuItem onClick={() => { if (actionMenuCourse) navigate(`/courses/${actionMenuCourse.id}/edit`); handleActionMenuClose(); }}>
                                                  <BuildIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'بناء المنهج' : 'Build Curriculum'}
                                        </MenuItem>
                                        <MenuItem onClick={() => { if (actionMenuCourse) navigate(`/courses/${actionMenuCourse.id}`); handleActionMenuClose(); }}>
                                                  <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'عرض الدورة' : 'View Course'}
                                        </MenuItem>
                                        <MenuItem onClick={() => { if (actionMenuCourse) handleTogglePublish(actionMenuCourse); handleActionMenuClose(); }}>
                                                  <PublishIcon fontSize="small" sx={{ mr: 1.5 }} /> {actionMenuCourse?.is_published ? (isRTL ? 'إلغاء النشر' : 'Unpublish') : (isRTL ? 'نشر' : 'Publish')}
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                                  if (actionMenuCourse && confirm(isRTL ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Delete this course?')) {
                                                            deleteCourse.mutate(actionMenuCourse.id);
                                                  }
                                                  handleActionMenuClose();
                                        }} sx={{ color: 'error.main' }}>
                                                  <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'حذف' : 'Delete'}
                                        </MenuItem>
                              </Menu>

                              {/* ========== WORKSHOP ACTIONS MENU ========== */}
                              <Menu
                                        anchorEl={workshopActionMenuAnchor}
                                        open={Boolean(workshopActionMenuAnchor)}
                                        onClose={handleWorkshopMenuClose}
                                        PaperProps={{ sx: { borderRadius: 2, minWidth: 180, boxShadow: 3 } }}
                              >
                                        <MenuItem onClick={() => { if (workshopActionTarget) navigate(`/workshops/${workshopActionTarget.id}/edit`); handleWorkshopMenuClose(); }}>
                                                  <BuildIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'تعديل الورشة' : 'Edit Workshop'}
                                        </MenuItem>
                                        <MenuItem onClick={() => { if (workshopActionTarget) navigate(`/workshops/${workshopActionTarget.id}`); handleWorkshopMenuClose(); }}>
                                                  <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'عرض الورشة' : 'View Workshop'}
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                                  if (workshopActionTarget && confirm(isRTL ? 'هل أنت متأكد من حذف هذه الورشة؟' : 'Delete this workshop?')) {
                                                            deleteWorkshop.mutate(workshopActionTarget.id);
                                                  }
                                                  handleWorkshopMenuClose();
                                        }} sx={{ color: 'error.main' }}>
                                                  <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> {isRTL ? 'حذف' : 'Delete'}
                                        </MenuItem>
                              </Menu>

                              {/* ========== CREATE COURSE DIALOG ========== */}
                              <Dialog open={courseDialog} onClose={() => setCourseDialog(false)} maxWidth="sm" fullWidth>
                                        <DialogTitle fontWeight={700}>إنشاء دورة جديدة / Create New Course</DialogTitle>
                                        <DialogContent>
                                                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                                            بعد الإنشاء سيتم نقلك إلى صفحة بناء المنهج لإضافة الأقسام والدروس.
                                                            <br />
                                                            After creating, you'll be redirected to the Course Builder to add sections and lessons.
                                                  </Alert>
                                                  <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <TextField label="عنوان بالعربية" fullWidth required
                                                                      onChange={e => setCourseForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                            <TextField label="Title in English" fullWidth required
                                                                      onChange={e => setCourseForm(p => ({ ...p, title_en: e.target.value }))} />
                                                            <TextField label="وصف بالعربية" fullWidth multiline rows={3}
                                                                      onChange={e => setCourseForm(p => ({ ...p, description_ar: e.target.value }))} />
                                                            <TextField label="Description in English" fullWidth multiline rows={3}
                                                                      onChange={e => setCourseForm(p => ({ ...p, description_en: e.target.value }))} />
                                                            <TextField label="السعر (IQD)" type="number" fullWidth
                                                                      onChange={e => setCourseForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                                                            <FormControl fullWidth>
                                                                      <InputLabel>المستوى / Level</InputLabel>
                                                                      <Select
                                                                                value={(courseForm.level as string) || 'beginner'}
                                                                                onChange={e => setCourseForm(p => ({ ...p, level: e.target.value as string }))}
                                                                                label="المستوى / Level"
                                                                      >
                                                                                <MenuItem value="beginner">مبتدئ / Beginner</MenuItem>
                                                                                <MenuItem value="intermediate">متوسط / Intermediate</MenuItem>
                                                                                <MenuItem value="advanced">متقدم / Advanced</MenuItem>
                                                                      </Select>
                                                            </FormControl>
                                                            <FormControl fullWidth>
                                                                      <InputLabel>الفئة / Category</InputLabel>
                                                                      <Select
                                                                                value={(courseForm.specialization_id as string) || ''}
                                                                                onChange={e => setCourseForm(p => ({ ...p, specialization_id: e.target.value as string }))}
                                                                                label="الفئة / Category"
                                                                      >
                                                                                <MenuItem value="">بدون تخصص / None</MenuItem>
                                                                                {((specializations as any)?.data || specializations || []).map((s: any) => (
                                                                                          <MenuItem key={s.id} value={s.id}>{s.name_ar} / {s.name_en}</MenuItem>
                                                                                ))}
                                                                      </Select>
                                                            </FormControl>
                                                            <Box>
                                                                      <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                                                                                رفع صورة الغلاف / Upload Cover
                                                                                <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                                                                      </Button>
                                                                      {uploadMedia.isPending && <CircularProgress size={20} sx={{ ml: 1 }} />}
                                                                      {courseForm.cover_image && (
                                                                                <Typography variant="caption" sx={{ ml: 1 }}>✅ تم الرفع</Typography>
                                                                      )}
                                                            </Box>
                                                  </Stack>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 3 }}>
                                                  <Button onClick={() => setCourseDialog(false)}>إلغاء</Button>
                                                  <Button variant="contained" onClick={handleCreateCourse} disabled={createCourse.isPending}>
                                                            {createCourse.isPending ? <CircularProgress size={20} /> : 'إنشاء والبدء ببناء المنهج / Create & Build'}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>

                              {/* ========== CREATE WORKSHOP DIALOG ========== */}
                              <WorkshopFormDialog
                                        open={workshopFormOpen}
                                        onClose={() => setWorkshopFormOpen(false)}
                                        onCreated={(workshopId) => navigate(`/workshops/${workshopId}/edit`)}
                              />
                    </Container>
          );
};

export default CourseManagePage;
