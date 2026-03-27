import { Grid, Card, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUIStore } from '../../../store/uiStore';

interface ChartComponentsProps {
    dashboard: Record<string, any>;
    trainerStats: Record<string, any>;
}

export default function ChartComponents({ dashboard, trainerStats }: ChartComponentsProps) {
    const theme = useTheme();
    const { locale } = useUIStore();

    const workshopChartData = [
        { name: locale === 'ar' ? 'مسودة' : 'Draft', value: dashboard.workshops?.draft || 0 },
        { name: locale === 'ar' ? 'مجدولة' : 'Scheduled', value: dashboard.workshops?.scheduled || 0 },
        { name: locale === 'ar' ? 'جارية' : 'Ongoing', value: dashboard.workshops?.ongoing || 0 },
        { name: locale === 'ar' ? 'مكتملة' : 'Completed', value: dashboard.workshops?.completed || 0 },
    ];

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        {locale === 'ar' ? 'توزيع الورش حسب الحالة' : 'Workshop Distribution'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workshopChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        {locale === 'ar' ? 'ملخص المدربين' : 'Trainers Summary'}
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" fontWeight={800} color="primary">
                            {trainerStats?.total || 0}
                        </Typography>
                        <Typography color="text.secondary">
                            {locale === 'ar' ? 'مدرب مسجل' : 'Registered Trainers'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="success.main">
                                    {trainerStats?.approved || 0}
                                </Typography>
                                <Typography variant="caption">
                                    {locale === 'ar' ? 'معتمد' : 'Approved'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="warning.main">
                                    {trainerStats?.pending || 0}
                                </Typography>
                                <Typography variant="caption">
                                    {locale === 'ar' ? 'في الانتظار' : 'Pending'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}
