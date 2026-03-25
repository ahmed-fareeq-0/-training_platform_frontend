import { Grid, Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { People, School, EventSeat, TrendingUp, CalendarMonth } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';

interface StatCardsProps {
          dashboard: Record<string, any>;
}

export default function StatCards({ dashboard }: StatCardsProps) {
          const theme = useTheme();
          const { locale } = useUIStore();

          const kpis = [
                    {
                              label: locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
                              value: dashboard.users?.total || 0,
                              icon: <People />,
                              color: theme.palette.primary.main
                    },
                    {
                              label: locale === 'ar' ? 'إجمالي الورش' : 'Total Workshops',
                              value: dashboard.workshops?.total || 0,
                              icon: <School />,
                              color: theme.palette.secondary.main
                    },
                    {
                              label: locale === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings',
                              value: dashboard.bookings?.total || 0,
                              icon: <EventSeat />,
                              color: theme.palette.info.main
                    },
                    {
                              label: locale === 'ar' ? 'الإيرادات' : 'Revenue',
                              value: `${Number(dashboard.revenue?.actual || 0).toLocaleString()} IQD`,
                              icon: <TrendingUp />,
                              color: theme.palette.success.main
                    },
                    {
                              label: locale === 'ar' ? 'هذا الشهر' : 'This Month',
                              value: dashboard.workshops?.this_month || 0,
                              icon: <CalendarMonth />,
                              color: theme.palette.warning.main
                    },
          ];

          return (
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                              {kpis.map((kpi, i) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                  <Card sx={{
                                                            background: `linear-gradient(135deg, ${alpha(kpi.color, 0.12)}, ${alpha(kpi.color, 0.04)})`,
                                                            transition: 'all 0.3s',
                                                            '&:hover': { transform: 'translateY(-3px)' }
                                                  }}>
                                                            <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                      <Box>
                                                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>{kpi.label}</Typography>
                                                                                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{kpi.value}</Typography>
                                                                      </Box>
                                                                      <Box sx={{
                                                                                width: 48,
                                                                                height: 48,
                                                                                borderRadius: 2,
                                                                                bgcolor: alpha(kpi.color, 0.15),
                                                                                color: kpi.color,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                      }}>
                                                                                {kpi.icon}
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              ))}
                    </Grid>
          );
}
