import { Box, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import { useUIStore } from '../../../store/uiStore';
import { useAllStatistics } from '../hooks/useStatistics';
import StatCards from '../components/StatCards';
import ChartComponents from '../components/ChartComponents';

export default function StatisticsPage() {
          const { locale } = useUIStore();

          const { dashboard, trainerStats, isLoading } = useAllStatistics();

          if (isLoading) {
                    return (
                              <Box>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                                  {locale === 'ar' ? 'الإحصائيات' : 'Statistics'}
                                        </Typography>
                                        <Grid container spacing={3}>
                                                  {Array.from({ length: 6 }).map((_, i) => (
                                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                                      <Card><CardContent><Skeleton height={100} /></CardContent></Card>
                                                            </Grid>
                                                  ))}
                                        </Grid>
                              </Box>
                    );
          }

          return (
                    <Box>
                              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                                        {locale === 'ar' ? 'الإحصائيات والتقارير' : 'Statistics & Reports'}
                              </Typography>

                              <StatCards dashboard={dashboard} />

                              <ChartComponents dashboard={dashboard} trainerStats={trainerStats} />
                    </Box>
          );
}
