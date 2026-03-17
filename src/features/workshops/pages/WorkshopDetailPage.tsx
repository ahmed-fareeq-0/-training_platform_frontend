import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Grid, Card, CardContent, Button,
          Divider, Skeleton, useTheme, alpha, Avatar, Stack,
          TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
          Tabs, Tab, Container,
          Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import {
          AccessTime as AccessTimeIcon, People, LocationOn,
          EventSeat, CheckCircle, CloudUpload as CloudUploadIcon, ShoppingCart as ShoppingCartIcon,
          Description as DescriptionIcon, School as SchoolIcon, OndemandVideo as OndemandVideoIcon,
          WorkspacePremium as WorkspacePremiumIcon,
          Lock as LockIcon,
          FormatListBulleted as FormatListBulletedIcon, ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import toast from 'react-hot-toast';

import dayjs from 'dayjs';

import { useWorkshopDetail, useWorkshopAvailability, useUpdateWorkshopStatus, useWorkshopSyllabus } from '../hooks/useWorkshops';
import { useCreateBooking, useCanBook } from '../../bookings/hooks/useBookings';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { UserRole, RequirementType } from '../../../types';
import { getImageUrl } from '../../../utils/imageUtils';
import DailyAttendanceManager from '../components/attendance/DailyAttendanceManager';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import { useTrainingRequirements, useSubmitRequirement } from '../../requirements/hooks/useRequirements';
import { useUploads } from '../../../hooks/useUploads';

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
                              id={`workshop-tabpanel-${index}`}
                              aria-labelledby={`workshop-tab-${index}`}
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

export default function WorkshopDetailPage() {
          const { id } = useParams<{ id: string }>();
          const theme = useTheme();
          const navigate = useNavigate();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { user } = useAuthStore();

          const { data: workshop, isLoading, error } = useWorkshopDetail(id!);
          const { data: availability } = useWorkshopAvailability(id!);
          const { data: canBookData } = useCanBook(id!, { enabled: !!user });
          const { data: syllabusItems = [] } = useWorkshopSyllabus(id!);
          const createBooking = useCreateBooking();
          const updateStatus = useUpdateWorkshopStatus();

          const [bookingOpen, setBookingOpen] = useState(false);
          const [activeTab, setActiveTab] = useState(0);

          const { data: requirements = [] } = useTrainingRequirements('workshop', id || '');
          const submitReqMutation = useSubmitRequirement();
          const { uploadDocuments } = useUploads();

          const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});
          const [requirementNotes, setRequirementNotes] = useState<Record<string, string>>({});

          const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');
          const isAdminOrManager = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;

          const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
                    setActiveTab(newValue);
          };

          const handleStatusChange = async (newStatus: string) => {
                    if (!id) return;
                    try {
                              await updateStatus.mutateAsync({ id, status: newStatus });
                    } catch {
                              // error handled
                    }
          };

          const hasRequirements = requirements.length > 0;
          const needsApproval = workshop?.requires_approval || hasRequirements;

          const handleBook = async () => {
                    if (!id) return;

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
                              const booking: any = await createBooking.mutateAsync(id);

                              const bookingId = booking.id || booking.data?.id;

                              if (hasRequirements && bookingId) {
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
                                                  type: 'workshop',
                                                  enrollmentId: bookingId,
                                                  data: {
                                                            training_type: 'workshop',
                                                            training_id: id,
                                                            submissions,
                                                  }
                                        });

                                        toast.success(locale === 'ar' ? 'تم تقديم المستندات، الحجز قيد المراجعة' : 'Documents submitted. Booking pending review.');
                              }

                              setBookingOpen(false);
                              navigate('/bookings');
                    } catch {
                              // error handled by axios interceptor
                    }
          };

          if (isLoading) {
                    return (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <Skeleton variant="rectangular" width="80%" height={300} sx={{ borderRadius: 4 }} />
                              </Box>
                    );
          }

          if (error) {
                    return (
                              <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
                                        <Typography variant="h5" color="error" gutterBottom fontWeight={600}>
                                                  {locale === 'ar' ? 'حدث خطأ أثناء تحميل تفاصيل الورشة' : 'Error loading workshop details'}
                                        </Typography>
                                        <Button sx={{ mt: 3 }} variant="outlined" size="large" onClick={() => navigate('/workshops')}>
                                                  {t('common.back')}
                                        </Button>
                              </Box>
                    );
          }

          if (!workshop) {
                    return (
                              <Container sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="h5">{t('common.noData')}</Typography>
                                        <Button sx={{ mt: 2 }} onClick={() => navigate('/workshops')}>{t('common.back')}</Button>
                              </Container>
                    );
          }

          const seatsUsed = workshop.total_seats - (availability?.available_seats ?? workshop.total_seats);
          const occupancyPercent = Math.round((seatsUsed / workshop.total_seats) * 100);
          const canBook = user?.role === UserRole.TRAINEE && canBookData?.can_book;

          const title = getField(workshop.title_ar, workshop.title_en);
          const description = getField(workshop.description_ar, workshop.description_en);

          return (
                    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
                              <Grid container spacing={4}>
                                        {/* Main Content */}
                                        <Grid size={{ xs: 12, md: 8 }}>
                                                  {/* Hero Image Block */}
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
                                                            <Box sx={{
                                                                      width: '100%',
                                                                      height: '100%',
                                                                      backgroundImage: workshop.cover_image ? `url(${getImageUrl(workshop.cover_image)})` : undefined,
                                                                      bgcolor: workshop.cover_image ? undefined : 'grey.900',
                                                                      backgroundSize: 'cover',
                                                                      backgroundPosition: 'center',
                                                                      display: 'flex',
                                                                      alignItems: 'center',
                                                                      justifyContent: 'center'
                                                            }}>
                                                                      {!workshop.cover_image && (
                                                                                <Box sx={{
                                                                                          width: 80, height: 80, borderRadius: '50%',
                                                                                          bgcolor: 'rgba(0,0,0,0.6)',
                                                                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                          backdropFilter: 'blur(4px)',
                                                                                          border: '2px solid rgba(255,255,255,0.2)'
                                                                                }}>
                                                                                          <OndemandVideoIcon sx={{ fontSize: 40, color: 'white' }} />
                                                                                </Box>
                                                                      )}
                                                            </Box>
                                                  </Box>

                                                  {/* Workshop Title */}
                                                  <Box sx={{ mb: 3, mt: 3 }}>
                                                            <Typography variant="h4" fontWeight={800} gutterBottom>
                                                                      {title}
                                                            </Typography>
                                                            {workshop.description_en && locale === 'ar' && (
                                                                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                                                {workshop.title_en}
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
                                                                      <Tab iconPosition="start" icon={<FormatListBulletedIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'المنهج الدراسي' : 'Syllabus'} />
                                                                      <Tab iconPosition="start" icon={<CalendarMonthIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'الجدول والحضور' : 'Schedule & Attendance'} />
                                                                      <Tab iconPosition="start" icon={<SchoolIcon sx={{ mr: 1 }} />} label={locale === 'ar' ? 'المدرّب' : 'Instructor'} />
                                                            </Tabs>
                                                  </Box>

                                                  {/* ----------- TAB 0: DESCRIPTION & SEATS ----------- */}
                                                  <CustomTabPanel value={activeTab} index={0}>
                                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                      {locale === 'ar' ? 'عن هذه الورشة' : 'About this workshop'}
                                                            </Typography>
                                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem', mb: 4 }}>
                                                                      {description || (locale === 'ar' ? 'لا يوجد وصف متوفر في الوقت الحالي.' : 'No description available at this time.')}
                                                            </Typography>

                                                            {/* Seat Grid */}
                                                            <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                                                          <Typography variant="h6" fontWeight={700}>
                                                                                                    <EventSeat sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                                                                                                    {locale === 'ar' ? 'خريطة المقاعد' : 'Seat Map'}
                                                                                          </Typography>
                                                                                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                                                                    {seatsUsed}/{workshop.total_seats} ({occupancyPercent}%)
                                                                                          </Typography>
                                                                                </Box>
                                                                                <SeatGrid
                                                                                          totalSeats={workshop.total_seats}
                                                                                          usedSeats={seatsUsed}
                                                                                          theme={theme}
                                                                                />
                                                                                <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'success.main' }} />
                                                                                                    <Typography variant="caption" fontWeight={600}>{locale === 'ar' ? 'متاح' : 'Available'}</Typography>
                                                                                          </Box>
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'warning.main' }} />
                                                                                                    <Typography variant="caption" fontWeight={600}>{locale === 'ar' ? 'محجوز' : 'Booked'}</Typography>
                                                                                          </Box>
                                                                                </Box>
                                                                      </CardContent>
                                                            </Card>
                                                  </CustomTabPanel>

                                                  {/* ----------- TAB 1: SYLLABUS ----------- */}
                                                  <CustomTabPanel value={activeTab} index={1}>
                                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                      {locale === 'ar' ? 'المنهج الدراسي' : 'Syllabus'}
                                                            </Typography>
                                                            {syllabusItems.length === 0 ? (
                                                                      <Typography variant="body1" color="text.secondary">
                                                                                {locale === 'ar' ? 'لا يوجد محتوى منهج دراسي بعد.' : 'No syllabus content available yet.'}
                                                                      </Typography>
                                                            ) : (
                                                                      syllabusItems.map((section: any, idx: number) => (
                                                                                <Accordion
                                                                                          key={section.id}
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
                                                                                                    <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>
                                                                                                              {getField(section.title_ar, section.title_en)}
                                                                                                    </Typography>
                                                                                          </AccordionSummary>
                                                                                          <AccordionDetails sx={{ p: 3 }}>
                                                                                                    {(section.description_ar || section.description_en) && (
                                                                                                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 2 }}>
                                                                                                                        {getField(section.description_ar, section.description_en)}
                                                                                                              </Typography>
                                                                                                    )}
                                                                                                    {section.lessons && section.lessons.length > 0 ? (
                                                                                                              <Stack spacing={1.5} sx={{ mt: 1 }}>
                                                                                                                        {section.lessons.map((lesson: any, lIdx: number) => (
                                                                                                                                  <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                                                                                                            <Box sx={{
                                                                                                                                                      width: 24, height: 24, borderRadius: '50%',
                                                                                                                                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                                                                                      color: theme.palette.primary.main,
                                                                                                                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                                                                                      fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, mt: 0.3
                                                                                                                                            }}>
                                                                                                                                                      {lIdx + 1}
                                                                                                                                            </Box>
                                                                                                                                            <Box>
                                                                                                                                                      <Typography variant="body2" fontWeight={600} color="text.primary">
                                                                                                                                                                {getField(lesson.title_ar, lesson.title_en)}
                                                                                                                                                      </Typography>
                                                                                                                                                      {(lesson.description_ar || lesson.description_en) && (
                                                                                                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                                                                                                                          {getField(lesson.description_ar, lesson.description_en)}
                                                                                                                                                                </Typography>
                                                                                                                                                      )}
                                                                                                                                            </Box>
                                                                                                                                  </Box>
                                                                                                                        ))}
                                                                                                              </Stack>
                                                                                                    ) : (
                                                                                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                                                                        {locale === 'ar' ? 'لا توجد مواضيع في هذا القسم.' : 'No topics in this section.'}
                                                                                                              </Typography>
                                                                                                    )}
                                                                                          </AccordionDetails>
                                                                                </Accordion>
                                                                      ))
                                                            )}
                                                  </CustomTabPanel>

                                                  {/* ----------- TAB 2: SCHEDULE & ATTENDANCE ----------- */}
                                                  <CustomTabPanel value={activeTab} index={2}>
                                                            <Stack spacing={4}>
                                                                      {user?.role === UserRole.TRAINEE && (
                                                                                <AttendanceCalendar workshopId={id!} />
                                                                      )}

                                                                      {(isAdminOrManager || workshop.trainer_user_id === user?.id) && (
                                                                                <DailyAttendanceManager workshopId={id!} />
                                                                      )}

                                                                      {user?.role !== UserRole.TRAINEE && !isAdminOrManager && workshop.trainer_user_id !== user?.id && (
                                                                                <Alert severity="info" sx={{ borderRadius: 3 }}>
                                                                                          {locale === 'ar' ? 'سجل حضور الورشة غير متاح لحسابك.' : 'Attendance records are not available for your account.'}
                                                                                </Alert>
                                                                      )}
                                                            </Stack>
                                                  </CustomTabPanel>

                                                  {/* ----------- TAB 3: INSTRUCTOR ----------- */}
                                                  <CustomTabPanel value={activeTab} index={3}>
                                                            {workshop.trainer_name ? (() => {
                                                                      const isAr = locale === 'ar';
                                                                      const isUniversityProf = workshop.trainer_type === 'university_professor';
                                                                      const bio = isAr ? workshop.trainer_bio_ar : (workshop.trainer_bio_en || workshop.trainer_bio_ar);
                                                                      const expYears = workshop.trainer_experience_years;

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

                                                                      const InfoRowField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
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
                                                                                                                                  src={workshop.trainer_avatar ? getImageUrl(workshop.trainer_avatar) : undefined}
                                                                                                                                  sx={{
                                                                                                                                            width: 96, height: 96,
                                                                                                                                            bgcolor: theme.palette.primary.main,
                                                                                                                                            fontSize: '2.5rem', fontWeight: 700,
                                                                                                                                            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                                                                                                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                                                                                                                  }}
                                                                                                                        >
                                                                                                                                  {workshop.trainer_name.charAt(0)}
                                                                                                                        </Avatar>
                                                                                                                        <Box sx={{ flex: 1 }}>
                                                                                                                                  <Typography variant="h5" fontWeight={700}>
                                                                                                                                            {workshop.trainer_name}
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
                                                                                                                                                                : (workshop.job_title || (isAr ? 'مدرب احترافي' : 'Professional Trainer'))}
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
                                                                                                                        {isUniversityProf && (
                                                                                                                                  <>
                                                                                                                                            {workshop.academic_degree && (
                                                                                                                                                      <InfoRowField
                                                                                                                                                                icon={<SchoolIcon fontSize="small" />}
                                                                                                                                                                label={isAr ? 'الدرجة العلمية' : 'Academic Degree'}
                                                                                                                                                                value={academicDegreeLabels[workshop.academic_degree] || workshop.academic_degree}
                                                                                                                                                      />
                                                                                                                                            )}
                                                                                                                                            {workshop.academic_specialization && (
                                                                                                                                                      <InfoRowField
                                                                                                                                                                icon={<WorkspacePremiumIcon fontSize="small" />}
                                                                                                                                                                label={isAr ? 'التخصص الأكاديمي' : 'Academic Specialization'}
                                                                                                                                                                value={workshop.academic_specialization}
                                                                                                                                                      />
                                                                                                                                            )}
                                                                                                                                            {workshop.academic_title && (
                                                                                                                                                      <InfoRowField
                                                                                                                                                                icon={<DescriptionIcon fontSize="small" />}
                                                                                                                                                                label={isAr ? 'اللقب الأكاديمي' : 'Academic Title'}
                                                                                                                                                                value={academicTitleLabels[workshop.academic_title] || workshop.academic_title}
                                                                                                                                                      />
                                                                                                                                            )}
                                                                                                                                  </>
                                                                                                                        )}

                                                                                                                        {!isUniversityProf && (
                                                                                                                                  <>
                                                                                                                                            {workshop.job_title && (
                                                                                                                                                      <InfoRowField
                                                                                                                                                                icon={<DescriptionIcon fontSize="small" />}
                                                                                                                                                                label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
                                                                                                                                                                value={workshop.job_title}
                                                                                                                                                      />
                                                                                                                                            )}
                                                                                                                                  </>
                                                                                                                        )}

                                                                                                                        {expYears != null && expYears > 0 && (
                                                                                                                                  <InfoRowField
                                                                                                                                            icon={<AccessTimeIcon fontSize="small" />}
                                                                                                                                            label={isAr ? 'سنوات الخبرة' : 'Years of Experience'}
                                                                                                                                            value={isAr ? `${expYears} سنوات` : `${expYears} years`}
                                                                                                                                  />
                                                                                                                        )}

                                                                                                                        {workshop.trainer_qualifications && (
                                                                                                                                  <InfoRowField
                                                                                                                                            icon={<CheckCircle fontSize="small" />}
                                                                                                                                            label={isAr ? 'المؤهلات' : 'Qualifications'}
                                                                                                                                            value={workshop.trainer_qualifications}
                                                                                                                                  />
                                                                                                                        )}
                                                                                                              </Stack>
                                                                                                    </CardContent>
                                                                                          </Card>

                                                                                          {/* Core Skills Card */}
                                                                                          {!isUniversityProf && workshop.core_skills && (
                                                                                                    <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                                                              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                                                                                        <Typography variant="h6" fontWeight={700} gutterBottom>
                                                                                                                                  {isAr ? '🛠️ المهارات الأساسية' : '🛠️ Core Skills'}
                                                                                                                        </Typography>
                                                                                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                                                                                                                                  {workshop.core_skills.split(',').map((skill: string, i: number) => (
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

                                        {/* Sidebar Content (Right side) */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                                  <Stack spacing={3}>
                                                            {/* Sidebar Card 1: Registration / CTA */}
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
                                                                                                    {locale === 'ar' ? 'احجز مقعدك الآن واحصل على وصول كامل للورشة وموادها.' : 'Book your seat now and get full access to the workshop and its materials.'}
                                                                                          </Typography>

                                                                                          {canBook ? (
                                                                                                    <Button
                                                                                                              variant="contained"
                                                                                                              fullWidth
                                                                                                              size="large"
                                                                                                              onClick={hasRequirements ? () => setBookingOpen(true) : handleBook}
                                                                                                              disabled={createBooking.isPending || availability?.is_full}
                                                                                                              sx={{ py: 1.8, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', px: 3 }}
                                                                                                    >
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                                        <ShoppingCartIcon sx={{ fontSize: 22 }} />
                                                                                                                        <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                                                                                                                  {createBooking.isPending
                                                                                                                                            ? t('common.loading')
                                                                                                                                            : availability?.is_full
                                                                                                                                                      ? (locale === 'ar' ? 'الورشة ممتلئة' : 'Workshop Full')
                                                                                                                                                      : needsApproval
                                                                                                                                                                ? (locale === 'ar' ? 'طلب حجز مقعد' : 'Request Booking')
                                                                                                                                                                : t('booking.createBooking')}
                                                                                                                        </span>
                                                                                                              </Box>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 2, height: 24, alignSelf: 'center' }} />
                                                                                                                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                                                                                                                                  {Number(workshop.price) > 0 ? `${Number(workshop.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
                                                                                                                        </Typography>
                                                                                                              </Box>
                                                                                                    </Button>
                                                                                          ) : user?.role === UserRole.TRAINEE ? (
                                                                                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ p: 2, bgcolor: alpha(theme.palette.action.disabledBackground, 0.5), borderRadius: 2 }}>
                                                                                                              {canBookData?.reason || (locale === 'ar' ? 'غير متاح للحجز حالياً' : 'Not available for booking')}
                                                                                                    </Typography>
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
                                                                                                                                  {locale === 'ar' ? 'تسجيل دخول للحجز' : 'Login to Book'}
                                                                                                                        </span>
                                                                                                              </Box>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 2, height: 24, alignSelf: 'center' }} />
                                                                                                                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                                                                                                                                  {Number(workshop.price) > 0 ? `${Number(workshop.price).toLocaleString()} IQD` : (locale === 'ar' ? 'مجاني' : 'Free')}
                                                                                                                        </Typography>
                                                                                                              </Box>
                                                                                                    </Button>
                                                                                          )}
                                                                                </CardContent>
                                                                      </Card>
                                                            )}

                                                            {/* Sidebar Card 2: Workshop Details */}
                                                            <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {locale === 'ar' ? 'تفاصيل الورشة' : 'Workshop Details'}
                                                                                </Typography>

                                                                                <Stack spacing={2}>
                                                                                          <SidebarInfoRow icon={<CalendarMonthIcon fontSize="small" />} label={t('workshop.startDate')} value={dayjs(workshop.start_date).format('DD MMM YYYY')} />
                                                                                          <SidebarInfoRow icon={<CalendarMonthIcon fontSize="small" />} label={t('workshop.endDate')} value={dayjs(workshop.end_date).format('DD MMM YYYY')} />
                                                                                          <SidebarInfoRow icon={<AccessTimeIcon fontSize="small" />} label={locale === 'ar' ? 'وقت البدء' : 'Start Time'} value={workshop.session_start_time?.substring(0, 5) || '—'} />
                                                                                          <SidebarInfoRow icon={<AccessTimeIcon fontSize="small" />} label={locale === 'ar' ? 'وقت الانتهاء' : 'End Time'} value={workshop.session_end_time?.substring(0, 5) || '—'} />
                                                                                          <SidebarInfoRow icon={<AccessTimeIcon fontSize="small" />} label={t('workshop.duration')} value={`${workshop.duration_hours} ${t('workshop.hours')}`} />
                                                                                          <SidebarInfoRow icon={<People fontSize="small" />} label={t('booking.seatsAvailable')} value={`${availability?.available_seats ?? '—'} / ${workshop.total_seats}`} />
                                                                                          <SidebarInfoRow icon={<LocationOn fontSize="small" />} label={t('workshop.location')} value={getField(workshop.location_ar, workshop.location_en)} />
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Admin/Manager Actions Card */}
                                                            {isAdminOrManager && (
                                                                      <Card sx={{ borderRadius: '24px', border: `2px solid ${alpha(theme.palette.warning.main, 0.4)}`, boxShadow: 'none' }}>
                                                                                <CardContent sx={{ p: 3 }}>
                                                                                          <Typography variant="subtitle2" color="warning.main" gutterBottom fontWeight={800}>
                                                                                                    {locale === 'ar' ? 'إدارة الورشة (للمشرفين)' : 'Manage Workshop (Admins)'}
                                                                                          </Typography>
                                                                                          <TextField
                                                                                                    select
                                                                                                    fullWidth
                                                                                                    size="small"
                                                                                                    label={locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                                                                                                    value={workshop.status}
                                                                                                    onChange={(e) => handleStatusChange(e.target.value)}
                                                                                                    disabled={updateStatus.isPending}
                                                                                                    sx={{ mt: 2 }}
                                                                                          >
                                                                                                    <MenuItem value="scheduled">{locale === 'ar' ? 'مجدولة' : 'Scheduled'}</MenuItem>
                                                                                                    <MenuItem value="ongoing">{locale === 'ar' ? 'جارية' : 'Ongoing'}</MenuItem>
                                                                                                    <MenuItem value="completed">{locale === 'ar' ? 'مكتملة' : 'Completed'}</MenuItem>
                                                                                                    <MenuItem value="cancelled">{locale === 'ar' ? 'ملغاة' : 'Cancelled'}</MenuItem>
                                                                                          </TextField>
                                                                                </CardContent>
                                                                      </Card>
                                                            )}
                                                  </Stack>
                                        </Grid>
                              </Grid>

                              {/* Booking/Requirements Dialog */}
                              <Dialog
                                        open={bookingOpen}
                                        onClose={() => !createBooking.isPending && setBookingOpen(false)}
                                        maxWidth="sm"
                                        fullWidth
                                        PaperProps={{ sx: { borderRadius: 3 } }}
                              >
                                        <DialogTitle sx={{ fontWeight: 800, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                                                  {locale === 'ar' ? 'متطلبات الحجز' : 'Booking Requirements'}
                                        </DialogTitle>

                                        <DialogContent sx={{ mt: 2 }}>
                                                  {requirements.length > 0 && (
                                                            <Box sx={{ mb: 4 }}>
                                                                      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                                                                {locale === 'ar'
                                                                                          ? 'هذه الورشة تتطلب متطلبات مسبقة. سيتم مراجعة طلبك من قبل المشرف قبل الموافقة عليه.'
                                                                                          : 'This workshop has prerequisites. Your request will be reviewed by admin before approval.'}
                                                                      </Alert>

                                                                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                                                                {locale === 'ar' ? 'المستندات والمعلومات المطلوبة' : 'Required Documents & Information'}
                                                                      </Typography>

                                                                      {requirements.map((req) => (
                                                                                <Card key={req.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                                                                          <CardContent sx={{ p: '16px !important' }}>
                                                                                                    <Typography variant="subtitle2" fontWeight={700}>
                                                                                                              {locale === 'ar' ? req.label_ar : req.label_en}
                                                                                                              {req.is_required && <Typography component="span" color="error"> *</Typography>}
                                                                                                    </Typography>
                                                                                                    {(req.description_ar || req.description_en) && (
                                                                                                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                                                                        {locale === 'ar' ? (req.description_ar || req.description_en) : (req.description_en || req.description_ar)}
                                                                                                              </Typography>
                                                                                                    )}

                                                                                                    {req.requirement_type === RequirementType.DOCUMENT && (
                                                                                                              <Box sx={{ mt: 2 }}>
                                                                                                                        <Button
                                                                                                                                  variant="outlined"
                                                                                                                                  component="label"
                                                                                                                                  startIcon={<CloudUploadIcon />}
                                                                                                                                  fullWidth
                                                                                                                                  sx={{ py: 1, borderStyle: 'dashed' }}
                                                                                                                        >
                                                                                                                                  {requirementFiles[req.id]
                                                                                                                                            ? requirementFiles[req.id].name
                                                                                                                                            : (locale === 'ar' ? 'رفع المستند' : 'Upload Document')}
                                                                                                                                  <input
                                                                                                                                            type="file"
                                                                                                                                            hidden
                                                                                                                                            accept="image/*,.pdf,.doc,.docx"
                                                                                                                                            onChange={(e) => {
                                                                                                                                                      if (e.target.files && e.target.files[0]) {
                                                                                                                                                                setRequirementFiles(prev => ({
                                                                                                                                                                          ...prev,
                                                                                                                                                                          [req.id]: e.target.files![0]
                                                                                                                                                                }));
                                                                                                                                                      }
                                                                                                                                            }}
                                                                                                                                  />
                                                                                                                        </Button>
                                                                                                              </Box>
                                                                                                    )}

                                                                                                    {(req.requirement_type === RequirementType.CUSTOM || req.requirement_type === RequirementType.DOCUMENT) && (
                                                                                                              <TextField
                                                                                                                        fullWidth
                                                                                                                        multiline
                                                                                                                        rows={2}
                                                                                                                        size="small"
                                                                                                                        placeholder={locale === 'ar' ? 'أضف ملاحظات (اختياري)' : 'Add notes (optional)'}
                                                                                                                        value={requirementNotes[req.id] || ''}
                                                                                                                        onChange={(e) => setRequirementNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                                                                                        sx={{ mt: 2 }}
                                                                                                              />
                                                                                                    )}
                                                                                          </CardContent>
                                                                                </Card>
                                                                      ))}
                                                            </Box>
                                                  )}
                                        </DialogContent>

                                        <DialogActions sx={{ p: 3, pt: 0 }}>
                                                  <Button
                                                            onClick={() => setBookingOpen(false)}
                                                            disabled={createBooking.isPending || submitReqMutation.isPending}
                                                            sx={{ borderRadius: 2 }}
                                                  >
                                                            {t('common.cancel')}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            onClick={handleBook}
                                                            disabled={createBooking.isPending || submitReqMutation.isPending}
                                                            startIcon={<ShoppingCartIcon />}
                                                            sx={{ px: 4, borderRadius: 2 }}
                                                  >
                                                            {createBooking.isPending || submitReqMutation.isPending
                                                                      ? t('common.loading')
                                                                      : (locale === 'ar' ? 'إرسال الطلب' : 'Submit Request')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Container>
          );
}


function SidebarInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
          const theme = useTheme();
          return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`, '&:last-child': { borderBottom: 'none' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {icon}
                                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={700} color="text.primary">{value}</Typography>
                    </Box>
          );
}

function SeatGrid({ totalSeats, usedSeats, theme }: { totalSeats: number; usedSeats: number; theme: any }) {
          const cols = Math.min(Math.ceil(Math.sqrt(totalSeats)) + 2, 15);

          return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0.8 }}>
                              {Array.from({ length: totalSeats }).map((_, i) => {
                                        const isBooked = i < usedSeats;
                                        return (
                                                  <Box
                                                            key={i}
                                                            sx={{
                                                                      aspectRatio: '1',
                                                                      borderRadius: 1,
                                                                      bgcolor: isBooked
                                                                                ? alpha(theme.palette.warning.main, 0.7)
                                                                                : alpha(theme.palette.success.main, 0.5),
                                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                      fontSize: '0.65rem', color: 'white', fontWeight: 700,
                                                                      transition: 'all 0.2s',
                                                                      '&:hover': { transform: 'scale(1.15)', cursor: 'default' },
                                                                      boxShadow: isBooked ? 'none' : `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                                                            }}
                                                  >
                                                            {i + 1}
                                                  </Box>
                                        );
                              })}
                    </Box>
          );
}
