import {
          Box, Card, CardContent, Typography, Grid,
          Skeleton, useTheme, alpha,
} from '@mui/material';
import {
          TrendingUp, TrendingDown, AccountBalance, PercentOutlined,
} from '@mui/icons-material';
import { useRevenue } from '../hooks/useBookings';
import { useUIStore } from '../../../store/uiStore';

export default function RevenueCards() {
          const theme = useTheme();
          const { locale } = useUIStore();
          const { data: revenue, isLoading } = useRevenue();

          if (isLoading) {
                    return (
                              <Grid container spacing={3} sx={{ mb: 4 }}>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                                                            <Card><CardContent><Skeleton height={80} /></CardContent></Card>
                                                  </Grid>
                                        ))}
                              </Grid>
                    );
          }

          if (!revenue) return null;

          const cards = [
                    {
                              title: locale === 'ar' ? 'الإيرادات المتوقعة' : 'Expected Revenue',
                              value: `${Number(revenue.expected_revenue || 0).toLocaleString()} IQD`,
                              icon: <TrendingUp />,
                              gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)}, ${alpha(theme.palette.info.light, 0.05)})`,
                              iconColor: theme.palette.info.main,
                    },
                    {
                              title: locale === 'ar' ? 'الإيرادات الفعلية' : 'Actual Revenue',
                              value: `${Number(revenue.actual_revenue || 0).toLocaleString()} IQD`,
                              icon: <AccountBalance />,
                              gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)}, ${alpha(theme.palette.success.light, 0.05)})`,
                              iconColor: theme.palette.success.main,
                    },
                    {
                              title: locale === 'ar' ? 'نسبة التحصيل' : 'Collection Rate',
                              value: `${Number(revenue.collection_rate || 0).toFixed(1)}%`,
                              icon: <PercentOutlined />,
                              gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.light, 0.05)})`,
                              iconColor: theme.palette.primary.main,
                    },
                    {
                              title: locale === 'ar' ? 'نسبة عدم الحضور' : 'No-Show Rate',
                              value: `${Number(revenue.no_show_rate || 0).toFixed(1)}%`,
                              icon: <TrendingDown />,
                              gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.error.light, 0.05)})`,
                              iconColor: theme.palette.error.main,
                    },
          ];

          return (
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                              {cards.map((card, i) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                                                  <Card
                                                            sx={{
                                                                      background: card.gradient,
                                                                      border: 'none',
                                                                      transition: 'all 0.3s ease',
                                                                      '&:hover': { transform: 'translateY(-2px)' },
                                                            }}
                                                  >
                                                            <CardContent sx={{ p: 3 }}>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                                <Box>
                                                                                          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                                                                                                    {card.title}
                                                                                          </Typography>
                                                                                          <Typography variant="h5" fontWeight={800}>
                                                                                                    {card.value}
                                                                                          </Typography>
                                                                                </Box>
                                                                                <Box
                                                                                          sx={{
                                                                                                    width: 44, height: 44, borderRadius: 2,
                                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                                    bgcolor: alpha(card.iconColor, 0.12),
                                                                                                    color: card.iconColor,
                                                                                          }}
                                                                                >
                                                                                          {card.icon}
                                                                                </Box>
                                                                      </Box>
                                                                      {/* Sub-stats */}
                                                                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                          {locale === 'ar' ? 'الحجوزات' : 'Bookings'}: {revenue.total_bookings || 0}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                          {locale === 'ar' ? 'مدفوع' : 'Paid'}: {revenue.paid_bookings || 0}
                                                                                </Typography>
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              ))}
                    </Grid>
          );
}
