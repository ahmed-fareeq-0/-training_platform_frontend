import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, useTheme, alpha, Button, Chip, CircularProgress } from '@mui/material';
import { School, EventSeat, Notifications, Star, ArrowForward, MenuBook } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import workshopService from '../../../api/services/workshop.service';

import { useUIStore } from '../../../store/uiStore';
import dayjs from 'dayjs';

export default function TraineeDashboard() {
          const theme = useTheme();
          const { locale } = useUIStore();
          const navigate = useNavigate();

          // Fetch upcoming workshops
          const { data: upcomingData, isLoading: isWorkshopsLoading } = useQuery({
                    queryKey: ['upcoming_workshops'],
                    queryFn: () => workshopService.getUpcoming({ page: 1, limit: 3 }),
          });

          const upcomingWorkshops = upcomingData?.data || [];

          const quickActions = [
                    { title: locale === 'ar' ? 'تصفح الورش' : 'Browse Workshops', icon: <School />, path: '/workshops', color: theme.palette.primary.main, desc: locale === 'ar' ? 'اكتشف الورش المتاحة وقم بالحجز' : 'Discover workshops and book your seat' },
                    { title: locale === 'ar' ? 'تصفح الدورات' : 'Browse Courses', icon: <MenuBook />, path: '/courses', color: theme.palette.secondary.main, desc: locale === 'ar' ? 'اكتشف الدورات المتاحة وسجّل فيها' : 'Discover courses and enroll' },
                    { title: locale === 'ar' ? 'حجوزاتي' : 'My Bookings', icon: <EventSeat />, path: '/bookings', color: theme.palette.info.main, desc: locale === 'ar' ? 'تتبع حالة حجوزاتك' : 'Track your booking status' },
                    { title: locale === 'ar' ? 'الإشعارات' : 'Notifications', icon: <Notifications />, path: '/notifications', color: theme.palette.warning.main, desc: locale === 'ar' ? 'تحقق من آخر التحديثات' : 'Check latest updates' },
                    { title: locale === 'ar' ? 'التقييمات' : 'Reviews', icon: <Star />, path: '/reviews', color: theme.palette.success.main, desc: locale === 'ar' ? 'قيّم الورش التي حضرتها' : 'Rate workshops you attended' },
          ];

          return (
                    <Box>

                              <Grid container spacing={3} sx={{ mb: 4 }}>
                                        {quickActions.map((action, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s ease', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${alpha(action.color, 0.15)}` } }} onClick={() => navigate(action.path)}>
                                                                      <CardContent sx={{ p: 4, flexGrow: 1 }}>
                                                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                                                                          <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(action.color, 0.1), color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(action.color, 0.2)}` }}>
                                                                                                    {action.icon}
                                                                                          </Box>
                                                                                          <Typography variant="h6" fontWeight={700}>{action.title}</Typography>
                                                                                </Box>
                                                                                <Typography variant="body2" color="text.secondary">{action.desc}</Typography>
                                                                      </CardContent>
                                                            </Card>
                                                  </Grid>
                                        ))}
                              </Grid>

                              {/* Upcoming Workshops */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h5" fontWeight={700}>
                                                  {locale === 'ar' ? 'ورش العمل القادمة' : 'Upcoming Workshops'}
                                        </Typography>
                                        <Button endIcon={<ArrowForward />} onClick={() => navigate('/workshops')}>
                                                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                                        </Button>
                              </Box>

                              {isWorkshopsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                              ) : upcomingWorkshops.length === 0 ? (
                                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                                                  <Typography color="text.secondary">
                                                            {locale === 'ar' ? 'لا توجد ورش قادمة قريباً' : 'No upcoming workshops soon'}
                                                  </Typography>
                                        </Card>
                              ) : (
                                        <Grid container spacing={3}>
                                                  {upcomingWorkshops.map((workshop: any) => (
                                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshop.id}>
                                                                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s', borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}` } }} onClick={() => navigate(`/workshops/${workshop.id}`)}>
                                                                                <Box sx={{ height: 180, bgcolor: 'grey.100', backgroundImage: `url(${workshop.image_url || 'https://via.placeholder.com/400x200?text=Workshop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                                                                          <Chip label={dayjs(workshop.date).format('DD MMM')} size="small" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'background.paper', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                                                </Box>
                                                                                <CardContent sx={{ flex: 1, p: 3 }}>
                                                                                          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                                                    {locale === 'ar' ? workshop.title_ar : workshop.title_en}
                                                                                          </Typography>
                                                                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                                                    {locale === 'ar' ? workshop.description_ar : workshop.description_en}
                                                                                          </Typography>
                                                                                          <Box sx={{ mt: 'auto' }}>
                                                                                                    <Button variant="outlined" fullWidth sx={{ borderRadius: '50px', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); navigate(`/workshops/${workshop.id}`); }}>
                                                                                                              {locale === 'ar' ? 'التفاصيل' : 'Details'}
                                                                                                    </Button>
                                                                                          </Box>
                                                                                </CardContent>
                                                                      </Card>
                                                            </Grid>
                                                  ))}
                                        </Grid>
                              )}
                    </Box>
          );
}
