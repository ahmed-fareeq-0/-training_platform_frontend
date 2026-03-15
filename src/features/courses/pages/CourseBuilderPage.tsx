import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
          Box, Typography, Container, Button, CircularProgress, TextField, Stack,
          FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
          Accordion, AccordionSummary, AccordionDetails, IconButton, Chip,
          Dialog, DialogTitle, DialogContent, DialogActions, Alert, Paper,
          List, ListItem, ListItemButton, Divider, LinearProgress,
          Grid, Card, CardContent, useTheme, alpha, Tabs, Tab, Menu,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import SchoolIcon from '@mui/icons-material/School';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import {
          useCourseById, useUpdateCourse,
          useAddSection, useUpdateSection, useDeleteSection,
          useAddLesson, useUpdateLesson, useDeleteLesson,
          useUploadCourseMedia,
} from '../hooks/useCourses';
import { useSpecializations } from '../../specializations/hooks/useSpecializations';
import { CourseSection, CourseLesson } from '../../../types';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RequirementsTab from '../components/RequirementsTab';

// ==========================================
// Tab Panel (same pattern as CourseDetailPage)
// ==========================================
interface TabPanelProps {
          children?: React.ReactNode;
          index: number;
          value: number;
}

function CustomTabPanel(props: TabPanelProps) {
          const { children, value, index, ...other } = props;
          return (
                    <div
                              role="tabpanel"
                              hidden={value !== index}
                              id={`builder-tabpanel-${index}`}
                              aria-labelledby={`builder-tab-${index}`}
                              {...other}
                    >
                              {value === index && (
                                        <Box sx={{ py: 3 }}>
                                                  {children}
                                        </Box>
                              )}
                    </div>
          );
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
          video: <PlayCircleOutlineIcon color="primary" />,
          pdf: <PictureAsPdfIcon color="error" />,
          text: <ArticleIcon color="action" />,
};

const lessonTypeLabels: Record<string, { ar: string, en: string }> = {
          video: { ar: '🎥 فيديو', en: '🎥 Video' },
          pdf: { ar: '📄 مستند PDF', en: '📄 PDF Document' },
          text: { ar: '📝 نص', en: '📝 Text' },
};

