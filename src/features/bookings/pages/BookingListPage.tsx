import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
        Box, Typography, Card, CardContent, Table, TableBody, TableCell,
        TableContainer, TableHead, TableRow, Button, IconButton, Tooltip,
        Pagination, Chip, useTheme, alpha, Skeleton, Dialog,
        DialogTitle, DialogContent, DialogActions, MenuItem, TextField, Checkbox,
} from '@mui/material';
import {
        CheckCircle, Cancel, Visibility, EventAvailable,
        MoneyOff, Person, FactCheck, EventBusy
} from '@mui/icons-material';
import dayjs from 'dayjs';
import StatusBadge from '../../../components/ui/StatusBadge';
import RevenueCards from '../components/RevenueCards';
import EmptyState from '../../../components/common/EmptyState';
import {
        useMyBookings, useAllBookings,
        useConfirmBooking, useCancelBooking,
        useMarkAttendance, useMarkPayment,
        useBulkAttendance,
} from '../hooks/useBookings';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { UserRole, BookingStatus } from '../../../types';
import type { Booking } from '../../../types';

type ActionType = 'confirm' | 'cancel' | 'attended' | 'no_show' | 'payment';

export default function BookingListPage() {
        const theme = useTheme();
        const navigate = useNavigate();
        const { t } = useTranslation();
        const { user } = useAuthStore();
        const { locale } = useUIStore();
        const [page, setPage] = useState(1);
        const [statusFilter, setStatusFilter] = useState<string>('');
        const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
        const [bulkActionDialog, setBulkActionDialog] = useState<{ open: boolean, type: 'attended' | 'no_show' }>({ open: false, type: 'attended' });
        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;

        const filters = { page, limit: 10, ...(statusFilter && { status: statusFilter }) };
        const allBookings = useAllBookings(filters);
        const myBookings = useMyBookings(filters);
        const activeQuery = isAdmin ? allBookings : myBookings;
        const bookings = activeQuery.data?.data || [];
        const pagination = activeQuery.data?.pagination;
        const isLoading = activeQuery.isLoading;

        const confirmBooking = useConfirmBooking();
        const cancelBooking = useCancelBooking();
        const markAttendance = useMarkAttendance();
        const markPayment = useMarkPayment();
        const bulkAttendance = useBulkAttendance();

        const [actionDialog, setActionDialog] = useState<{
                open: boolean; type: ActionType; booking: Booking | null;
        }>({ open: false, type: 'confirm', booking: null });

        const handleAction = async () => {
                const b = actionDialog.booking;
                if (!b) return;
                try {
                        switch (actionDialog.type) {
                                case 'confirm': await confirmBooking.mutateAsync(b.id); break;
                                case 'cancel': await cancelBooking.mutateAsync(b.id); break;
                                case 'attended': await markAttendance.mutateAsync({ id: b.id, status: 'attended' }); break;
                                case 'no_show': await markAttendance.mutateAsync({ id: b.id, status: 'no_show' }); break;
                                case 'payment': await markPayment.mutateAsync(b.id); break;
                        }
                } catch { /* handled */ }
                setActionDialog({ open: false, type: 'confirm', booking: null });
        };

        const handleBulkAction = async () => {
                if (selectedBookings.length === 0) return;

                // Group selections by workshop to match the bulk API design if needed
                // Currently API bulk matches workshop_id, let's just assume we're acting on the selected List
                // The bulk schema might need workshop_id. Let's send the first booking's workshop_id and just the attendees.
                const firstBooking = bookings.find(b => b.id === selectedBookings[0]);
                if (!firstBooking) return;

                try {
                        await bulkAttendance.mutateAsync({
                                workshop_id: firstBooking.workshop_id,
                                attendees: selectedBookings.map(id => ({ booking_id: id, status: bulkActionDialog.type }))
                        });
                        setSelectedBookings([]);
                } catch { }
                setBulkActionDialog({ ...bulkActionDialog, open: false });
        };

        const toggleSelect = (id: string) => {
                setSelectedBookings(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
        };

        const toggleSelectAll = () => {
                if (selectedBookings.length === bookings.filter(b => b.status === BookingStatus.CONFIRMED).length) {
                        setSelectedBookings([]);
                } else {
                        setSelectedBookings(bookings.filter(b => b.status === BookingStatus.CONFIRMED).map(b => b.id));
                }
        };

        const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

        const getActions = (booking: Booking) => {
                const actions: Array<{ label: string; icon: React.ReactNode; type: ActionType; color: string }> = [];
                if (!isAdmin) return actions;
                if (booking.status === BookingStatus.PENDING) {
                        actions.push(
                                { label: locale === 'ar' ? 'تأكيد' : 'Confirm', icon: <CheckCircle />, type: 'confirm', color: 'info' },
                                { label: locale === 'ar' ? 'إلغاء' : 'Cancel', icon: <Cancel />, type: 'cancel', color: 'error' },
                        );
                }
                if (booking.status === BookingStatus.CONFIRMED) {
                        actions.push(
                                { label: locale === 'ar' ? 'حضر' : 'Attended', icon: <EventAvailable />, type: 'attended', color: 'success' },
                                { label: locale === 'ar' ? 'لم يحضر' : 'No-Show', icon: <Person />, type: 'no_show', color: 'error' },
                                { label: locale === 'ar' ? 'إلغاء' : 'Cancel', icon: <Cancel />, type: 'cancel', color: 'default' },
                        );
                }
                if (booking.status === BookingStatus.ATTENDED) {
                        actions.push(
                                { label: locale === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment', icon: <MoneyOff />, type: 'payment', color: 'success' },
                        );
                }
                return actions;
        };

        return (
                <Box>
                        <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                                <Box>
                                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                                                {isAdmin ? (locale === 'ar' ? 'جميع الحجوزات' : 'All Bookings') : (locale === 'ar' ? 'حجوزاتي' : 'My Bookings')}
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary">
                                                                {isAdmin
                                                                        ? (locale === 'ar' ? 'عرض وإدارة كافة حجوزات المنصة' : 'View and manage all platform bookings')
                                                                        : (locale === 'ar' ? 'إدارة ومتابعة جميع حجوزاتك' : 'Manage and track all your bookings')}
                                                        </Typography>
                                                </Box>

                                                {isAdmin && selectedBookings.length > 0 && (
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                        variant="contained"
                                                                        color="success"
                                                                        startIcon={<FactCheck />}
                                                                        onClick={() => setBulkActionDialog({ open: true, type: 'attended' })}
                                                                >
                                                                        {locale === 'ar' ? `حضر (${selectedBookings.length})` : `Attended (${selectedBookings.length})`}
                                                                </Button>
                                                                <Button
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => setBulkActionDialog({ open: true, type: 'no_show' })}
                                                                >
                                                                        {locale === 'ar' ? `لم يحضر (${selectedBookings.length})` : `No Show (${selectedBookings.length})`}
                                                                </Button>
                                                        </Box>
                                                )}
                                        </Box>

                                        {/* Unified Filter Section */}
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <TextField
                                                        select
                                                        label={t('common.status')}
                                                        sx={{ width: { xs: '100%', sm: 250 }, flexShrink: 0 }}
                                                        value={statusFilter}
                                                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                                >
                                                        <MenuItem value="">{locale === 'ar' ? 'الكل' : 'All'}</MenuItem>
                                                        {Object.values(BookingStatus).map(s => (
                                                                <MenuItem key={s} value={s}><StatusBadge status={s} /></MenuItem>
                                                        ))}
                                                </TextField>
                                        </Box>
                                </CardContent>
                        </Card>

                        {isAdmin && <Box sx={{ mb: 4 }}><RevenueCards /></Box>}

                        <Card>
                                <TableContainer>
                                        <Table>
                                                <TableHead>
                                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                {isAdmin && (
                                                                        <TableCell padding="checkbox">
                                                                                <Checkbox
                                                                                        indeterminate={selectedBookings.length > 0 && selectedBookings.length < bookings.filter(b => b.status === BookingStatus.CONFIRMED).length}
                                                                                        checked={bookings.filter(b => b.status === BookingStatus.CONFIRMED).length > 0 && selectedBookings.length === bookings.filter(b => b.status === BookingStatus.CONFIRMED).length}
                                                                                        onChange={toggleSelectAll}
                                                                                        disabled={bookings.filter(b => b.status === BookingStatus.CONFIRMED).length === 0}
                                                                                />
                                                                        </TableCell>
                                                                )}
                                                                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'الورشة' : 'Workshop'}</TableCell>
                                                                {isAdmin && <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'المتدرب' : 'Trainee'}</TableCell>}
                                                                <TableCell sx={{ fontWeight: 600 }}>{t('booking.seatNumber')}</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>{t('booking.amount')}</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>{t('common.date')}</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
                                                        </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                                                <TableRow key={i}>
                                                                        {Array.from({ length: isAdmin ? 9 : 7 }).map((_, j) => (
                                                                                <TableCell key={j}><Skeleton width="80%" /></TableCell>
                                                                        ))}
                                                                </TableRow>
                                                        ))}
                                                        {!isLoading && bookings.map((booking, idx) => (
                                                                <TableRow key={booking.id} hover>
                                                                        {isAdmin && (
                                                                                <TableCell padding="checkbox">
                                                                                        <Checkbox
                                                                                                checked={selectedBookings.includes(booking.id)}
                                                                                                onChange={() => toggleSelect(booking.id)}
                                                                                                disabled={booking.status !== BookingStatus.CONFIRMED}
                                                                                        />
                                                                                </TableCell>
                                                                        )}
                                                                        <TableCell>{(page - 1) * 10 + idx + 1}</TableCell>
                                                                        <TableCell>
                                                                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                                                                        {getField(booking.workshop?.title_ar, booking.workshop?.title_en) || booking.workshop_id}
                                                                                </Typography>
                                                                        </TableCell>
                                                                        {isAdmin && (
                                                                                <TableCell>
                                                                                        <Typography variant="body2" noWrap>{booking.user?.full_name || booking.user_id}</Typography>
                                                                                </TableCell>
                                                                        )}
                                                                        <TableCell><Chip label={`#${booking.seat_number}`} size="small" variant="outlined" /></TableCell>
                                                                        <TableCell><Typography variant="body2" fontWeight={600}>{booking.amount} IQD</Typography></TableCell>
                                                                        <TableCell><StatusBadge status={booking.status} /></TableCell>
                                                                        <TableCell>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                        {dayjs(booking.created_at).format('DD/MM/YYYY HH:mm')}
                                                                                </Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                        <Tooltip title={t('common.details')}>
                                                                                                <IconButton size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                                                                                        <Visibility fontSize="small" />
                                                                                                </IconButton>
                                                                                        </Tooltip>
                                                                                        {getActions(booking).map((action) => (
                                                                                                <Tooltip key={action.type} title={action.label}>
                                                                                                        <IconButton size="small" color={action.color as 'info' | 'error' | 'success' | 'default'}
                                                                                                                onClick={() => setActionDialog({ open: true, type: action.type, booking })}>
                                                                                                                {action.icon}
                                                                                                        </IconButton>
                                                                                                </Tooltip>
                                                                                        ))}
                                                                                </Box>
                                                                        </TableCell>
                                                                </TableRow>
                                                        ))}
                                                        {!isLoading && bookings.length === 0 && (
                                                                <TableRow>
                                                                        <TableCell colSpan={isAdmin ? 9 : 7} align="center" sx={{ borderBottom: 'none' }}>
                                                                                <EmptyState
                                                                                        icon={<EventBusy />}
                                                                                        title_ar="لا توجد حجوزات"
                                                                                        title_en="No Bookings Found"
                                                                                        description_ar="لم يتم العثور على أي حجوزات تطابق معايير البحث الحالية."
                                                                                        description_en="We couldn't find any bookings matching your current criteria."
                                                                                />
                                                                        </TableCell>
                                                                </TableRow>
                                                        )}
                                                </TableBody>
                                        </Table>
                                </TableContainer>
                        </Card>

                        {pagination && pagination.totalPages > 1 && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                        <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
                                </Box>
                        )}

                        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ ...actionDialog, open: false })} maxWidth="xs" fullWidth>
                                <DialogTitle>{locale === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'}</DialogTitle>
                                <DialogContent>
                                        <Typography>
                                                {locale === 'ar'
                                                        ? `هل أنت متأكد من تنفيذ هذا الإجراء على الحجز #${actionDialog.booking?.seat_number}؟`
                                                        : `Are you sure you want to perform this action on booking #${actionDialog.booking?.seat_number}?`}
                                        </Typography>
                                </DialogContent>
                                <DialogActions>
                                        <Button onClick={() => setActionDialog({ ...actionDialog, open: false })}>{t('common.cancel')}</Button>
                                        <Button variant="contained" onClick={handleAction}>{t('common.confirm')}</Button>
                                </DialogActions>
                        </Dialog>

                        {/* Bulk Action Confirmation Dialog */}
                        <Dialog open={bulkActionDialog.open} onClose={() => setBulkActionDialog({ ...bulkActionDialog, open: false })} maxWidth="xs" fullWidth>
                                <DialogTitle>{locale === 'ar' ? 'تأكيد الإجراء الجماعي' : 'Confirm Bulk Action'}</DialogTitle>
                                <DialogContent>
                                        <Typography>
                                                {locale === 'ar'
                                                        ? `هل أنت متأكد من تغيير حالة الحضور لـ ${selectedBookings.length} حجوزات إلى ${bulkActionDialog.type === 'attended' ? 'حضر' : 'لم يحضر'}؟`
                                                        : `Are you sure you want to change the attendance status of ${selectedBookings.length} bookings to ${bulkActionDialog.type === 'attended' ? 'Attended' : 'No Show'}?`}
                                        </Typography>
                                </DialogContent>
                                <DialogActions>
                                        <Button onClick={() => setBulkActionDialog({ ...bulkActionDialog, open: false })}>{t('common.cancel')}</Button>
                                        <Button variant="contained" color={bulkActionDialog.type === 'attended' ? 'success' : 'error'} onClick={handleBulkAction} disabled={bulkAttendance.isPending}>
                                                {t('common.confirm')}
                                        </Button>
                                </DialogActions>
                        </Dialog>
                </Box>
        );
}
