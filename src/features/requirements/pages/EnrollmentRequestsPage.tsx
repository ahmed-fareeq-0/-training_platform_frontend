import { useState } from 'react';
import {
          Box, Typography, Card, CardContent, useTheme, alpha, Button, Chip,
          Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
          Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
          TextField, CircularProgress, Tooltip, Tabs, Tab,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import EventAvailable from '@mui/icons-material/EventAvailable';
import Person from '@mui/icons-material/Person';
import MoneyOff from '@mui/icons-material/MoneyOff';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { usePendingEnrollmentRequests, useReviewSubmission } from '../../requirements/hooks/useRequirements';
import { useUIStore } from '../../../store/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import courseService from '../../../api/services/course.service';
import { useAllBookings, useApproveBooking, useMarkPayment } from '../../bookings/hooks/useBookings';
import StatusBadge from '../../../components/ui/StatusBadge';
import { BookingStatus } from '../../../types';
import type { Booking } from '../../../types';
import toast from 'react-hot-toast';

type WorkshopActionType = 'approve' | 'payment';

export default function EnrollmentRequestsPage() {
          const theme = useTheme();
          const navigate = useNavigate();
          const { locale } = useUIStore();
          const isRTL = locale === 'ar';
          const qc = useQueryClient();

          const [typeFilter, setTypeFilter] = useState<string>('all');
          const [page] = useState(1);

          // ── Requirement submissions (original data source) ──
          const { data: reqData, isLoading: reqLoading } = usePendingEnrollmentRequests({
                    page,
                    limit: 50,
                    type: typeFilter === 'all' ? undefined : typeFilter,
          });

          // ── Course pending enrollments ──
          const { data: courseEnrollData, isLoading: courseLoading } = useQuery({
                    queryKey: ['pending_course_enrollments', page],
                    queryFn: () => courseService.getPendingEnrollments({ page, limit: 50 }),
          });

          // ── Workshop bookings ──
          const workshopBookingsQuery = useAllBookings({ page, limit: 50 });
          const workshopBookings: Booking[] = workshopBookingsQuery.data?.data || [];
          const workshopLoading = workshopBookingsQuery.isLoading;

          // Review dialog (for requirement submissions)
          const reviewMutation = useReviewSubmission();
          const [reviewDialog, setReviewDialog] = useState<{
                    open: boolean;
                    submissionId: string;
                    action: 'approve' | 'reject';
          }>({ open: false, submissionId: '', action: 'approve' });
          const [reviewNotes, setReviewNotes] = useState('');

          const handleReview = async () => {
                    await reviewMutation.mutateAsync({
                              submissionId: reviewDialog.submissionId,
                              data: {
                                        is_satisfied: reviewDialog.action === 'approve',
                                        notes: reviewNotes || undefined,
                              },
                    });
                    setReviewDialog({ open: false, submissionId: '', action: 'approve' });
                    setReviewNotes('');
          };

          // ── Course enrollment confirm/reject ──
          const courseConfirmMutation = useMutation({
                    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: 'active' | 'cancelled' }) =>
                              courseService.confirmEnrollment(enrollmentId, status),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ['pending_course_enrollments'] });
                              toast.success(isRTL ? 'تم تحديث حالة التسجيل' : 'Enrollment status updated');
                    },
          });

          const [courseActionDialog, setCourseActionDialog] = useState<{
                    open: boolean;
                    enrollmentId: string;
                    action: 'active' | 'cancelled';
          }>({ open: false, enrollmentId: '', action: 'active' });

          const handleCourseAction = async () => {
                    await courseConfirmMutation.mutateAsync({
                              enrollmentId: courseActionDialog.enrollmentId,
                              status: courseActionDialog.action,
                    });
                    setCourseActionDialog({ open: false, enrollmentId: '', action: 'active' });
          };

          // ── Workshop booking actions ──
          const approveBooking = useApproveBooking();
          const markPayment = useMarkPayment();

          const [workshopActionDialog, setWorkshopActionDialog] = useState<{
                    open: boolean; type: WorkshopActionType; booking: Booking | null;
          }>({ open: false, type: 'approve', booking: null });

          const handleWorkshopAction = async () => {
                    const b = workshopActionDialog.booking;
                    if (!b) return;
                    try {
                              switch (workshopActionDialog.type) {
                                        case 'approve': await approveBooking.mutateAsync(b.id); break;
                                        case 'payment': await markPayment.mutateAsync(b.id); break;
                              }
                    } catch { /* handled by mutation */ }
                    setWorkshopActionDialog({ open: false, type: 'approve', booking: null });
          };

          const getWorkshopActions = (booking: Booking) => {
                    const actions: Array<{ label: string; icon: React.ReactNode; type: WorkshopActionType; color: string }> = [];
                    if (booking.status === BookingStatus.PENDING_APPROVAL) {
                              actions.push(
                                        { label: isRTL ? 'قبول' : 'Approve', icon: <CheckCircleIcon />, type: 'approve', color: 'info' }
                              );
                    }
                    if (booking.status === BookingStatus.APPROVED) {
                              actions.push(
                                        { label: isRTL ? 'تأكيد الدفع' : 'Confirm Payment', icon: <MoneyOff />, type: 'payment', color: 'success' },
                              );
                    }
                    return actions;
          };

          const getField = (ar?: string, en?: string) => isRTL ? (ar || en || '') : (en || ar || '');

          const requests = reqData?.data || [];
          const courseEnrollments = courseEnrollData?.data || [];

          const isLoading = (typeFilter === 'all' && (reqLoading || courseLoading || workshopLoading))
                    || (typeFilter === 'course' && courseLoading)
                    || (typeFilter === 'workshop' && workshopLoading);

          return (
                    <Box>
                              {/* Header */}
                              <Box sx={{ mb: 4 }}>
                                        <Typography variant="h4" fontWeight={800} gutterBottom>
                                                  {isRTL ? 'طلبات التسجيل' : 'Enrollment Requests'}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                                  {isRTL
                                                            ? 'مراجعة وإدارة طلبات التسجيل في الدورات وحجوزات الورش'
                                                            : 'Review and manage course enrollments and workshop bookings'}
                                        </Typography>
                              </Box>

                              {/* Filter Tabs */}
                              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs value={typeFilter} onChange={(_e, v) => setTypeFilter(v)}>
                                                  <Tab value="all" label={isRTL ? 'الكل' : 'All'} />
                                                  <Tab value="course" label={isRTL ? 'الدورات' : 'Courses'} />
                                                  <Tab value="workshop" label={isRTL ? 'الورش' : 'Workshops'} />
                                        </Tabs>
                              </Box>

                              {/* Loading */}
                              {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                                  <CircularProgress />
                                        </Box>
                              ) : (
                                        <>
                                                  {/* ── COURSES SECTION ── */}
                                                  {(typeFilter === 'all' || typeFilter === 'course') && (
                                                            <>
                                                                      {typeFilter === 'all' && (
                                                                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                          📚 {isRTL ? 'طلبات تسجيل الدورات' : 'Course Enrollment Requests'}
                                                                                          <Chip label={courseEnrollments.length} size="small" color="primary" />
                                                                                </Typography>
                                                                      )}

                                                                      {courseEnrollments.length === 0 && requests.filter((r: any) => r.enrollment_type === 'course').length === 0 ? (
                                                                                <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 4 }}>
                                                                                          <CardContent sx={{ p: 6, textAlign: 'center' }}>
                                                                                                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                                                                    <Typography variant="body1" color="text.secondary">
                                                                                                              {isRTL ? 'لا توجد طلبات تسجيل دورات معلقة' : 'No pending course enrollment requests'}
                                                                                                    </Typography>
                                                                                          </CardContent>
                                                                                </Card>
                                                                      ) : (
                                                                                <TableContainer component={Paper} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 4 }}>
                                                                                          <Table>
                                                                                                    <TableHead>
                                                                                                              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المتدرب' : 'Trainee'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الدورة' : 'Course'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المبلغ' : 'Amount'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'طريقة الدفع' : 'Payment'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'التاريخ' : 'Date'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'إجراء' : 'Actions'}</TableCell>
                                                                                                              </TableRow>
                                                                                                    </TableHead>
                                                                                                    <TableBody>
                                                                                                              {courseEnrollments.map((enroll: any, idx: number) => (
                                                                                                                        <TableRow key={enroll.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                                                                                                                  <TableCell>{idx + 1}</TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>{enroll.user_name || '—'}</Typography>
                                                                                                                                            <Typography variant="caption" color="text.secondary">{enroll.user_email || ''}</Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={500}>
                                                                                                                                                      {getField(enroll.course_title_ar, enroll.course_title_en)}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>
                                                                                                                                                      {Number(enroll.amount_paid).toLocaleString()} IQD
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip
                                                                                                                                                      label={enroll.payment_method === 'cash'
                                                                                                                                                                ? (isRTL ? '💵 نقداً' : '💵 Cash')
                                                                                                                                                                : (isRTL ? '🏦 تحويل' : '🏦 Transfer')}
                                                                                                                                                      size="small"
                                                                                                                                                      variant="outlined"
                                                                                                                                            />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip
                                                                                                                                                      label={isRTL ? 'بانتظار الدفع' : 'Pending Payment'}
                                                                                                                                                      size="small"
                                                                                                                                                      color="warning"
                                                                                                                                            />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                                                                      {dayjs(enroll.created_at).format('DD/MM/YYYY HH:mm')}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                                                                                      <Tooltip title={isRTL ? 'تأكيد التسجيل' : 'Confirm Enrollment'}>
                                                                                                                                                                <IconButton
                                                                                                                                                                          size="small" color="success"
                                                                                                                                                                          onClick={() => setCourseActionDialog({ open: true, enrollmentId: enroll.id, action: 'active' })}
                                                                                                                                                                >
                                                                                                                                                                          <CheckCircleIcon fontSize="small" />
                                                                                                                                                                </IconButton>
                                                                                                                                                      </Tooltip>
                                                                                                                                                      <Tooltip title={isRTL ? 'رفض' : 'Reject'}>
                                                                                                                                                                <IconButton
                                                                                                                                                                          size="small" color="error"
                                                                                                                                                                          onClick={() => setCourseActionDialog({ open: true, enrollmentId: enroll.id, action: 'cancelled' })}
                                                                                                                                                                >
                                                                                                                                                                          <CancelIcon fontSize="small" />
                                                                                                                                                                </IconButton>
                                                                                                                                                      </Tooltip>
                                                                                                                                            </Box>
                                                                                                                                  </TableCell>
                                                                                                                        </TableRow>
                                                                                                              ))}

                                                                                                              {/* Also show requirement-based course submissions */}
                                                                                                              {requests.filter((r: any) => r.enrollment_type === 'course').map((req: any) => (
                                                                                                                        <TableRow key={req.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                                                                                                                  <TableCell>—</TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>{req.trainee_name || '—'}</Typography>
                                                                                                                                            <Typography variant="caption" color="text.secondary">{req.trainee_email || ''}</Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={500}>
                                                                                                                                                      {getField(req.training_title_ar, req.training_title_en)}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>—</TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip label={isRTL ? req.requirement?.label_ar : req.requirement?.label_en} size="small" variant="outlined" />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip
                                                                                                                                                      label={req.is_satisfied ? (isRTL ? 'مقبول' : 'Approved') : (isRTL ? 'قيد المراجعة' : 'Pending Review')}
                                                                                                                                                      size="small"
                                                                                                                                                      color={req.is_satisfied ? 'success' : 'warning'}
                                                                                                                                            />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                                                                      {req.notes || '—'}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                                                                                      {req.document_url && (
                                                                                                                                                                <Tooltip title={isRTL ? 'عرض المستند' : 'View Document'}>
                                                                                                                                                                          <IconButton size="small" href={req.document_url} target="_blank">
                                                                                                                                                                                    <VisibilityIcon fontSize="small" />
                                                                                                                                                                          </IconButton>
                                                                                                                                                                </Tooltip>
                                                                                                                                                      )}
                                                                                                                                                      {!req.is_satisfied && (
                                                                                                                                                                <>
                                                                                                                                                                          <Tooltip title={isRTL ? 'قبول' : 'Approve'}>
                                                                                                                                                                                    <IconButton
                                                                                                                                                                                              size="small" color="success"
                                                                                                                                                                                              onClick={() => setReviewDialog({ open: true, submissionId: req.id, action: 'approve' })}
                                                                                                                                                                                    >
                                                                                                                                                                                              <CheckCircleIcon fontSize="small" />
                                                                                                                                                                                    </IconButton>
                                                                                                                                                                          </Tooltip>
                                                                                                                                                                          <Tooltip title={isRTL ? 'رفض' : 'Reject'}>
                                                                                                                                                                                    <IconButton
                                                                                                                                                                                              size="small" color="error"
                                                                                                                                                                                              onClick={() => setReviewDialog({ open: true, submissionId: req.id, action: 'reject' })}
                                                                                                                                                                                    >
                                                                                                                                                                                              <CancelIcon fontSize="small" />
                                                                                                                                                                                    </IconButton>
                                                                                                                                                                          </Tooltip>
                                                                                                                                                                </>
                                                                                                                                                      )}
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

                                                  {/* ── WORKSHOPS SECTION ── */}
                                                  {(typeFilter === 'all' || typeFilter === 'workshop') && (
                                                            <>
                                                                      {typeFilter === 'all' && (
                                                                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                          🎓 {isRTL ? 'حجوزات الورش' : 'Workshop Bookings'}
                                                                                          <Chip label={workshopBookings.length} size="small" color="secondary" />
                                                                                </Typography>
                                                                      )}

                                                                      {workshopBookings.length === 0 ? (
                                                                                <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 4 }}>
                                                                                          <CardContent sx={{ p: 6, textAlign: 'center' }}>
                                                                                                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                                                                    <Typography variant="body1" color="text.secondary">
                                                                                                              {isRTL ? 'لا توجد حجوزات ورش' : 'No workshop bookings found'}
                                                                                                    </Typography>
                                                                                          </CardContent>
                                                                                </Card>
                                                                      ) : (
                                                                                <TableContainer component={Paper} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 4 }}>
                                                                                          <Table>
                                                                                                    <TableHead>
                                                                                                              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المتدرب' : 'Trainee'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الورشة' : 'Workshop'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'رقم المقعد' : 'Seat #'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المبلغ' : 'Amount'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'التاريخ' : 'Date'}</TableCell>
                                                                                                                        <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'إجراء' : 'Actions'}</TableCell>
                                                                                                              </TableRow>
                                                                                                    </TableHead>
                                                                                                    <TableBody>
                                                                                                              {workshopBookings.map((booking: Booking, idx: number) => (
                                                                                                                        <TableRow key={booking.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                                                                                                                  <TableCell>{idx + 1}</TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>{booking.user?.full_name || booking.user_id}</Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                                                                                                                                      {getField(booking.workshop?.title_ar, booking.workshop?.title_en) || booking.workshop_id}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Chip label={`#${booking.seat_number}`} size="small" variant="outlined" />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography fontWeight={600}>{booking.amount} IQD</Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <StatusBadge status={booking.status} />
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                                                                      {dayjs(booking.created_at).format('DD/MM/YYYY HH:mm')}
                                                                                                                                            </Typography>
                                                                                                                                  </TableCell>
                                                                                                                                  <TableCell>
                                                                                                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                                                                                      <Tooltip title={isRTL ? 'التفاصيل' : 'Details'}>
                                                                                                                                                                <IconButton size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                                                                                                                                                          <VisibilityIcon fontSize="small" />
                                                                                                                                                                </IconButton>
                                                                                                                                                      </Tooltip>
                                                                                                                                                      {getWorkshopActions(booking).map((action) => (
                                                                                                                                                                <Tooltip key={action.type} title={action.label}>
                                                                                                                                                                          <IconButton
                                                                                                                                                                                    size="small"
                                                                                                                                                                                    color={action.color as 'info' | 'error' | 'success' | 'default'}
                                                                                                                                                                                    onClick={() => setWorkshopActionDialog({ open: true, type: action.type, booking })}
                                                                                                                                                                          >
                                                                                                                                                                                    {action.icon}
                                                                                                                                                                          </IconButton>
                                                                                                                                                                </Tooltip>
                                                                                                                                                      ))}
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

                              {/* ── Requirement Review Dialog ── */}
                              <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, submissionId: '', action: 'approve' })} maxWidth="sm" fullWidth>
                                        <DialogTitle sx={{ fontWeight: 700, color: reviewDialog.action === 'approve' ? 'success.main' : 'error.main' }}>
                                                  {reviewDialog.action === 'approve'
                                                            ? (isRTL ? 'تأكيد القبول' : 'Confirm Approval')
                                                            : (isRTL ? 'تأكيد الرفض' : 'Confirm Rejection')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <TextField
                                                            label={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                                                            fullWidth multiline rows={3}
                                                            value={reviewNotes}
                                                            onChange={e => setReviewNotes(e.target.value)}
                                                            sx={{ mt: 1 }}
                                                  />
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 2 }}>
                                                  <Button onClick={() => setReviewDialog({ open: false, submissionId: '', action: 'approve' })} sx={{ borderRadius: '50px' }}>
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            color={reviewDialog.action === 'approve' ? 'success' : 'error'}
                                                            onClick={handleReview}
                                                            disabled={reviewMutation.isPending}
                                                            sx={{ borderRadius: '50px', fontWeight: 600 }}
                                                  >
                                                            {reviewMutation.isPending ? <CircularProgress size={20} /> : (
                                                                      reviewDialog.action === 'approve'
                                                                                ? (isRTL ? 'قبول' : 'Approve')
                                                                                : (isRTL ? 'رفض' : 'Reject')
                                                            )}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>

                              {/* ── Course Enrollment Confirm/Reject Dialog ── */}
                              <Dialog open={courseActionDialog.open} onClose={() => setCourseActionDialog({ open: false, enrollmentId: '', action: 'active' })} maxWidth="xs" fullWidth>
                                        <DialogTitle sx={{ fontWeight: 700, color: courseActionDialog.action === 'active' ? 'success.main' : 'error.main' }}>
                                                  {courseActionDialog.action === 'active'
                                                            ? (isRTL ? 'تأكيد تسجيل الدورة' : 'Confirm Course Enrollment')
                                                            : (isRTL ? 'رفض تسجيل الدورة' : 'Reject Course Enrollment')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <Typography>
                                                            {courseActionDialog.action === 'active'
                                                                      ? (isRTL ? 'هل أنت متأكد من تأكيد هذا التسجيل؟ سيتم تفعيل وصول المتدرب للدورة.' : 'Are you sure you want to confirm this enrollment? The trainee will gain access to the course.')
                                                                      : (isRTL ? 'هل أنت متأكد من رفض هذا التسجيل؟' : 'Are you sure you want to reject this enrollment?')}
                                                  </Typography>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 2 }}>
                                                  <Button onClick={() => setCourseActionDialog({ open: false, enrollmentId: '', action: 'active' })} sx={{ borderRadius: '50px' }}>
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            color={courseActionDialog.action === 'active' ? 'success' : 'error'}
                                                            onClick={handleCourseAction}
                                                            disabled={courseConfirmMutation.isPending}
                                                            sx={{ borderRadius: '50px', fontWeight: 600 }}
                                                  >
                                                            {courseConfirmMutation.isPending ? <CircularProgress size={20} /> : (
                                                                      courseActionDialog.action === 'active'
                                                                                ? (isRTL ? 'تأكيد' : 'Confirm')
                                                                                : (isRTL ? 'رفض' : 'Reject')
                                                            )}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>

                              {/* ── Workshop Action Dialog ── */}
                              <Dialog open={workshopActionDialog.open} onClose={() => setWorkshopActionDialog({ ...workshopActionDialog, open: false })} maxWidth="xs" fullWidth>
                                        <DialogTitle>{isRTL ? 'تأكيد الإجراء' : 'Confirm Action'}</DialogTitle>
                                        <DialogContent>
                                                  <Typography>
                                                            {isRTL
                                                                      ? `هل أنت متأكد من تنفيذ هذا الإجراء على الحجز #${workshopActionDialog.booking?.seat_number}؟`
                                                                      : `Are you sure you want to perform this action on booking #${workshopActionDialog.booking?.seat_number}?`}
                                                  </Typography>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 2 }}>
                                                  <Button onClick={() => setWorkshopActionDialog({ ...workshopActionDialog, open: false })} sx={{ borderRadius: '50px' }}>
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            onClick={handleWorkshopAction}
                                                            sx={{ borderRadius: '50px', fontWeight: 600 }}
                                                  >
                                                            {isRTL ? 'تأكيد' : 'Confirm'}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Box>
          );
}