const CourseBuilderPage: React.FC = () => {
          const { id } = useParams<{ id: string }>();
          const navigate = useNavigate();
          const theme = useTheme();
          const { i18n } = useTranslation();
          const isRTL = i18n.language === 'ar';
          const { data: course, isLoading } = useCourseById(id!);
          const { data: specializations } = useSpecializations();

          // Tab state
          const [activeTab, setActiveTab] = useState(0);

          // Mutations
          const updateCourse = useUpdateCourse();
          const addSection = useAddSection();
          const updateSection = useUpdateSection();
          const deleteSection = useDeleteSection();
          const addLessonMutation = useAddLesson();
          const updateLesson = useUpdateLesson();
          const deleteLessonMutation = useDeleteLesson();
          const uploadMedia = useUploadCourseMedia();

          // Dialogs
          const [sectionDialog, setSectionDialog] = useState<{ mode: 'add' | 'edit'; sectionId?: string } | null>(null);
          const [lessonDialog, setLessonDialog] = useState<{ mode: 'add' | 'edit'; sectionId: string; lessonId?: string } | null>(null);

          // Forms
          const [courseForm, setCourseForm] = useState<Record<string, string | number | boolean>>({});
          const [sectionForm, setSectionForm] = useState<Record<string, string | number>>({});
          const [lessonForm, setLessonForm] = useState<Record<string, string | number | boolean>>({});
          const [uploadProgress, setUploadProgress] = useState(false);
          const [isDragging, setIsDragging] = useState(false);

          // Three-dot menu state
          const [sectionMenuAnchor, setSectionMenuAnchor] = useState<null | HTMLElement>(null);
          const [sectionMenuTarget, setSectionMenuTarget] = useState<CourseSection | null>(null);
          const [lessonMenuAnchor, setLessonMenuAnchor] = useState<null | HTMLElement>(null);
          const [lessonMenuTarget, setLessonMenuTarget] = useState<{ sectionId: string; lesson: CourseLesson } | null>(null);

          // Initialize course form when course loads
          useEffect(() => {
                    if (course) {
                              setCourseForm({
                                        title_ar: course.title_ar || '',
                                        title_en: course.title_en || '',
                                        description_ar: course.description_ar || '',
                                        description_en: course.description_en || '',
                                        price: course.price || 0,
                                        level: course.level || 'beginner',
                                        cover_image: course.cover_image || '',
                                        specialization_id: course.specialization_id || '',
                                        requires_approval: course.requires_approval || false,
                              });
                    }
          }, [course]);

          // Delete cover image from storage + update form
          const handleDeleteCoverImage = async () => {
                    const coverUrl = courseForm.cover_image as string;
                    if (!coverUrl) return;
                    try {
                              // Extract relative path from URL for backend delete
                              const urlObj = new URL(coverUrl);
                              const filePath = urlObj.pathname.replace(/^\//, '');
                              await api.delete(ENDPOINTS.UPLOADS.DELETE, { data: { file_path: filePath } });
                    } catch { /* file may not exist, continue */ }
                    setCourseForm(p => ({ ...p, cover_image: '' }));
                    // Also save the course immediately to clear cover_image
                    if (id) {
                              try {
                                        await updateCourse.mutateAsync({ id, data: { ...courseForm, cover_image: '' } });
                              } catch { /* handled */ }
                    }
          };

          // Drag and drop handlers
          const handleDragOver = useCallback((e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragging(true);
          }, []);
          const handleDragLeave = useCallback((e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragging(false);
          }, []);
          const handleDrop = useCallback((e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                              handleMediaUpload({ target: { files: [file] } } as any, 'covers');
                    }
          }, []);

          const handleSaveCourse = async () => {
                    if (!id) return;
                    try {
                              await updateCourse.mutateAsync({ id, data: courseForm });
                    } catch { /* handled */ }
          };

          const handleTogglePublish = async () => {
                    if (!id || !course) return;
                    try {
                              await updateCourse.mutateAsync({ id, data: { is_published: !course.is_published } });
                    } catch { /* handled */ }
          };

          // Section handlers
          const openAddSection = () => {
                    setSectionForm({ title_ar: '', title_en: '', section_order: (course?.sections?.length || 0) + 1 });
                    setSectionDialog({ mode: 'add' });
          };

          const openEditSection = (section: CourseSection) => {
                    setSectionForm({ title_ar: section.title_ar, title_en: section.title_en, section_order: section.section_order });
                    setSectionDialog({ mode: 'edit', sectionId: section.id });
          };

          const handleSaveSection = async () => {
                    if (!id || !sectionDialog) return;
                    try {
                              if (sectionDialog.mode === 'add') {
                                        await addSection.mutateAsync({ courseId: id, data: sectionForm });
                              } else if (sectionDialog.sectionId) {
                                        await updateSection.mutateAsync({ courseId: id, sectionId: sectionDialog.sectionId, data: sectionForm });
                              }
                              setSectionDialog(null);
                              setSectionForm({});
                    } catch { /* handled */ }
          };

          const handleDeleteSection = async (sectionId: string) => {
                    if (!id) return;
                    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا القسم وجميع دروسه؟' : 'Delete this section and all its lessons?')) return;
                    try {
                              await deleteSection.mutateAsync({ courseId: id, sectionId });
                    } catch { /* handled */ }
          };

          // Lesson handlers
          const openAddLesson = (sectionId: string) => {
                    setLessonForm({ title_ar: '', title_en: '', lesson_type: 'video', duration_seconds: 0, lesson_order: 0, is_preview: false });
                    setLessonDialog({ mode: 'add', sectionId });
          };

          const openEditLesson = (sectionId: string, lesson: CourseLesson) => {
                    setLessonForm({
                              title_ar: lesson.title_ar, title_en: lesson.title_en,
                              lesson_type: lesson.lesson_type, media_url: lesson.media_url || '',
                              duration_seconds: lesson.duration_seconds, lesson_order: lesson.lesson_order,
                              is_preview: lesson.is_preview,
                    });
                    setLessonDialog({ mode: 'edit', sectionId, lessonId: lesson.id });
          };

          const handleSaveLesson = async () => {
                    if (!id || !lessonDialog) return;
                    try {
                              if (lessonDialog.mode === 'add') {
                                        await addLessonMutation.mutateAsync({ courseId: id, sectionId: lessonDialog.sectionId, data: lessonForm });
                              } else if (lessonDialog.lessonId) {
                                        await updateLesson.mutateAsync({ courseId: id, lessonId: lessonDialog.lessonId, data: lessonForm });
                              }
                              setLessonDialog(null);
                              setLessonForm({});
                    } catch { /* handled */ }
          };

          const handleDeleteLesson = async (lessonId: string) => {
                    if (!id) return;
                    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الدرس؟' : 'Delete this lesson?')) return;
                    try {
                              await deleteLessonMutation.mutateAsync({ courseId: id, lessonId });
                    } catch { /* handled */ }
          };

          const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadProgress(true);
                    try {
                              const result = await uploadMedia.mutateAsync({ file, folder }) as { url: string } | undefined;
                              if (result?.url) {
                                        if (folder === 'covers') {
                                                  setCourseForm(prev => ({ ...prev, cover_image: result.url }));
                                        } else {
                                                  setLessonForm(prev => ({ ...prev, media_url: result.url }));
                                        }
                              }
                    } catch { /* handled */ }
                    setUploadProgress(false);
          };

          // Section three-dot menu handlers
          const handleSectionMenuOpen = (event: React.MouseEvent<HTMLElement>, section: CourseSection) => {
                    event.stopPropagation();
                    setSectionMenuAnchor(event.currentTarget);
                    setSectionMenuTarget(section);
          };
          const handleSectionMenuClose = () => {
                    setSectionMenuAnchor(null);
                    setSectionMenuTarget(null);
          };

          // Lesson three-dot menu handlers
          const handleLessonMenuOpen = (event: React.MouseEvent<HTMLElement>, sectionId: string, lesson: CourseLesson) => {
                    event.stopPropagation();
                    setLessonMenuAnchor(event.currentTarget);
                    setLessonMenuTarget({ sectionId, lesson });
          };
          const handleLessonMenuClose = () => {
                    setLessonMenuAnchor(null);
                    setLessonMenuTarget(null);
          };

          const lessonVideoSrc = lessonForm.media_url as string | undefined;
          const lessonVideoSource = React.useMemo(() => {
                    return lessonVideoSrc ? { type: 'video' as const, sources: [{ src: lessonVideoSrc, provider: 'html5' as const }] } : undefined;
          }, [lessonVideoSrc]);

          const lessonVideoOptions = React.useMemo(() => {
                    return { autoplay: false, controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'] };
          }, []);

          if (isLoading) {
                    return (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (!course) {
                    return (
                              <Container sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="h5">{isRTL ? 'الدورة غير موجودة' : 'Course not found'}</Typography>
                                        <Button onClick={() => navigate('/courses/manage')} sx={{ mt: 2 }}>{isRTL ? 'العودة' : 'Back'}</Button>
                              </Container>
                    );
          }

          const totalLessons = course.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0;

          const getSpecializationName = () => {
                    if (!course.specialization_id) return '';
                    const specs = (specializations as any)?.data || specializations || [];
                    const category = specs.find((s: any) => s.id === course.specialization_id);
                    return category ? (isRTL ? category.name_ar : category.name_en) : course.specialization_id;
          };

          const getLevelLabel = (level: string) => {
                    const labels: Record<string, { ar: string; en: string }> = {
                              beginner: { ar: 'مبتدئ', en: 'Beginner' },
                              intermediate: { ar: 'متوسط', en: 'Intermediate' },
                              advanced: { ar: 'متقدم', en: 'Advanced' },
                    };
                    return labels[level]?.[isRTL ? 'ar' : 'en'] || level;
          };

          return (
                    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
                              <Grid container spacing={4}>
                                        {/* ======================== MAIN CONTENT ======================== */}
                                        <Grid size={{ xs: 12 }}>
                                                  {/* Header: Back button + Title */}
                                                  {/* <Box sx={{ mb: 3 }}>
                                                            <Button
                                                                      startIcon={<ArrowBackIcon />}
                                                                      onClick={() => navigate('/courses/manage')}
                                                                      sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}
                                                            >
                                                                      {isRTL ? 'الرجوع للدورات' : 'Back to Courses'}
                                                            </Button>
                                                            <Typography variant="h4" fontWeight={800} gutterBottom>
                                                                      {title}
                                                            </Typography>
                                                            {course.title_en && isRTL && (
                                                                      <Typography variant="subtitle1" color="text.secondary">
                                                                                {course.title_en}
                                                                      </Typography>
                                                            )}
                                                  </Box> */}

                                                  {/* ======================== TABS ======================== */}
                                                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                            <Tabs
                                                                      value={activeTab}
                                                                      onChange={(_e, v) => setActiveTab(v)}
                                                                      variant="scrollable"
                                                                      scrollButtons="auto"
                                                                      sx={{
                                                                                '& .MuiTab-root': { fontWeight: 600, fontSize: '1.05rem', minWidth: 100 },
                                                                      }}
                                                            >
                                                                      <Tab iconPosition="start" icon={<InfoOutlinedIcon sx={{ mr: 1 }} />} label={isRTL ? 'المعلومات الأساسية' : 'Basic Information'} />
                                                                      <Tab iconPosition="start" icon={<AssignmentIcon sx={{ mr: 1 }} />} label={isRTL ? 'المتطلبات' : 'Requirements'} />
                                                                      <Tab iconPosition="start" icon={<FormatListBulletedIcon sx={{ mr: 1 }} />} label={isRTL ? 'المنهج الدراسي' : 'Curriculum'} />
                                                                      <Tab iconPosition="start" icon={<BarChartIcon sx={{ mr: 1 }} />} label={isRTL ? 'ملخص الدورة' : 'Course Summary'} />
                                                            </Tabs>
                                                  </Box>

                                                  {/* ========== TAB 0: BASIC INFORMATION (Editable, no save) ========== */}
                                                  <CustomTabPanel value={activeTab} index={0}>
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'معلومات الدورة' : 'Course Information'}
                                                                                </Typography>
                                                                                <Stack spacing={2.5}>
                                                                                          <TextField label={isRTL ? 'عنوان بالعربية' : 'Title in Arabic'} fullWidth required
                                                                                                    value={courseForm.title_ar || ''}
                                                                                                    onChange={e => setCourseForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'عنوان بالإنجليزية' : 'Title in English'} fullWidth required
                                                                                                    value={courseForm.title_en || ''}
                                                                                                    onChange={e => setCourseForm(p => ({ ...p, title_en: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'وصف بالعربية' : 'Description in Arabic'} fullWidth multiline rows={6}
                                                                                                    value={courseForm.description_ar || ''}
                                                                                                    onChange={e => setCourseForm(p => ({ ...p, description_ar: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'وصف بالإنجليزية' : 'Description in English'} fullWidth multiline rows={6}
                                                                                                    value={courseForm.description_en || ''}
                                                                                                    onChange={e => setCourseForm(p => ({ ...p, description_en: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'السعر (IQD)' : 'Price (IQD)'} type="number" fullWidth
                                                                                                    value={courseForm.price || 0}
                                                                                                    onChange={e => setCourseForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                                                                                          <FormControl fullWidth>
                                                                                                    <InputLabel>{isRTL ? 'المستوى' : 'Level'}</InputLabel>
                                                                                                    <Select
                                                                                                              value={(courseForm.level as string) || 'beginner'}
                                                                                                              onChange={e => setCourseForm(p => ({ ...p, level: e.target.value as string }))}
                                                                                                              label={isRTL ? 'المستوى' : 'Level'}
                                                                                                    >
                                                                                                              <MenuItem value="beginner">{isRTL ? 'مبتدئ' : 'Beginner'}</MenuItem>
                                                                                                              <MenuItem value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</MenuItem>
                                                                                                              <MenuItem value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</MenuItem>
                                                                                                    </Select>
                                                                                          </FormControl>
                                                                                          <FormControl fullWidth>
                                                                                                    <InputLabel>{isRTL ? 'الفئة' : 'Category'}</InputLabel>
                                                                                                    <Select
                                                                                                              value={(courseForm.specialization_id as string) || ''}
                                                                                                              onChange={e => setCourseForm(p => ({ ...p, specialization_id: e.target.value as string }))}
                                                                                                              label={isRTL ? 'الفئة' : 'Category'}
                                                                                                    >
                                                                                                              <MenuItem value="">{isRTL ? 'بدون تخصص' : 'None'}</MenuItem>
                                                                                                              {((specializations as any)?.data || specializations || []).map((s: any) => (
                                                                                                                        <MenuItem key={s.id} value={s.id}>{isRTL ? s.name_ar : s.name_en}</MenuItem>
                                                                                                              ))}
                                                                                                    </Select>
                                                                                          </FormControl>

                                                                                          {/* Drag & Drop Cover Image Upload */}
                                                                                          <Box>
                                                                                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                                                                              {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                                                                                                    </Typography>
                                                                                                    {courseForm.cover_image ? (
                                                                                                              <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                                                                                                                        <Box
                                                                                                                                  component="img"
                                                                                                                                  src={courseForm.cover_image as string}
                                                                                                                                  alt="Cover"
                                                                                                                                  sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                                                                                                                        />
                                                                                                                        <Box sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.9) }}>
                                                                                                                                  <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 2 }}>
                                                                                                                                            {isRTL ? 'تغيير' : 'Change'}
                                                                                                                                            <input type="file" accept="image/*" hidden onChange={(e) => handleMediaUpload(e, 'covers')} />
                                                                                                                                  </Button>
                                                                                                                                  <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleDeleteCoverImage} sx={{ borderRadius: 2 }}>
                                                                                                                                            {isRTL ? 'حذف' : 'Delete'}
                                                                                                                                  </Button>
                                                                                                                        </Box>
                                                                                                              </Box>
                                                                                                    ) : (
                                                                                                              <Box
                                                                                                                        onDragOver={handleDragOver}
                                                                                                                        onDragLeave={handleDragLeave}
                                                                                                                        onDrop={handleDrop}
                                                                                                                        sx={{
                                                                                                                                  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
                                                                                                                                  borderRadius: 3,
                                                                                                                                  p: 4,
                                                                                                                                  textAlign: 'center',
                                                                                                                                  bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                                                                                                                  transition: 'all 0.2s ease',
                                                                                                                                  cursor: 'pointer',
                                                                                                                                  '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                                                                                                        }}
                                                                                                              >
                                                                                                                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                                                                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                                                                                                                                  {isRTL ? 'اسحب وأفلت الصورة هنا' : 'Drag & drop image here'}
                                                                                                                        </Typography>
                                                                                                                        <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                                                                                                                                  {isRTL ? 'أو' : 'or'}
                                                                                                                        </Typography>
                                                                                                                        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 2 }}>
                                                                                                                                  {isRTL ? 'اختر صورة' : 'Browse Files'}
                                                                                                                                  <input type="file" accept="image/*" hidden onChange={(e) => handleMediaUpload(e, 'covers')} />
                                                                                                                        </Button>
                                                                                                                        {uploadProgress && <CircularProgress size={24} sx={{ mt: 1 }} />}
                                                                                                              </Box>
                                                                                                    )}
                                                                                          </Box>
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>
                                                  </CustomTabPanel>

                                                  {/* ========== TAB 1: REQUIREMENTS ========== */}
                                                  <CustomTabPanel value={activeTab} index={1}>
                                                            <RequirementsTab
                                                                      courseId={id!}
                                                                      requiresApproval={!!courseForm.requires_approval}
                                                                      onToggleApproval={(val) => {
                                                                                setCourseForm(p => ({ ...p, requires_approval: val }));
                                                                                updateCourse.mutate({ id: id!, data: { requires_approval: val } });
                                                                      }}
                                                                      isRTL={isRTL}
                                                            />
                                                  </CustomTabPanel>

                                                  {/* ========== TAB 2: CURRICULUM ========== */}
                                                  <CustomTabPanel value={activeTab} index={2}>
                                                            {/* Stats Bar (matching CourseDetailPage) */}
                                                            <Box sx={{ mb: 3, display: 'flex', gap: 3, color: 'text.secondary', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                                                                      <Typography variant="body2" fontWeight={600}>
                                                                                {course.sections?.length || 0} {isRTL ? 'أقسام' : 'Sections'}
                                                                      </Typography>
                                                                      <Typography variant="body2" fontWeight={600}>•</Typography>
                                                                      <Typography variant="body2" fontWeight={600}>
                                                                                {totalLessons} {isRTL ? 'درس' : 'Lessons'}
                                                                      </Typography>
                                                            </Box>

                                                            {(!course.sections || course.sections.length === 0) && (
                                                                      <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
                                                                                {isRTL ? 'لم يتم إضافة أقسام بعد. ابدأ بإضافة قسم ثم أضف دروساً داخله.' : 'No sections yet. Start by adding a section, then add lessons inside it.'}
                                                                      </Alert>
                                                            )}

                                                            {course.sections?.map((section: CourseSection, sIdx: number) => (
                                                                      <Accordion
                                                                                key={section.id}
                                                                                defaultExpanded={sIdx === 0}
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
                                                                                          expandIcon={null}
                                                                                          sx={{
                                                                                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                                                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                                                                    px: 3,
                                                                                                    py: 1,
                                                                                                    '& .MuiAccordionSummary-content': { m: 0 }
                                                                                          }}
                                                                                >
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                                                    {/* Right side: arrow + number + title */}
                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                                              <ExpandMoreIcon sx={{ transition: 'transform 0.2s', transform: 'rotate(0deg)', '.Mui-expanded &': { transform: 'rotate(180deg)' } }} />
                                                                                                              <Typography variant="body2" fontWeight={800} color="primary" sx={{ minWidth: 20, textAlign: 'center' }}>
                                                                                                                        {sIdx + 1}
                                                                                                              </Typography>
                                                                                                              <Box>
                                                                                                                        <Typography fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                                                                                                                                  {isRTL ? (section.title_ar || section.title_en) : (section.title_en || section.title_ar)}
                                                                                                                        </Typography>
                                                                                                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                                                                                                  {section.lessons?.length || 0} {isRTL ? 'دروس' : 'Lessons'}
                                                                                                                        </Typography>
                                                                                                              </Box>
                                                                                                    </Box>

                                                                                                    {/* Left side: options menu */}
                                                                                                    <IconButton
                                                                                                              size="small"
                                                                                                              onClick={(e) => { e.stopPropagation(); handleSectionMenuOpen(e, section); }}
                                                                                                    >
                                                                                                              <MoreVertIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Box>
                                                                                </AccordionSummary>
                                                                                <AccordionDetails sx={{ p: 0 }}>
                                                                                          <List disablePadding>
                                                                                                    {section.lessons?.map((lesson: CourseLesson, lIdx: number) => (
                                                                                                              <React.Fragment key={lesson.id}>
                                                                                                                        {lIdx > 0 && <Divider component="li" />}
                                                                                                                        <ListItem disablePadding>
                                                                                                                                  <ListItemButton
                                                                                                                                            sx={{
                                                                                                                                                      px: 3,
                                                                                                                                                      py: 1.5,
                                                                                                                                                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                                                                                                                            }}
                                                                                                                                  >
                                                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                                                                                                      {/* Right side: type icon + number + title */}
                                                                                                                                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                                                                                                <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: 20 }}>
                                                                                                                                                                          {lessonTypeIcons[lesson.lesson_type] || lessonTypeIcons.text}
                                                                                                                                                                </Box>
                                                                                                                                                                <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ minWidth: 20 }}>
                                                                                                                                                                          {sIdx + 1}.{lIdx + 1}
                                                                                                                                                                </Typography>
                                                                                                                                                                <Typography variant="body1" fontWeight={500}>
                                                                                                                                                                          {isRTL ? (lesson.title_ar || lesson.title_en) : (lesson.title_en || lesson.title_ar)}
                                                                                                                                                                </Typography>
                                                                                                                                                      </Box>

                                                                                                                                                      {/* Left side: duration + options */}
                                                                                                                                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                                                                                                {lesson.duration_seconds > 0 && (
                                                                                                                                                                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                                                                                                                                                    {Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, '0')}
                                                                                                                                                                          </Typography>
                                                                                                                                                                )}
                                                                                                                                                                <IconButton
                                                                                                                                                                          size="small"
                                                                                                                                                                          onClick={(e) => { e.stopPropagation(); handleLessonMenuOpen(e, section.id, lesson); }}
                                                                                                                                                                >
                                                                                                                                                                          <MoreVertIcon sx={{ fontSize: 18 }} />
                                                                                                                                                                </IconButton>
                                                                                                                                                      </Box>
                                                                                                                                            </Box>
                                                                                                                                  </ListItemButton>
                                                                                                                        </ListItem>
                                                                                                              </React.Fragment>
                                                                                                    ))}
                                                                                          </List>

                                                                                          {/* Add Lesson Button Area */}
                                                                                          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderTop: `1px solid ${theme.palette.divider}` }}>
                                                                                                    <Button
                                                                                                              variant="outlined"
                                                                                                              startIcon={<AddIcon />}
                                                                                                              onClick={() => openAddLesson(section.id)}
                                                                                                              fullWidth
                                                                                                              sx={{ borderStyle: 'dashed', borderRadius: 2, py: 1.5, fontWeight: 700 }}
                                                                                                    >
                                                                                                              {isRTL ? 'إضافة درس' : 'Add Lesson'}
                                                                                                    </Button>
                                                                                          </Box>
                                                                                </AccordionDetails>
                                                                      </Accordion>
                                                            ))}

                                                            {/* Add section button */}
                                                            {course.sections && course.sections.length > 0 ? (
                                                                      <Button
                                                                                variant="outlined"
                                                                                startIcon={<AddIcon />}
                                                                                onClick={openAddSection}
                                                                                fullWidth
                                                                                sx={{ borderStyle: 'dashed', borderRadius: 3, py: 2, mt: 1, fontWeight: 700, borderWidth: 2 }}
                                                                      >
                                                                                {isRTL ? 'إضافة قسم جديد' : 'Add Another Section'}
                                                                      </Button>
                                                            ) : (
                                                                      <Button
                                                                                variant="contained"
                                                                                startIcon={<AddIcon />}
                                                                                onClick={openAddSection}
                                                                                size="large"
                                                                                sx={{ borderRadius: 3, py: 1.5, px: 4, fontWeight: 800 }}
                                                                      >
                                                                                {isRTL ? 'إضافة القسم الأول' : 'Add First Section'}
                                                                      </Button>
                                                            )}
                                                  </CustomTabPanel>

                                                  {/* ========== TAB 2: COURSE SUMMARY (Final Review + Save) ========== */}
                                                  <CustomTabPanel value={activeTab} index={3}>
                                                            {/* Course Info Summary */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'معلومات الدورة' : 'Course Information'}
                                                                                </Typography>
                                                                                <Stack spacing={2}>
                                                                                          <SidebarInfoRow icon={<WorkspacePremiumIcon fontSize="small" />} label={isRTL ? "المستوى" : "Level"} value={getLevelLabel((courseForm.level as string) || course.level)} />
                                                                                          {(courseForm.specialization_id || course.specialization_id) && (
                                                                                                    <SidebarInfoRow icon={<SchoolIcon fontSize="small" />} label={isRTL ? "الفئة" : "Category"} value={getSpecializationName()} />
                                                                                          )}
                                                                                          <SidebarInfoRow icon={<FormatListBulletedIcon fontSize="small" />} label={isRTL ? "عدد الأقسام" : "Sections"} value={(course.sections?.length || 0).toString()} />
                                                                                          <SidebarInfoRow icon={<PlayLessonRoundedIcon fontSize="small" />} label={isRTL ? "عدد الدروس" : "Lessons"} value={totalLessons.toString()} />
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                                                                                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                                                                              {isRTL ? 'السعر' : 'Price'}
                                                                                                    </Typography>
                                                                                                    <Typography variant="h6" fontWeight={800} color="primary">
                                                                                                              {Number(courseForm.price || course.price) > 0 ? `${Number(courseForm.price || course.price).toLocaleString()} IQD` : (isRTL ? 'مجاني' : 'Free')}
                                                                                                    </Typography>
                                                                                          </Box>
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Title & Description Summary */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 1 }}>
                                                                                          {isRTL ? (courseForm.title_ar as string || courseForm.title_en as string || '-') : (courseForm.title_en as string || courseForm.title_ar as string || '-')}
                                                                                </Typography>
                                                                                <Divider sx={{ my: 2 }} />
                                                                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                                                                                          {isRTL ? 'الوصف' : 'Description'}
                                                                                </Typography>
                                                                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem' }}>
                                                                                          {isRTL
                                                                                                    ? ((courseForm.description_ar as string) || (courseForm.description_en as string) || 'لا يوجد وصف')
                                                                                                    : ((courseForm.description_en as string) || (courseForm.description_ar as string) || 'No description')
                                                                                          }
                                                                                </Typography>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Cover Image Preview */}
                                                            {courseForm.cover_image && (
                                                                      <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3, overflow: 'hidden' }}>
                                                                                <CardContent sx={{ p: 3, pb: 1 }}>
                                                                                          <Typography variant="h6" fontWeight={700} gutterBottom>
                                                                                                    {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                                                                                          </Typography>
                                                                                </CardContent>
                                                                                <Box component="img" src={courseForm.cover_image as string} alt="Cover" sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
                                                                      </Card>
                                                            )}

                                                            {/* Curriculum Preview */}
                                                            {course.sections && course.sections.length > 0 && (
                                                                      <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                                <CardContent sx={{ p: 3 }}>
                                                                                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                                    {isRTL ? 'المنهج الدراسي' : 'Curriculum'}
                                                                                          </Typography>
                                                                                          {course.sections.map((section: CourseSection, sIdx: number) => (
                                                                                                    <Box key={section.id} sx={{ mb: 2 }}>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                                                                                                                        <Chip label={`${sIdx + 1}`} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 28 }} />
                                                                                                                        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>
                                                                                                                                  {isRTL ? (section.title_ar || section.title_en) : (section.title_en || section.title_ar)}
                                                                                                                        </Typography>
                                                                                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                                                                                                                  {section.lessons?.length || 0} {isRTL ? 'دروس' : 'lessons'}
                                                                                                                        </Typography>
                                                                                                              </Box>
                                                                                                              {section.lessons?.map((lesson: CourseLesson, lIdx: number) => (
                                                                                                                        <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8, px: 3 }}>
                                                                                                                                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ minWidth: 30 }}>
                                                                                                                                            {sIdx + 1}.{lIdx + 1}
                                                                                                                                  </Typography>
                                                                                                                                  <Typography variant="body2">
                                                                                                                                            {isRTL ? (lesson.title_ar || lesson.title_en) : (lesson.title_en || lesson.title_ar)}
                                                                                                                                  </Typography>
                                                                                                                        </Box>
                                                                                                              ))}
                                                                                                    </Box>
                                                                                          ))}
                                                                                </CardContent>
                                                                      </Card>
                                                            )}

                                                            {/* Save & Publish Actions */}
                                                            <Card sx={{ borderRadius: '16px', border: `2px solid ${theme.palette.primary.main}`, boxShadow: 'none', mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                                                          <Typography variant="h6" fontWeight={700}>
                                                                                                    {isRTL ? 'حفظ ونشر' : 'Save & Publish'}
                                                                                          </Typography>
                                                                                          <Chip
                                                                                                    label={course.is_published ? (isRTL ? '✅ منشورة' : '✅ Published') : (isRTL ? '📝 مسودة' : '📝 Draft')}
                                                                                                    color={course.is_published ? 'success' : 'warning'}
                                                                                                    sx={{ fontWeight: 700, fontSize: '0.85rem', py: 2, px: 0.5, borderRadius: 2 }}
                                                                                          />
                                                                                </Box>
                                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                                                          {isRTL ? 'راجع جميع المعلومات أعلاه ثم اضغط حفظ لحفظ التغييرات أو نشر لإتاحة الدورة للمتدربين.' : 'Review all the information above, then click Save to save your changes or Publish to make the course available to trainees.'}
                                                                                </Typography>
                                                                                <Stack direction="row" spacing={2}>
                                                                                          <Button
                                                                                                    variant="contained"
                                                                                                    startIcon={<SaveIcon />}
                                                                                                    onClick={handleSaveCourse}
                                                                                                    disabled={updateCourse.isPending}
                                                                                                    sx={{ borderRadius: '12px', py: 1.5, px: 4, fontWeight: 700, fontSize: '1rem', boxShadow: 'none' }}
                                                                                          >
                                                                                                    {updateCourse.isPending ? <CircularProgress size={20} /> : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                                                                                          </Button>
                                                                                          <Button
                                                                                                    variant={course.is_published ? 'outlined' : 'contained'}
                                                                                                    startIcon={<PublishIcon />}
                                                                                                    onClick={handleTogglePublish}
                                                                                                    disabled={updateCourse.isPending}
                                                                                                    sx={{
                                                                                                              borderRadius: '12px', py: 1.5, px: 4, fontWeight: 700, fontSize: '1rem',
                                                                                                              ...(course.is_published ? { borderWidth: 2 } : { bgcolor: theme.palette.success.main, '&:hover': { bgcolor: theme.palette.success.dark }, boxShadow: 'none' })
                                                                                                    }}
                                                                                          >
                                                                                                    {course.is_published ? (isRTL ? 'إلغاء النشر' : 'Unpublish') : (isRTL ? 'نشر الدورة' : 'Publish Course')}
                                                                                          </Button>
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>
                                                  </CustomTabPanel>
                                        </Grid>
                              </Grid>

                              {/* ======================== SECTION THREE-DOT MENU ======================== */}
                              <Menu
                                        anchorEl={sectionMenuAnchor}
                                        open={Boolean(sectionMenuAnchor)}
                                        onClose={handleSectionMenuClose}
                                        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
                              >
                                        <MenuItem onClick={() => {
                                                  if (sectionMenuTarget) openEditSection(sectionMenuTarget);
                                                  handleSectionMenuClose();
                                        }}>
                                                  <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'تعديل القسم' : 'Edit Section'}
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                                  if (sectionMenuTarget) handleDeleteSection(sectionMenuTarget.id);
                                                  handleSectionMenuClose();
                                        }} sx={{ color: 'error.main' }}>
                                                  <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'حذف القسم' : 'Delete Section'}
                                        </MenuItem>
                              </Menu>

                              {/* ======================== LESSON THREE-DOT MENU ======================== */}
                              <Menu
                                        anchorEl={lessonMenuAnchor}
                                        open={Boolean(lessonMenuAnchor)}
                                        onClose={handleLessonMenuClose}
                                        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
                              >
                                        <MenuItem onClick={() => {
                                                  if (lessonMenuTarget) openEditLesson(lessonMenuTarget.sectionId, lessonMenuTarget.lesson);
                                                  handleLessonMenuClose();
                                        }}>
                                                  <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'تعديل الدرس' : 'Edit Lesson'}
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                                  if (lessonMenuTarget) handleDeleteLesson(lessonMenuTarget.lesson.id);
                                                  handleLessonMenuClose();
                                        }} sx={{ color: 'error.main' }}>
                                                  <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'حذف الدرس' : 'Delete Lesson'}
                                        </MenuItem>
                              </Menu>



                              {/* ======================== SECTION DIALOG ======================== */}
                              <Dialog open={!!sectionDialog} onClose={() => setSectionDialog(null)} maxWidth="sm" fullWidth>
                                        <DialogTitle fontWeight={700}>
                                                  {sectionDialog?.mode === 'add' ? (isRTL ? 'إضافة قسم جديد' : 'Add New Section') : (isRTL ? 'تعديل القسم' : 'Edit Section')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <TextField label={isRTL ? 'عنوان القسم بالعربية' : 'Section Title (Arabic)'} fullWidth required
                                                                      value={sectionForm.title_ar || ''}
                                                                      onChange={e => setSectionForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                            <TextField label={isRTL ? 'عنوان القسم بالإنجليزية' : 'Section Title (English)'} fullWidth required
                                                                      value={sectionForm.title_en || ''}
                                                                      onChange={e => setSectionForm(p => ({ ...p, title_en: e.target.value }))} />
                                                            <TextField label={isRTL ? 'ترتيب' : 'Order'} type="number" fullWidth
                                                                      value={sectionForm.section_order ?? 0}
                                                                      onChange={e => setSectionForm(p => ({ ...p, section_order: parseInt(e.target.value) || 0 }))} />
                                                  </Stack>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 3 }}>
                                                  <Button onClick={() => setSectionDialog(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                                                  <Button variant="contained" onClick={handleSaveSection} disabled={addSection.isPending || updateSection.isPending}>
                                                            {sectionDialog?.mode === 'add' ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'حفظ' : 'Save')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>

                              {/* ======================== LESSON DIALOG ======================== */}
                              <Dialog open={!!lessonDialog} onClose={() => setLessonDialog(null)} maxWidth="sm" fullWidth>
                                        <DialogTitle fontWeight={700}>
                                                  {lessonDialog?.mode === 'add' ? (isRTL ? '➕ إضافة درس' : '➕ Add Lesson') : (isRTL ? '✏️ تعديل الدرس' : '✏️ Edit Lesson')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <TextField label={isRTL ? 'عنوان الدرس بالعربية' : 'Lesson Title (Arabic)'} fullWidth required
                                                                      value={lessonForm.title_ar || ''}
                                                                      onChange={e => setLessonForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                            <TextField label={isRTL ? 'عنوان الدرس بالإنجليزية' : 'Lesson Title (English)'} fullWidth required
                                                                      value={lessonForm.title_en || ''}
                                                                      onChange={e => setLessonForm(p => ({ ...p, title_en: e.target.value }))} />
                                                            <FormControl fullWidth>
                                                                      <InputLabel>{isRTL ? 'نوع الدرس' : 'Lesson Type'}</InputLabel>
                                                                      <Select
                                                                                value={(lessonForm.lesson_type as string) || 'video'}
                                                                                onChange={e => setLessonForm(p => ({ ...p, lesson_type: e.target.value as string }))}
                                                                                label={isRTL ? 'نوع الدرس' : 'Lesson Type'}
                                                                      >
                                                                                <MenuItem value="video">{lessonTypeLabels.video[isRTL ? 'ar' : 'en']}</MenuItem>
                                                                                <MenuItem value="pdf">{lessonTypeLabels.pdf[isRTL ? 'ar' : 'en']}</MenuItem>
                                                                                <MenuItem value="text">{lessonTypeLabels.text[isRTL ? 'ar' : 'en']}</MenuItem>
                                                                      </Select>
                                                            </FormControl>
                                                            <TextField label={isRTL ? 'المدة (ثواني)' : 'Duration (seconds)'} type="number" fullWidth
                                                                      value={lessonForm.duration_seconds ?? 0}
                                                                      onChange={e => setLessonForm(p => ({ ...p, duration_seconds: parseInt(e.target.value) || 0 }))} />
                                                            <TextField label={isRTL ? 'ترتيب' : 'Order'} type="number" fullWidth
                                                                      value={lessonForm.lesson_order ?? 0}
                                                                      onChange={e => setLessonForm(p => ({ ...p, lesson_order: parseInt(e.target.value) || 0 }))} />
                                                            <FormControlLabel
                                                                      control={
                                                                                <Switch
                                                                                          checked={!!lessonForm.is_preview}
                                                                                          onChange={e => setLessonForm(p => ({ ...p, is_preview: e.target.checked }))}
                                                                                />
                                                                      }
                                                                      label={isRTL ? 'معاينة مجانية' : 'Free Preview'}
                                                            />

                                                            {/* Media Upload */}
                                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderStyle: 'dashed' }}>
                                                                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                                                {isRTL ? '📁 رفع ملف الدرس' : '📁 Upload Lesson File'}
                                                                      </Typography>
                                                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                                                                {lessonForm.lesson_type === 'video' ? (isRTL ? 'يدعم ملفات الفيديو (MP4, WebM, etc.) حتى 500MB' : 'Supports Video files (MP4, WebM, etc.) up to 500MB') :
                                                                                          lessonForm.lesson_type === 'pdf' ? (isRTL ? 'يدعم ملفات PDF' : 'Supports PDF Files') : (isRTL ? 'لا يحتاج رفع ملف' : 'No file required')}
                                                                      </Typography>
                                                                      {lessonForm.lesson_type !== 'text' && (
                                                                                <>
                                                                                          <Button
                                                                                                    variant="contained"
                                                                                                    component="label"
                                                                                                    startIcon={<CloudUploadIcon />}
                                                                                                    disabled={uploadProgress}
                                                                                                    sx={{ borderRadius: 2 }}
                                                                                          >
                                                                                                    {uploadProgress ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'اختر ملف' : 'Choose File')}
                                                                                                    <input
                                                                                                              type="file"
                                                                                                              accept={lessonForm.lesson_type === 'video' ? 'video/*' : '.pdf'}
                                                                                                              hidden
                                                                                                              onChange={(e) => handleMediaUpload(e, 'lessons')}
                                                                                                    />
                                                                                          </Button>
                                                                                          {uploadProgress && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                                                                                </>
                                                                      )}
                                                                      {lessonForm.media_url && lessonForm.lesson_type === 'video' && (
                                                                                <Box sx={{
                                                                                          position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#000', borderRadius: 2, overflow: 'hidden', mt: 2,
                                                                                          '& .plyr': { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', '--plyr-color-main': theme.palette.primary.main }
                                                                                }}>
                                                                                          {lessonVideoSource && (
                                                                                                    <Plyr
                                                                                                              source={lessonVideoSource}
                                                                                                              options={lessonVideoOptions}
                                                                                                    />
                                                                                          )}
                                                                                </Box>
                                                                      )}
                                                                      {lessonForm.media_url && lessonForm.lesson_type !== 'video' && (
                                                                                <Alert severity="success" sx={{ mt: 1.5, borderRadius: 2 }}>
                                                                                          <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                                                                                    {isRTL ? '✅ تم رفع الملف بنجاح' : '✅ File uploaded successfully'}
                                                                                          </Typography>
                                                                                </Alert>
                                                                      )}
                                                            </Paper>
                                                  </Stack>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 3 }}>
                                                  <Button onClick={() => setLessonDialog(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                                                  <Button
                                                            variant="contained"
                                                            onClick={handleSaveLesson}
                                                            disabled={addLessonMutation.isPending || updateLesson.isPending}
                                                  >
                                                            {lessonDialog?.mode === 'add' ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'حفظ' : 'Save')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Container>
          );
};

// ==========================================
// Sub-components
// ==========================================

function SidebarInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
          return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {icon}
                                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={700} color="text.primary">{value || '—'}</Typography>
                    </Box>
          );
}

export default CourseBuilderPage;
