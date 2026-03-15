import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Grid, Card, CardContent, useTheme, alpha, Skeleton,
} from '@mui/material';
import { People, School, EventSeat, AttachMoney, TrendingUp, Category } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../../../api/services/admin.service';
import { useUIStore } from '../../../store/uiStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
          const theme = useTheme();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: statisticsService.getDashboard });

          if (isLoading) {
                    return (
                              <Box>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>{t('dashboard.overview')}</Typography>
                                        <Grid container spacing={3}>
                                                  {Array.from({ length: 6 }).map((_, i) => (
                                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}><Card><CardContent><Skeleton height={100} /></CardContent></Card></Grid>
                                                  ))}
                                        </Grid>
                              </Box>
                    );
          }

          const d = (stats?.data as Record<string, any>) || {};
          const users = d.users || {};
          const workshops = d.workshops || {};
          const bookings = d.bookings || {};
          const revenue = d.revenue || {};

          const overviewCards = [
                    { title: t('dashboard.totalUsers'), value: users.total_users || 0, icon: <People />, color: theme.palette.primary.main },
                    { title: t('dashboard.totalWorkshops'), value: workshops.total_workshops || 0, icon: <School />, color: theme.palette.secondary.main },
                    { title: t('dashboard.totalBookings'), value: bookings.total_bookings || 0, icon: <EventSeat />, color: theme.palette.info.main },
                    { title: t('dashboard.expectedRevenue'), value: `${Number(revenue.expected_revenue || 0).toLocaleString()} SAR`, icon: <TrendingUp />, color: theme.palette.warning.main },
                    { title: t('dashboard.actualRevenue'), value: `${Number(revenue.actual_revenue || 0).toLocaleString()} SAR`, icon: <AttachMoney />, color: theme.palette.success.main },
                    { title: t('dashboard.collectionRate'), value: `${Number(revenue.collection_rate || 0).toFixed(1)}%`, icon: <Category />, color: theme.palette.error.main },
          ];



          const workshopStatusData = [
                    { name: locale === 'ar' ? 'مجدولة/قادمة' : 'Upcoming', count: workshops.upcoming_workshops || 0 },
                    { name: locale === 'ar' ? 'جارية' : 'Ongoing', count: workshops.ongoing_workshops || 0 },
                    { name: locale === 'ar' ? 'مكتملة' : 'Completed', count: workshops.completed_workshops || 0 },
          ];

          return (
                    <Box>
                              <Grid container spacing={3} sx={{ mb: 4 }}>
                                        {overviewCards.map((card, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                            <Card sx={{
                                                                      borderRadius: '24px',
                                                                      border: `1px solid ${theme.palette.divider}`,
                                                                      transition: 'all 0.3s ease',
                                                                      '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${alpha(card.color, 0.15)}` },
                                                                      background: theme.palette.mode === 'dark' ? alpha(card.color, 0.05) : '#ffffff',
                                                            }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                                          <Box>
                                                                                                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.title}</Typography>
                                                                                                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: 'text.primary' }}>{card.value}</Typography>
                                                                                          </Box>
                                                                                          <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(card.color, 0.1), color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(card.color, 0.2)}` }}>
                                                                                                    {card.icon}
                                                                                          </Box>
                                                                                </Box>
                                                                      </CardContent>
                                                            </Card>
                                                  </Grid>
                                        ))}
                              </Grid>

                              <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                                  <Card sx={{ p: 4, borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                                                                      {locale === 'ar' ? 'حالة الورش التدريبية' : 'Workshop Status Overview'}
                                                            </Typography>
                                                            <ResponsiveContainer width="100%" height={300}>
                                                                      <BarChart data={workshopStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} vertical={false} />
                                                                                <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                                                                                <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                                                                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`, fontWeight: 600 }} cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }} />
                                                                                <Bar dataKey="count" fill={theme.palette.primary.main} radius={[8, 8, 8, 8]} barSize={40} />
                                                                      </BarChart>
                                                            </ResponsiveContainer>
                                                  </Card>
                                        </Grid>
                              </Grid>
                    </Box>
          );
}
