import {
    CardContent, List, ListItem, ListItemText,
    ListItemIcon, IconButton, Skeleton, Chip, Divider,
    Typography, Box, useTheme, alpha
} from '@mui/material';
import { Notifications, CheckCircle, Delete, Circle } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useUIStore } from '../../../store/uiStore';
import { useNotificationMutations } from '../hooks/useNotifications';

dayjs.extend(relativeTime);

interface NotificationListProps {
    notifications: any[];
    isLoading: boolean;
}

export default function NotificationList({ notifications, isLoading }: NotificationListProps) {
    const theme = useTheme();
    const { locale } = useUIStore();
    const { markRead, remove } = useNotificationMutations();

    if (isLoading) {
        return (
            <CardContent>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                ))}
            </CardContent>
        );
    }

    if (notifications.length === 0) {
        return (
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Notifications sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                    {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </Typography>
            </CardContent>
        );
    }

    return (
        <List disablePadding>
            {notifications.map((notif: any, idx: number) => (
                <Box key={notif.id}>
                    {idx > 0 && <Divider />}
                    <ListItem
                        sx={{
                            px: 3, py: 2,
                            bgcolor: notif.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                            transition: 'all 0.2s',
                        }}
                        secondaryAction={
                            <Box>
                                {!notif.is_read && (
                                    <IconButton
                                        size="small"
                                        onClick={() => markRead.mutate(notif.id)}
                                        sx={{ mr: 0.5 }}
                                    >
                                        <CheckCircle fontSize="small" color="primary" />
                                    </IconButton>
                                )}
                                <IconButton
                                    size="small"
                                    onClick={() => remove.mutate(notif.id)}
                                >
                                    <Delete fontSize="small" color="error" />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Circle sx={{ fontSize: 10, color: notif.is_read ? 'text.disabled' : 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography fontWeight={notif.is_read ? 400 : 600} variant="body2">
                                    {notif.title || notif.message}
                                </Typography>
                            }
                            secondary={
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {dayjs(notif.created_at).fromNow()}
                                    </Typography>
                                    <Chip
                                        label={notif.type?.replace(/_/g, ' ')}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                </Box>
                            }
                        />
                    </ListItem>
                </Box>
            ))}
        </List>
    );
}
