import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Card, CardContent, Divider, Button, Skeleton,
          Avatar, useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import {
          Email, Phone, CheckCircle,
          MoneyOff, QrCode,
          CalendarMonth, AccessTime, LocationOn, School
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';

import {
          useBookingDetail, useApproveBooking,
          useMarkPayment
} from '../hooks/useBookings';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { UserRole, BookingStatus } from '../../../types';

type ActionType = 'approve' | 'payment';

export default function BookingDetailPage() {
          const { id } = useParams<{ id: string }>();
          const navigate = useNavigate();
          const theme = useTheme();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
          const canManageBooking = isAdmin || user?.role === UserRole.TRAINER;

          const { data: booking, isLoading } = useBookingDetail(id!);

          const approveBooking = useApproveBooking();
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
                                        case 'approve': await approveBooking.mutateAsync(id); break;
                                        case 'payment': await markPayment.mutateAsync(id); break;
                              }
                    } catch { /* handled */ }
                    setActionDialog({ open: false, type: null });
          };

          const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

          const isActionPending = approveBooking.isPending || markPayment.isPending;

          const renderActions = () => {
                    const actions = [];

                    if (booking.status === BookingStatus.PENDING_APPROVAL) {
                              if (isAdmin) {
                                        actions.push(
                                                  <Button key="approve" variant="contained" color="info" startIcon={<CheckCircle />} onClick={() => setActionDialog({ open: true, type: 'approve' })}>
                                                            {locale === 'ar' ? 'قبول الحجز' : 'Approve'}
                                                  </Button>
                                        );
                              }
                    }

                    if (booking.status === BookingStatus.APPROVED && isAdmin) {
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
                    <Box sx={{ mx: 'auto', py: { xs: 2, md: 4 } }}>
                              {/* <Button startIcon={<ArrowBack />} onClick={() => navigate('/bookings')} sx={{ mb: 3 }}>
                                        {t('common.back')}
                              </Button> */}

                              <Typography variant="h4" fontWeight={800} gutterBottom>
                                        {locale === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'} #{booking.seat_number}
                              </Typography>

                              {renderActions()}

                              <Grid container spacing={4} alignItems="stretch">
                                        {/* Left Column: Essential Info */}
                                        <Grid size={{ xs: 12, md: 8 }}>
                                                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                                                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                                      <Typography variant="overline" color="primary.main" fontWeight={700}>
                                                                                {locale === 'ar' ? 'معلومات الورشة' : 'Workshop Information'}
                                                                      </Typography>
                                                                      <Typography variant="h5" fontWeight={700} sx={{ mt: 1, mb: 4 }}>
                                                                                {getField(booking.workshop?.title_ar, booking.workshop?.title_en)}
                                                                      </Typography>

                                                                      <Grid container spacing={3}>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                                    <CalendarMonth color="action" />
                                                                                                    <Box>
                                                                                                              <Typography variant="caption" color="text.secondary" display="block">{locale === 'ar' ? 'تاريخ الورشة' : 'Date'}</Typography>
                                                                                                              <Typography variant="body1" fontWeight={600}>
                                                                                                                        {dayjs(booking.workshop?.start_date).format('DD MMM YYYY')}
                                                                                                              </Typography>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Grid>

                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                                    <AccessTime color="action" />
                                                                                                    <Box>
                                                                                                              <Typography variant="caption" color="text.secondary" display="block">{locale === 'ar' ? 'وقت الورشة' : 'Session Time'}</Typography>
                                                                                                              <Typography variant="body1" fontWeight={600}>
                                                                                                                        {booking.workshop?.session_start_time ? `${booking.workshop.session_start_time} - ${booking.workshop.session_end_time || ''}` : '—'}
                                                                                                              </Typography>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Grid>

                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                                    <LocationOn color="action" />
                                                                                                    <Box>
                                                                                                              <Typography variant="caption" color="text.secondary" display="block">{locale === 'ar' ? 'الموقع' : 'Location'}</Typography>
                                                                                                              <Typography variant="body1" fontWeight={600}>
                                                                                                                        {getField(booking.workshop?.location_ar, booking.workshop?.location_en) || '—'}
                                                                                                              </Typography>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Grid>

                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                                    <School color="action" />
                                                                                                    <Box>
                                                                                                              <Typography variant="caption" color="text.secondary" display="block">{locale === 'ar' ? 'المدرب' : 'Trainer'}</Typography>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                                                                                        {booking.trainer?.profile_image && (
                                                                                                                                  <Avatar src={booking.trainer.profile_image} sx={{ width: 24, height: 24 }} />
                                                                                                                        )}
                                                                                                                        <Typography variant="body1" fontWeight={600}>
                                                                                                                                  {booking.trainer?.name || '—'}
                                                                                                                        </Typography>
                                                                                                              </Box>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Grid>
                                                                      </Grid>

                                                                      <Divider sx={{ my: 4 }} />

                                                                      <Typography variant="overline" color="primary.main" fontWeight={700}>
                                                                                {locale === 'ar' ? 'معلومات الحجز' : 'Booking Information'}
                                                                      </Typography>
                                                                      <Grid container spacing={3} sx={{ mt: 1 }}>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary" display="block">{locale === 'ar' ? 'تاريخ الحجز' : 'Booking Date'}</Typography>
                                                                                          <Typography variant="body1" fontWeight={600}>{dayjs(booking.created_at).format('DD MMM YYYY, HH:mm')}</Typography>
                                                                                </Grid>
                                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{locale === 'ar' ? 'الحالة' : 'Status'}</Typography>
                                                                                          <StatusBadge status={booking.status} />
                                                                                </Grid>
                                                                      </Grid>

                                                                      {canManageBooking && booking.user && (
                                                                                <>
                                                                                          <Divider sx={{ my: 4 }} />
                                                                                          <Typography variant="overline" color="primary.main" fontWeight={700}>
                                                                                                    {locale === 'ar' ? 'بيانات المتدرب' : 'Trainee Details'}
                                                                                          </Typography>
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                                                                                    <Avatar src={booking.user.profile_image} sx={{ width: 56, height: 56, bgcolor: theme.palette.secondary.main }}>
                                                                                                              {booking.user.full_name?.charAt(0)}
                                                                                                    </Avatar>
                                                                                                    <Box>
                                                                                                              <Typography variant="body1" fontWeight={700}>{booking.user.full_name}</Typography>
                                                                                                              <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mt: 0.5, flexWrap: 'wrap' }}>
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
                                                                                </>
                                                                      )}
                                                            </CardContent>
                                                  </Card>
                                        </Grid>

                                        {/* Right Column: Ticket */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                                  <Card sx={{
                                                            height: '100%',
                                                            borderRadius: 2,
                                                            // boxShadow: theme.shadows[4],
                                                            bgcolor: theme.palette.primary.main,
                                                            color: 'white',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            overflow: 'hidden'
                                                  }}>
                                                            <Box sx={{ p: 2, textAlign: 'center', }}>
                                                                      <Typography variant="overline" fontWeight={700} sx={{ letterSpacing: 2 }}>
                                                                                {locale === 'ar' ? 'تذكرة الدخول' : 'ADMISSION PASS'}
                                                                      </Typography>
                                                            </Box>

                                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#f8fafc' }}>
                                                                      {['approved', 'paid'].includes(booking.status) ? (
                                                                                <Box sx={{
                                                                                          p: 2,
                                                                                          // bgcolor: 'white',
                                                                                          borderRadius: 4,
                                                                                          mb: 3,
                                                                                          display: 'inline-block',
                                                                                          // boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                                                          // border: '1px solid',
                                                                                          // borderColor: 'divider'
                                                                                }}>
                                                                                          <QRCodeSVG
                                                                                                    value={`${window.location.origin}/bookings/${booking.id}`}
                                                                                                    size={180}
                                                                                                    level="H"
                                                                                                    includeMargin={false}
                                                                                          />
                                                                                </Box>
                                                                      ) : (
                                                                                <Box sx={{
                                                                                          p: 4,
                                                                                          bgcolor: alpha(theme.palette.text.disabled, 0.1),
                                                                                          borderRadius: 4,
                                                                                          mb: 3,
                                                                                          display: 'flex',
                                                                                          flexDirection: 'column',
                                                                                          alignItems: 'center'
                                                                                }}>
                                                                                          <QrCode sx={{ fontSize: 80, color: 'text.disabled', mb: 1 }} />
                                                                                          <Typography variant="caption" color="text.secondary" textAlign="center">
                                                                                                    {locale === 'ar' ? 'الرمز يظهر بعد التأكيد' : 'QR code shows after confirmation'}
                                                                                          </Typography>
                                                                                </Box>
                                                                      )}

                                                                      <Typography variant="h2" fontWeight={900} color="primary.main" sx={{ mb: 0.5 }}>
                                                                                #{booking.seat_number}
                                                                      </Typography>
                                                                      <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                                                                                {t('booking.seatNumber')}
                                                                      </Typography>
                                                            </CardContent>

                                                            <Box sx={{ p: 3, bgcolor: 'white', borderTop: '2px dashed', borderColor: 'divider' }}>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                                                                          {locale === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                                                                                </Typography>
                                                                                <Typography variant="h5" fontWeight={800} color="text.primary">
                                                                                          {booking.amount} <Typography component="span" variant="body2" fontWeight={600} color="text.secondary">IQD</Typography>
                                                                                </Typography>
                                                                      </Box>
                                                            </Box>
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
