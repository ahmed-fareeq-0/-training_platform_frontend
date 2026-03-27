import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import { DoneAll } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { useNotifications, useUnreadCount, useNotificationMutations } from '../hooks/useNotifications';
import NotificationList from '../components/NotificationList';

export default function NotificationsPage() {
    const { t } = useTranslation();
    const { locale } = useUIStore();
    const [page] = useState(1);

    const { data, isLoading } = useNotifications(page, 30);
    const { data: unread } = useUnreadCount();
    const { markAllRead } = useNotificationMutations();

    const notifications = data?.data || [];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight={700}>{t('nav.notifications')}</Typography>
                    {(unread?.count ?? 0) > 0 && (
                        <Chip
                            label={`${unread?.count} ${locale === 'ar' ? 'غير مقروء' : 'unread'}`}
                            color="error"
                            size="small"
                        />
                    )}
                </Box>
                <Button
                    startIcon={<DoneAll />}
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                >
                    {locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </Button>
            </Box>

            <Card>
                <NotificationList notifications={notifications} isLoading={isLoading} />
            </Card>
        </Box>
    );
}
