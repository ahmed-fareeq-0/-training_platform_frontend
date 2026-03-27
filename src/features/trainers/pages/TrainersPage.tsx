import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip } from '@mui/material';
import { useUIStore } from '../../../store/uiStore';
import { useTrainers } from '../hooks/useTrainers';
import TrainersList from '../components/TrainersList';

export default function TrainersPage() {
    const { locale } = useUIStore();
    const [tab, setTab] = useState(0);

    const { allQuery, pendingQuery } = useTrainers();

    const allData = allQuery.data;
    const loadingAll = allQuery.isLoading;

    const pendingData = pendingQuery.data;
    const loadingPending = pendingQuery.isLoading;

    const trainers = tab === 0 ? (allData?.data || []) : (pendingData?.data || []);
    const isLoading = tab === 0 ? loadingAll : loadingPending;

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                {locale === 'ar' ? 'إدارة المدربين' : 'Trainers Management'}
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label={locale === 'ar' ? 'الكل' : 'All Trainers'} />
                <Tab
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {locale === 'ar' ? 'في الانتظار' : 'Pending'}
                            {(pendingData?.data?.length || 0) > 0 && (
                                <Chip label={pendingData?.data?.length} size="small" color="warning" />
                            )}
                        </Box>
                    }
                />
            </Tabs>

            <TrainersList trainers={trainers} isLoading={isLoading} />
        </Box>
    );
}
