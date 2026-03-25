import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
        Box, Typography, Card, CardContent, Table, TableBody, TableCell,
        TableContainer, TableHead, TableRow, Button, IconButton, Tooltip,
        Pagination, Chip, useTheme, alpha, Skeleton, Dialog,
        DialogTitle, DialogContent, DialogActions, MenuItem, TextField,
} from '@mui/material';
import {
        CheckCircle, Visibility,
        MoneyOff, EventBusy
} from '@mui/icons-material';
import dayjs from 'dayjs';
import StatusBadge from '../../../components/ui/StatusBadge';
import RevenueCards from '../components/RevenueCards';
import EmptyState from '../../../components/common/EmptyState';
import {
        useMyBookings, useAllBookings,
        useApproveBooking,
        useMarkPayment,
} from '../hooks/useBookings';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { UserRole, BookingStatus } from '../../../types';
import type { Booking } from '../../../types';

type ActionType = 'approve' | 'payment';

export default function BookingListPage() {
        const theme = useTheme();
        const navigate = useNavigate();
        const { t } = useTranslation();
        const { user } = useAuthStore();
        const { locale } = useUIStore();
        const [page, setPage] = useState(1);
        const [statusFilter, setStatusFilter] = useState<string>('');

        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;

        const filters = { page, limit: 10, ...(statusFilter && { status: statusFilter }) };
        const allBookings = useAllBookings(filters);
        const myBookings = useMyBookings(filters);
        const activeQuery = isAdmin ? allBookings : myBookings;
        const bookings = activeQuery.data?.data || [];
        const pagination = activeQuery.data?.pagination;
        const isLoading = activeQuery.isLoading;

        const approveBooking = useApproveBooking();
        const markPayment = useMarkPayment();

        const [actionDialog, setActionDialog] = useState<{
                open: boolean; type: ActionType; booking: Booking | null;
        }>({ open: false, type: 'approve', booking: null });

        const handleAction = async () => {
                const b = actionDialog.booking;
                if (!b) return;
                try {
                        switch (actionDialog.type) {
                                case 'approve': await approveBooking.mutateAsync(b.id); break;
                                case 'payment': await markPayment.mutateAsync(b.id); break;
                        }
                } catch { /* handled */ }
                setActionDialog({ open: false, type: 'approve', booking: null });
        };



        const getField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

        const getActions = (booking: Booking) => {
                const actions: Array<{ label: string; icon: React.ReactNode; type: ActionType; color: string }> = [];
                if (!isAdmin) return actions;
                if (booking.status === BookingStatus.PENDING_APPROVAL) {
                        actions.push(
                                { label: locale === 'ar' ? 'موافقة' : 'Approve', icon: <CheckCircle />, type: 'approve', color: 'info' }
                        );
                }
                if (booking.status === BookingStatus.APPROVED) {
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


                </Box>
        );
}
