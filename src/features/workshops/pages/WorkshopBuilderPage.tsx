import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
          Box, Typography, Container, Button, CircularProgress, TextField, Stack,
          FormControl, InputLabel, Select, MenuItem,
          Accordion, AccordionSummary, AccordionDetails, IconButton, Chip,
          Dialog, DialogTitle, DialogContent, DialogActions,
          Grid, Card, CardContent, useTheme, alpha, Tabs, Tab, Menu,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import dayjs from 'dayjs';
import {
          useWorkshopDetail, useUpdateWorkshop,
          useWorkshopContent, useAddWorkshopContent, useUpdateWorkshopContent, useDeleteWorkshopContent,
          useUpdateWorkshopStatus,
} from '../hooks/useWorkshops';
import { useSpecializations } from '../../specializations/hooks/useSpecializations';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useUploads } from '../../../hooks/useUploads';
import { UserRole } from '../../../types';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import type { Trainer } from '../../../types';
import { useQuery } from '@tanstack/react-query';

// ==========================================
// Tab Panel
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

const WorkshopBuilderPage: React.FC = () => {
          const { id } = useParams<{ id: string }>();
          const navigate = useNavigate();
          const theme = useTheme();
          const { i18n } = useTranslation();
          const isRTL = i18n.language === 'ar';
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const { uploadWorkshopCover } = useUploads();

          // Data
          const { data: workshop, isLoading } = useWorkshopDetail(id!);
          const { data: specializations } = useSpecializations();
          const { data: contentItems = [], isLoading: contentLoading } = useWorkshopContent(id!);
          const updateWorkshop = useUpdateWorkshop();
          const updateStatus = useUpdateWorkshopStatus();
          const addContent = useAddWorkshopContent();
          const updateContent = useUpdateWorkshopContent();
          const deleteContent = useDeleteWorkshopContent();

          // Tab state
          const [activeTab, setActiveTab] = useState(0);

          // Workshop form
          const [workshopForm, setWorkshopForm] = useState<Record<string, any>>({});

          // Syllabus content dialog
          const [contentDialog, setContentDialog] = useState<{ mode: 'add' | 'edit'; contentId?: string } | null>(null);
          const [contentForm, setContentForm] = useState<Record<string, string | number>>({});

          // Content three-dot menu
          const [contentMenuAnchor, setContentMenuAnchor] = useState<null | HTMLElement>(null);
          const [contentMenuTarget, setContentMenuTarget] = useState<any>(null);

          // Cover image upload
          const [isDragging, setIsDragging] = useState(false);
          const [uploadProgress, setUploadProgress] = useState(false);

          // Trainers for the selected specialization
          const selectedSpecId = workshopForm.specialization_id as string;
          const { data: trainersData } = useQuery({
                    queryKey: ['trainers', 'approved', selectedSpecId],
                    queryFn: async () => {
                              const params = selectedSpecId ? { specialization_id: selectedSpecId, limit: 100 } : { limit: 100 };
                              const { data } = await api.get<{ data: Trainer[] }>(ENDPOINTS.TRAINERS.APPROVED, { params });
                              return data.data;
                    },
                    enabled: !!selectedSpecId
          });
          const trainers: Trainer[] = trainersData || [];

          // Initialize form when workshop loads
          useEffect(() => {
                    if (workshop) {
                              setWorkshopForm({
                                        title_ar: workshop.title_ar || '',
                                        title_en: workshop.title_en || '',
                                        description_ar: workshop.description_ar || '',
                                        description_en: workshop.description_en || '',
                                        price: workshop.price || 0,
                                        total_seats: workshop.total_seats || 30,
                                        duration_hours: workshop.duration_hours || 1,
                                        location_ar: workshop.location_ar || '',
                                        location_en: workshop.location_en || '',
                                        start_date: workshop.start_date ? dayjs(workshop.start_date).format('YYYY-MM-DD') : '',
                                        end_date: workshop.end_date ? dayjs(workshop.end_date).format('YYYY-MM-DD') : '',
                                        session_start_time: workshop.start_date ? dayjs(workshop.start_date).format('HH:mm') : '09:00',
                                        session_end_time: workshop.end_date ? dayjs(workshop.end_date).format('HH:mm') : '12:00',
                                        cover_image: workshop.cover_image || '',
                                        specialization_id: workshop.specialization_id || '',
                                        trainer_id: workshop.trainer_id || '',
                              });
                    }
          }, [workshop]);

          // Save workshop
          const handleSaveWorkshop = async () => {
                    if (!id) return;
                    const payload: Record<string, unknown> = { ...workshopForm };
                    // Combine date + time into timestamps
                    if (payload.start_date && payload.session_start_time) {
                              payload.start_date = `${payload.start_date}T${payload.session_start_time}:00`;
                    }
                    if (payload.end_date && payload.session_end_time) {
                              payload.end_date = `${payload.end_date}T${payload.session_end_time}:00`;
                    }
                    delete payload.session_start_time;
                    delete payload.session_end_time;
                    // Cast numeric fields
                    payload.price = Number(payload.price) || 0;
                    payload.total_seats = Number(payload.total_seats) || 30;
                    payload.duration_hours = Number(payload.duration_hours) || 1;

                    try {
                              await updateWorkshop.mutateAsync({ id, data: payload });
                    } catch { /* handled */ }
          };

          // Publish/Unpublish (change status)
          const handleTogglePublish = async () => {
                    if (!id || !workshop) return;
                    const newStatus = workshop.status === 'scheduled' ? 'draft' : 'scheduled';
                    try {
                              await updateStatus.mutateAsync({ id, status: newStatus });
                    } catch { /* handled */ }
          };

          // Cover image upload
          const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadProgress(true);
                    try {
                              const res = await uploadWorkshopCover.mutateAsync(file);
                              const url = res?.url || res;
                              setWorkshopForm(p => ({ ...p, cover_image: url }));
                    } catch { /* handled */ }
                    setUploadProgress(false);
          };

          const handleDeleteCoverImage = async () => {
                    const coverUrl = workshopForm.cover_image as string;
                    if (!coverUrl) return;
                    try {
                              const urlObj = new URL(coverUrl);
                              const filePath = urlObj.pathname.replace(/^\//, '');
                              await api.delete(ENDPOINTS.UPLOADS.DELETE, { data: { file_path: filePath } });
                    } catch { /* file may not exist */ }
                    setWorkshopForm(p => ({ ...p, cover_image: '' }));
                    if (id) {
                              try { await updateWorkshop.mutateAsync({ id, data: { ...workshopForm, cover_image: '' } }); } catch { /* handled */ }
                    }
          };

          // Drag and drop for cover
          const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
          const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
          const handleDrop = useCallback((e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                              handleCoverUpload({ target: { files: [file] } } as any);
                    }
          }, []);

          // Content (Syllabus) handlers
          const openAddContent = () => {
                    setContentForm({ title_ar: '', title_en: '', description_ar: '', description_en: '', content_order: contentItems.length + 1 });
                    setContentDialog({ mode: 'add' });
          };

          const openEditContent = (item: any) => {
                    setContentForm({
                              title_ar: item.title_ar || '',
                              title_en: item.title_en || '',
                              description_ar: item.description_ar || '',
                              description_en: item.description_en || '',
                              content_order: item.content_order || 0,
                    });
                    setContentDialog({ mode: 'edit', contentId: item.id });
          };

          const handleSaveContent = async () => {
                    if (!id || !contentDialog) return;
                    try {
                              if (contentDialog.mode === 'add') {
                                        await addContent.mutateAsync({ workshopId: id, data: contentForm });
                              } else if (contentDialog.contentId) {
                                        await updateContent.mutateAsync({ workshopId: id, contentId: contentDialog.contentId, data: contentForm });
                              }
                              setContentDialog(null);
                              setContentForm({});
                    } catch { /* handled */ }
          };

          const handleDeleteContent = async (contentId: string) => {
                    if (!id) return;
                    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المحتوى؟' : 'Delete this content item?')) return;
                    try {
                              await deleteContent.mutateAsync({ workshopId: id, contentId });
                    } catch { /* handled */ }
          };

          // Three-dot menu
          const handleContentMenuOpen = (event: React.MouseEvent<HTMLElement>, item: any) => {
                    event.stopPropagation();
                    setContentMenuAnchor(event.currentTarget);
                    setContentMenuTarget(item);
          };
          const handleContentMenuClose = () => {
                    setContentMenuAnchor(null);
                    setContentMenuTarget(null);
          };

          // Loading / Not found
          if (isLoading) {
                    return (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (!workshop) {
                    return (
                              <Container sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="h5">{isRTL ? 'الورشة غير موجودة' : 'Workshop not found'}</Typography>
                                        <Button onClick={() => navigate('/workshops')} sx={{ mt: 2 }}>{isRTL ? 'العودة' : 'Back'}</Button>
                              </Container>
                    );
          }

          const getSpecName = () => {
                    if (!workshop.specialization_id) return '';
                    const specs = (specializations as any)?.data || specializations || [];
                    const cat = specs.find((s: any) => s.id === workshop.specialization_id);
                    return cat ? (isRTL ? cat.name_ar : cat.name_en) : '';
          };

          const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

          return (
                    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
                              <Grid container spacing={4}>
                                        <Grid size={{ xs: 12 }}>
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
                                                                      <Tab iconPosition="start" icon={<InfoOutlinedIcon sx={{ mr: 1 }} />} label={isRTL ? 'معلومات الورشة' : 'Workshop Information'} />
                                                                      <Tab iconPosition="start" icon={<FormatListBulletedIcon sx={{ mr: 1 }} />} label={isRTL ? 'المنهج الدراسي' : 'Syllabus'} />
                                                                      <Tab iconPosition="start" icon={<BarChartIcon sx={{ mr: 1 }} />} label={isRTL ? 'ملخص الورشة' : 'Workshop Summary'} />
                                                            </Tabs>
                                                  </Box>

                                                  {/* ========== TAB 0: WORKSHOP INFORMATION ========== */}
                                                  <CustomTabPanel value={activeTab} index={0}>
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'معلومات الورشة' : 'Workshop Information'}
                                                                                </Typography>
                                                                                <Stack spacing={2.5}>
                                                                                          <TextField label={isRTL ? 'عنوان بالعربية' : 'Title in Arabic'} fullWidth required
                                                                                                    value={workshopForm.title_ar || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'عنوان بالإنجليزية' : 'Title in English'} fullWidth required
                                                                                                    value={workshopForm.title_en || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, title_en: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'وصف بالعربية' : 'Description in Arabic'} fullWidth multiline rows={4}
                                                                                                    value={workshopForm.description_ar || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, description_ar: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'وصف بالإنجليزية' : 'Description in English'} fullWidth multiline rows={4}
                                                                                                    value={workshopForm.description_en || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, description_en: e.target.value }))} />
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Category & Trainer */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'التصنيف والمدرب' : 'Category & Trainer'}
                                                                                </Typography>
                                                                                <Stack spacing={2.5}>
                                                                                          <FormControl fullWidth>
                                                                                                    <InputLabel>{isRTL ? 'التخصص' : 'Specialization'}</InputLabel>
                                                                                                    <Select
                                                                                                              value={workshopForm.specialization_id || ''}
                                                                                                              onChange={e => setWorkshopForm(p => ({ ...p, specialization_id: e.target.value }))}
                                                                                                              label={isRTL ? 'التخصص' : 'Specialization'}
                                                                                                    >
                                                                                                              {((specializations as any)?.data || specializations || []).map((s: any) => (
                                                                                                                        <MenuItem key={s.id} value={s.id}>{isRTL ? s.name_ar : s.name_en}</MenuItem>
                                                                                                              ))}
                                                                                                    </Select>
                                                                                          </FormControl>
                                                                                          {user?.role !== UserRole.TRAINER && (
                                                                                                    <FormControl fullWidth>
                                                                                                              <InputLabel>{isRTL ? 'المدرب' : 'Trainer'}</InputLabel>
                                                                                                              <Select
                                                                                                                        value={workshopForm.trainer_id || ''}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, trainer_id: e.target.value }))}
                                                                                                                        label={isRTL ? 'المدرب' : 'Trainer'}
                                                                                                              >
                                                                                                                        {trainers.map((t: any) => (
                                                                                                                                  <MenuItem key={t.id} value={t.id}>{t.full_name || t.user?.full_name}</MenuItem>
                                                                                                                        ))}
                                                                                                              </Select>
                                                                                                    </FormControl>
                                                                                          )}
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Logistics */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'اللوجستيات' : 'Logistics'}
                                                                                </Typography>
                                                                                <Stack spacing={2.5}>
                                                                                          <Grid container spacing={2}>
                                                                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                                                                              <TextField label={isRTL ? 'السعر' : 'Price'} type="number" fullWidth
                                                                                                                        value={workshopForm.price ?? 0}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, price: Number(e.target.value) }))} />
                                                                                                    </Grid>
                                                                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                                                                              <TextField label={isRTL ? 'عدد المقاعد' : 'Total Seats'} type="number" fullWidth
                                                                                                                        value={workshopForm.total_seats ?? 30}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, total_seats: parseInt(e.target.value) || 30 }))} />
                                                                                                    </Grid>
                                                                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                                                                              <TextField label={isRTL ? 'المدة (ساعات)' : 'Duration (Hours)'} type="number" fullWidth
                                                                                                                        value={workshopForm.duration_hours ?? 1}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, duration_hours: parseInt(e.target.value) || 1 }))} />
                                                                                                    </Grid>
                                                                                          </Grid>
                                                                                          <TextField label={isRTL ? 'الموقع بالعربية' : 'Location (Arabic)'} fullWidth
                                                                                                    value={workshopForm.location_ar || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, location_ar: e.target.value }))} />
                                                                                          <TextField label={isRTL ? 'الموقع بالإنجليزية' : 'Location (English)'} fullWidth
                                                                                                    value={workshopForm.location_en || ''}
                                                                                                    onChange={e => setWorkshopForm(p => ({ ...p, location_en: e.target.value }))} />
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Schedule */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'الجدول الزمني' : 'Schedule'}
                                                                                </Typography>
                                                                                <Stack spacing={2.5}>
                                                                                          <Grid container spacing={2}>
                                                                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                                                                              <TextField label={isRTL ? 'تاريخ البداية' : 'Start Date'} type="date" fullWidth
                                                                                                                        value={workshopForm.start_date || ''}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, start_date: e.target.value }))}
                                                                                                                        slotProps={{ inputLabel: { shrink: true } }} />
                                                                                                    </Grid>
                                                                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                                                                              <TextField label={isRTL ? 'تاريخ النهاية' : 'End Date'} type="date" fullWidth
                                                                                                                        value={workshopForm.end_date || ''}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, end_date: e.target.value }))}
                                                                                                                        slotProps={{ inputLabel: { shrink: true } }} />
                                                                                                    </Grid>
                                                                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                                                                              <TextField label={isRTL ? 'وقت بداية الجلسة' : 'Session Start Time'} type="time" fullWidth
                                                                                                                        value={workshopForm.session_start_time || '09:00'}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, session_start_time: e.target.value }))}
                                                                                                                        slotProps={{ inputLabel: { shrink: true } }} />
                                                                                                    </Grid>
                                                                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                                                                              <TextField label={isRTL ? 'وقت نهاية الجلسة' : 'Session End Time'} type="time" fullWidth
                                                                                                                        value={workshopForm.session_end_time || '12:00'}
                                                                                                                        onChange={e => setWorkshopForm(p => ({ ...p, session_end_time: e.target.value }))}
                                                                                                                        slotProps={{ inputLabel: { shrink: true } }} />
                                                                                                    </Grid>
                                                                                          </Grid>
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Cover Image */}
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                                                                                </Typography>
                                                                                {workshopForm.cover_image ? (
                                                                                          <Box sx={{ position: 'relative', mb: 2 }}>
                                                                                                    <Box
                                                                                                              component="img"
                                                                                                              src={workshopForm.cover_image}
                                                                                                              alt="Cover"
                                                                                                              sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 3 }}
                                                                                                    />
                                                                                                    <IconButton
                                                                                                              onClick={handleDeleteCoverImage}
                                                                                                              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
                                                                                                    >
                                                                                                              <DeleteIcon />
                                                                                                    </IconButton>
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
                                                                                                    }}
                                                                                          >
                                                                                                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                                                              {isRTL ? 'اسحب وأفلت صورة الغلاف هنا' : 'Drag & drop cover image here'}
                                                                                                    </Typography>
                                                                                                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} disabled={uploadProgress}
                                                                                                              sx={{ mt: 1, borderRadius: 2 }}>
                                                                                                              {uploadProgress ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'اختر صورة' : 'Choose Image')}
                                                                                                              <input type="file" accept="image/*" hidden onChange={handleCoverUpload} />
                                                                                                    </Button>
                                                                                          </Box>
                                                                                )}
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Quick Save Button */}
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                      <Button
                                                                                variant="contained"
                                                                                startIcon={<SaveIcon />}
                                                                                onClick={handleSaveWorkshop}
                                                                                disabled={updateWorkshop.isPending}
                                                                                sx={{ borderRadius: '12px', py: 1.5, px: 4, fontWeight: 700, fontSize: '1rem', boxShadow: 'none' }}
                                                                      >
                                                                                {updateWorkshop.isPending ? <CircularProgress size={20} /> : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                                                                      </Button>
                                                            </Box>
                                                  </CustomTabPanel>

                                                  {/* ========== TAB 1: SYLLABUS ========== */}
                                                  <CustomTabPanel value={activeTab} index={1}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                                      <Typography variant="h6" fontWeight={700}>
                                                                                {isRTL ? 'المنهج الدراسي' : 'Syllabus'}
                                                                      </Typography>
                                                                      <Button
                                                                                variant="contained"
                                                                                startIcon={<AddIcon />}
                                                                                onClick={openAddContent}
                                                                                sx={{ borderRadius: '12px', fontWeight: 700, boxShadow: 'none' }}
                                                                      >
                                                                                {isRTL ? 'إضافة محتوى' : 'Add Content'}
                                                                      </Button>
                                                            </Box>

                                                            {contentLoading ? (
                                                                      <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                                                            ) : contentItems.length === 0 ? (
                                                                      <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', p: 4, textAlign: 'center' }}>
                                                                                <FormatListBulletedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                                                <Typography color="text.secondary" fontWeight={600}>
                                                                                          {isRTL ? 'لا يوجد محتوى بعد. أضف محتوى المنهج الدراسي.' : 'No content yet. Add syllabus content items.'}
                                                                                </Typography>
                                                                      </Card>
                                                            ) : (
                                                                      contentItems.map((item: any, idx: number) => (
                                                                                <Accordion
                                                                                          key={item.id}
                                                                                          sx={{
                                                                                                    borderRadius: '12px !important',
                                                                                                    border: `1px solid ${theme.palette.divider}`,
                                                                                                    boxShadow: 'none',
                                                                                                    mb: 2,
                                                                                                    '&:before': { display: 'none' },
                                                                                                    overflow: 'hidden',
                                                                                          }}
                                                                                >
                                                                                          <AccordionSummary
                                                                                                    expandIcon={<ExpandMoreIcon />}
                                                                                                    sx={{
                                                                                                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                                                                              '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5 },
                                                                                                    }}
                                                                                          >
                                                                                                    <Chip label={`${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 28 }} />
                                                                                                    <Typography fontWeight={700} sx={{ flex: 1, fontSize: '1rem' }}>
                                                                                                              {getField(item.title_ar, item.title_en)}
                                                                                                    </Typography>
                                                                                                    <IconButton size="small" onClick={(e) => handleContentMenuOpen(e, item)}>
                                                                                                              <MoreVertIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </AccordionSummary>
                                                                                          <AccordionDetails sx={{ p: 3 }}>
                                                                                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                                                                                              {getField(item.description_ar, item.description_en) || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                                                                    </Typography>
                                                                                          </AccordionDetails>
                                                                                </Accordion>
                                                                      ))
                                                            )}
                                                  </CustomTabPanel>

                                                  {/* ========== TAB 2: WORKSHOP SUMMARY ========== */}
                                                  <CustomTabPanel value={activeTab} index={2}>
                                                            <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'معلومات الورشة' : 'Workshop Information'}
                                                                                </Typography>
                                                                                <Stack spacing={1.5}>
                                                                                          <SummaryRow icon={<InfoOutlinedIcon />} label={isRTL ? 'العنوان' : 'Title'} value={getField(workshop.title_ar, workshop.title_en)} />
                                                                                          <SummaryRow icon={<CalendarMonthIcon />} label={isRTL ? 'تاريخ البداية' : 'Start Date'} value={workshop.start_date ? dayjs(workshop.start_date).format('YYYY-MM-DD HH:mm') : '—'} />
                                                                                          <SummaryRow icon={<CalendarMonthIcon />} label={isRTL ? 'تاريخ النهاية' : 'End Date'} value={workshop.end_date ? dayjs(workshop.end_date).format('YYYY-MM-DD HH:mm') : '—'} />
                                                                                          <SummaryRow icon={<AccessTimeIcon />} label={isRTL ? 'المدة' : 'Duration'} value={`${workshop.duration_hours || 0} ${isRTL ? 'ساعة' : 'hrs'}`} />
                                                                                          <SummaryRow icon={<PeopleIcon />} label={isRTL ? 'المقاعد' : 'Seats'} value={`${workshop.total_seats}`} />
                                                                                          <SummaryRow icon={<AttachMoneyIcon />} label={isRTL ? 'السعر' : 'Price'} value={Number(workshop.price) === 0 ? (isRTL ? 'مجاني' : 'Free') : `${workshop.price} SAR`} />
                                                                                          <SummaryRow icon={<LocationOnIcon />} label={isRTL ? 'الموقع' : 'Location'} value={getField(workshop.location_ar, workshop.location_en)} />
                                                                                          <SummaryRow icon={<FormatListBulletedIcon />} label={isRTL ? 'التخصص' : 'Specialization'} value={getSpecName()} />
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Syllabus Preview */}
                                                            {contentItems.length > 0 && (
                                                                      <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                                                                <CardContent sx={{ p: 3 }}>
                                                                                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                                    {isRTL ? 'المنهج الدراسي' : 'Syllabus'}
                                                                                          </Typography>
                                                                                          {contentItems.map((item: any, idx: number) => (
                                                                                                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                                                                                                              <Chip label={`${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 28 }} />
                                                                                                              <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>
                                                                                                                        {getField(item.title_ar, item.title_en)}
                                                                                                              </Typography>
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
                                                                                                    label={workshop.status === 'scheduled' ? (isRTL ? '✅ مجدولة' : '✅ Scheduled') : (isRTL ? '📝 مسودة' : '📝 Draft')}
                                                                                                    color={workshop.status === 'scheduled' ? 'success' : 'warning'}
                                                                                                    sx={{ fontWeight: 700, fontSize: '0.85rem', py: 2, px: 0.5, borderRadius: 2 }}
                                                                                          />
                                                                                </Box>
                                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                                                          {isRTL ? 'راجع جميع المعلومات أعلاه ثم اضغط حفظ لحفظ التغييرات أو نشر لإتاحة الورشة.' : 'Review all the information above, then click Save to save changes or Schedule to make the workshop available.'}
                                                                                </Typography>
                                                                                <Stack direction="row" spacing={2}>
                                                                                          <Button
                                                                                                    variant="contained"
                                                                                                    startIcon={<SaveIcon />}
                                                                                                    onClick={handleSaveWorkshop}
                                                                                                    disabled={updateWorkshop.isPending}
                                                                                                    sx={{ borderRadius: '12px', py: 1.5, px: 4, fontWeight: 700, fontSize: '1rem', boxShadow: 'none' }}
                                                                                          >
                                                                                                    {updateWorkshop.isPending ? <CircularProgress size={20} /> : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                                                                                          </Button>
                                                                                          <Button
                                                                                                    variant={workshop.status === 'scheduled' ? 'outlined' : 'contained'}
                                                                                                    startIcon={<PublishIcon />}
                                                                                                    onClick={handleTogglePublish}
                                                                                                    disabled={updateStatus.isPending}
                                                                                                    sx={{
                                                                                                              borderRadius: '12px', py: 1.5, px: 4, fontWeight: 700, fontSize: '1rem',
                                                                                                              ...(workshop.status === 'scheduled' ? { borderWidth: 2 } : { bgcolor: theme.palette.success.main, '&:hover': { bgcolor: theme.palette.success.dark }, boxShadow: 'none' })
                                                                                                    }}
                                                                                          >
                                                                                                    {workshop.status === 'scheduled' ? (isRTL ? 'إلغاء الجدولة' : 'Unschedule') : (isRTL ? 'جدولة الورشة' : 'Schedule Workshop')}
                                                                                          </Button>
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>
                                                  </CustomTabPanel>
                                        </Grid>
                              </Grid>

                              {/* ======================== CONTENT THREE-DOT MENU ======================== */}
                              <Menu
                                        anchorEl={contentMenuAnchor}
                                        open={Boolean(contentMenuAnchor)}
                                        onClose={handleContentMenuClose}
                                        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
                              >
                                        <MenuItem onClick={() => {
                                                  if (contentMenuTarget) openEditContent(contentMenuTarget);
                                                  handleContentMenuClose();
                                        }}>
                                                  <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'تعديل' : 'Edit'}
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                                  if (contentMenuTarget) handleDeleteContent(contentMenuTarget.id);
                                                  handleContentMenuClose();
                                        }} sx={{ color: 'error.main' }}>
                                                  <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                  {isRTL ? 'حذف' : 'Delete'}
                                        </MenuItem>
                              </Menu>

                              {/* ======================== CONTENT DIALOG ======================== */}
                              <Dialog open={!!contentDialog} onClose={() => setContentDialog(null)} maxWidth="sm" fullWidth>
                                        <DialogTitle fontWeight={700}>
                                                  {contentDialog?.mode === 'add' ? (isRTL ? '➕ إضافة محتوى' : '➕ Add Content') : (isRTL ? '✏️ تعديل المحتوى' : '✏️ Edit Content')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <TextField label={isRTL ? 'العنوان بالعربية' : 'Title (Arabic)'} fullWidth required
                                                                      value={contentForm.title_ar || ''}
                                                                      onChange={e => setContentForm(p => ({ ...p, title_ar: e.target.value }))} />
                                                            <TextField label={isRTL ? 'العنوان بالإنجليزية' : 'Title (English)'} fullWidth required
                                                                      value={contentForm.title_en || ''}
                                                                      onChange={e => setContentForm(p => ({ ...p, title_en: e.target.value }))} />
                                                            <TextField label={isRTL ? 'الوصف بالعربية' : 'Description (Arabic)'} fullWidth multiline rows={3}
                                                                      value={contentForm.description_ar || ''}
                                                                      onChange={e => setContentForm(p => ({ ...p, description_ar: e.target.value }))} />
                                                            <TextField label={isRTL ? 'الوصف بالإنجليزية' : 'Description (English)'} fullWidth multiline rows={3}
                                                                      value={contentForm.description_en || ''}
                                                                      onChange={e => setContentForm(p => ({ ...p, description_en: e.target.value }))} />
                                                            <TextField label={isRTL ? 'الترتيب' : 'Order'} type="number" fullWidth
                                                                      value={contentForm.content_order ?? 0}
                                                                      onChange={e => setContentForm(p => ({ ...p, content_order: parseInt(e.target.value) || 0 }))} />
                                                  </Stack>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 3 }}>
                                                  <Button onClick={() => setContentDialog(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                                                  <Button
                                                            variant="contained"
                                                            onClick={handleSaveContent}
                                                            disabled={addContent.isPending || updateContent.isPending}
                                                  >
                                                            {contentDialog?.mode === 'add' ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'حفظ' : 'Save')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Container>
          );
};

// ==========================================
// Sub-components
// ==========================================

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

export default WorkshopBuilderPage;
