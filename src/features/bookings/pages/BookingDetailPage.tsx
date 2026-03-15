import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Card, CardContent, Divider, Button, Skeleton,
          Avatar, useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import {
          ArrowBack, Email, Phone, CheckCircle, Cancel,
          EventAvailable, MoneyOff, Person, QrCode
} from '@mui/icons-material';
import dayjs from 'dayjs';

import {
          useBookingDetail, useConfirmBooking, useCancelBooking,
          useMarkAttendance, useMarkPayment
} from '../hooks/useBookings';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { UserRole, BookingStatus } from '../../../types';

type ActionType = 'confirm' | 'cancel' | 'attended' | 'no_show' | 'payment';

export default function BookingDetailPage() {
          const { id } = useParams<{ id: string }>();
          const navigate = useNavigate();
          const theme = useTheme();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;

          const { data: booking, isLoading } = useBookingDetail(id!);

          const confirmBooking = useConfirmBooking();
          const cancelBooking = useCancelBooking();
          const markAttendance = useMarkAttendance();
          const markPayment = useMarkPayment();

          const [actionDialog, setActionDialog] = useState<{ open: boolean; type: ActionType | null }>({ open: false, type: null });

          if (isLoading) {
                    return (
                              <Box>
                                        <Skeleton width="10%" height={40} sx={{ mb: 2 }} />
                                        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                              </Box>
                    );
          }

          if (!booking) {
                    return (
                              <Box sx={{ textAlign: 'center', py: 10 }}>
                                        <Typography variant="h5" color="text.secondary">{t('common.noData')}</Typography>
                                        <Button sx={{ mt: 2 }} onClick={() => navigate('/bookings')}>{t('common.back')}</Button>
                              </Box>
                    );
          }

          const handleAction = async () => {
                    if (!id || !actionDialog.type) return;
                    try {
                              switch (actionDialog.type) {
                                        case 'confirm': await confirmBooking.mutateAsync(id); break;
                                        case 'cancel': await cancelBooking.mutateAsync(id); break;
                                        case 'attended': await markAttendance.mutateAsync({ id, status: 'attended' }); break;
                                        case 'no_show': await markAttendance.mutateAsync({ id, status: 'no_show' }); break;
                                        case 'payment': await markPayment.mutateAsync(id); break;
                              }
                    } catch { /* handled */ }
                    setActionDialog({ open: false, type: null });
          };

          const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

          const isActionPending = confirmBooking.isPending || cancelBooking.isPending || markAttendance.isPending || markPayment.isPending;

          const renderActions = () => {
                    const actions = [];

                    if (booking.status === BookingStatus.PENDING) {
                              if (isAdmin) {
                                        actions.push(
                                                  <Button key="confirm" variant="contained" color="info" startIcon={<CheckCircle />} onClick={() => setActionDialog({ open: true, type: 'confirm' })}>
                                                            {locale === 'ar' ? 'تأكيد الحجز' : 'Confirm'}
                                                  </Button>
                                        );
                              }
                              actions.push(
                                        <Button key="cancel" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setActionDialog({ open: true, type: 'cancel' })}>
                                                  {locale === 'ar' ? 'إلغاء الحجز' : 'Cancel Booking'}
                                        </Button>
                              );
                    }

                    if (booking.status === BookingStatus.CONFIRMED && isAdmin) {
                              actions.push(
                                        <Button key="attended" variant="contained" color="success" startIcon={<EventAvailable />} onClick={() => setActionDialog({ open: true, type: 'attended' })}>
                                                  {locale === 'ar' ? 'تسجيل حضور' : 'Mark Attended'}
                                        </Button>,
                                        <Button key="noshow" variant="contained" color="error" startIcon={<Person />} onClick={() => setActionDialog({ open: true, type: 'no_show' })}>
                                                  {locale === 'ar' ? 'لم يحضر' : 'Mark No-Show'}
                                        </Button>,
                                        <Button key="cancel2" variant="outlined" color="inherit" startIcon={<Cancel />} onClick={() => setActionDialog({ open: true, type: 'cancel' })}>
                                                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                                        </Button>
                              );
                    }

                    if (booking.status === BookingStatus.ATTENDED && isAdmin) {
                              actions.push(
                                        <Button key="payment" variant="contained" color="success" startIcon={<MoneyOff />} onClick={() => setActionDialog({ open: true, type: 'payment' })}>
                                                  {locale === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
                                        </Button>
                              );
                    }

                    if (actions.length === 0) return null;

                    return (
                              <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                        <CardContent>
                                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            {locale === 'ar' ? 'الإجراءات المتاحة' : 'Available Actions'}
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                                                            {actions}
                                                  </Box>
                                        </CardContent>
                              </Card>
                    );
          };

          return (
                    <Box>
                              <Button startIcon={<ArrowBack />} onClick={() => navigate('/bookings')} sx={{ mb: 2 }}>
                                        {t('common.back')}
                              </Button>

                              <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {locale === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'} #{booking.seat_number}
                              </Typography>

                              {renderActions()}

                              <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                                  <Card sx={{ height: '100%' }}>
                                                            <CardContent sx={{ p: 4 }}>
                                                                      <Typography variant="h6" fontWeight={600} gutterBottom>
                                                                                {locale === 'ar' ? 'معلومات الورشة' : 'Workshop Information'}
                                                                      </Typography>
                                                                      <Typography variant="h5" color="primary.main" fontWeight={700} sx={{ mb: 3 }}>
                                                                                {getField(booking.workshop?.title_ar, booking.workshop?.title_en)}
                                                                      </Typography>

                                                                      <Grid container spacing={2}>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary">{locale === 'ar' ? 'تاريخ الورشة' : 'Workshop Date'}</Typography>
                                                                                          <Typography variant="body1" fontWeight={500}>{dayjs(booking.workshop?.start_date).format('DD MMM YYYY, HH:mm')}</Typography>
                                                                                </Grid>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary">{locale === 'ar' ? 'موقع الورشة' : 'Location'}</Typography>
                                                                                          <Typography variant="body1" fontWeight={500}>{getField(booking.workshop?.location_ar, booking.workshop?.location_en) || '—'}</Typography>
                                                                                </Grid>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary">{locale === 'ar' ? 'تاريخ الحجز' : 'Booking Date'}</Typography>
                                                                                          <Typography variant="body1" fontWeight={500}>{dayjs(booking.created_at).format('DD MMM YYYY, HH:mm')}</Typography>
                                                                                </Grid>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary">{locale === 'ar' ? 'حالة الحجز' : 'Booking Status'}</Typography>
                                                                                          <Box sx={{ mt: 0.5 }}><StatusBadge status={booking.status} /></Box>
                                                                                </Grid>
                                                                      </Grid>

                                                                      <Divider sx={{ my: 3 }} />

                                                                      {isAdmin && booking.user && (
                                                                                <Box>
                                                                                          <Typography variant="h6" fontWeight={600} gutterBottom>
                                                                                                    {locale === 'ar' ? 'معلومات المتدرب' : 'Trainee Information'}
                                                                                          </Typography>
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                                                                                    <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.secondary.main }}>
                                                                                                              {booking.user.full_name?.charAt(0)}
                                                                                                    </Avatar>
                                                                                                    <Box>
                                                                                                              <Typography variant="body1" fontWeight={600}>{booking.user.full_name}</Typography>
                                                                                                              <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mt: 0.5 }}>
                                                                                                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                                                  <Email fontSize="small" /> {booking.user.email}
                                                                                                                        </Typography>
                                                                                                                        {booking.user.phone && (
                                                                                                                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                                                            <Phone fontSize="small" /> {booking.user.phone}
                                                                                                                                  </Typography>
                                                                                                                        )}
                                                                                                              </Box>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Box>
                                                                      )}
                                                            </CardContent>
                                                  </Card>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                                  <Card sx={{ mb: 3, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                                            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                                                      <QrCode sx={{ fontSize: 100, color: 'text.disabled', mb: 2 }} />
                                                                      <Typography variant="h3" fontWeight={800} color="primary.main">
                                                                                #{booking.seat_number}
                                                                      </Typography>
                                                                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                                                {t('booking.seatNumber')}
                                                                      </Typography>

                                                                      <Divider sx={{ width: '100%', my: 2 }} />

                                                                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                                <Typography color="text.secondary">{locale === 'ar' ? 'قيمة الحجز' : 'Amount'}</Typography>
                                                                                <Typography fontWeight={700}>{booking.amount} SAR</Typography>
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              </Grid>

                              <Dialog open={actionDialog.open} onClose={() => setActionDialog({ ...actionDialog, open: false })} maxWidth="xs" fullWidth>
                                        <DialogTitle>{locale === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'}</DialogTitle>
                                        <DialogContent>
                                                  <Typography>
                                                            {locale === 'ar'
                                                                      ? `هل أنت متأكد من تنفيذ هذا الإجراء على الحجز #${booking.seat_number}؟`
                                                                      : `Are you sure you want to perform this action on booking #${booking.seat_number}?`}
                                                  </Typography>
                                        </DialogContent>
                                        <DialogActions>
                                                  <Button onClick={() => setActionDialog({ ...actionDialog, open: false })}>{t('common.cancel')}</Button>
                                                  <Button variant="contained" onClick={handleAction} disabled={isActionPending}>
                                                            {isActionPending ? '...' : t('common.confirm')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Box>
          );
}
