import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, useTheme, alpha, Button, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { School, Notifications, ArrowForward, Info } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../../store/uiStore';
import { useMyWorkshops } from '../../workshops/hooks/useWorkshops';
import { trainerService } from '../../../api/services/admin.service';

export default function TrainerDashboard() {
          const theme = useTheme();
          const { locale } = useUIStore();
          const navigate = useNavigate();

          // Fetch trainer's workshops
          const { data: myWorkshopsData, isLoading: isWorkshopsLoading } = useMyWorkshops({ page: 1, limit: 3 });
          const myWorkshops = myWorkshopsData?.data || [];

          // Fetch trainer profile to check approval/completion status
          const { data: trainerProfile } = useQuery({
                    queryKey: ['trainerProfile', 'me'],
                    queryFn: () => trainerService.getMe()
          });

          const isPendingApproval = trainerProfile && !trainerProfile.is_approved;

          const quickActions = [
                    { title: locale === 'ar' ? 'الورش الخاصة بي' : 'My Workshops', icon: <School />, path: '/workshops', color: theme.palette.primary.main, desc: locale === 'ar' ? 'قم بإدارة ورشك التدريبية' : 'Manage your training workshops' },
                    { title: locale === 'ar' ? 'الإشعارات' : 'Notifications', icon: <Notifications />, path: '/notifications', color: theme.palette.warning.main, desc: locale === 'ar' ? 'تحقق من آخر التحديثات' : 'Check latest updates' },
          ];

          return (
                    <Box>
                              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
                                        {locale === 'ar' ? 'لوحة تحكم المدرب' : 'Trainer Dashboard'}
                              </Typography>

                              {isPendingApproval && (
                                        <Alert severity="info" icon={<Info />} sx={{ mb: 4, borderRadius: 3 }}>
                                                  <AlertTitle>{locale === 'ar' ? 'في انتظار الموافقة' : 'Pending Approval'}</AlertTitle>
                                                  {locale === 'ar' ? 'حسابك كمدرب قيد المراجعة حالياً من قبل الإدارة. سيتم إشعارك فور الموافقة.' : 'Your trainer account is currently under review by the administration. You will be notified upon approval.'}
                                        </Alert>
                              )}

                              <Grid container spacing={3} sx={{ mb: 4 }}>
                                        {quickActions.map((action, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
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
                                                  {locale === 'ar' ? 'ورشي القادمة' : 'My Upcoming Workshops'}
                                        </Typography>
                                        <Button endIcon={<ArrowForward />} onClick={() => navigate('/workshops')}>
                                                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                                        </Button>
                              </Box>

                              {isWorkshopsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                              ) : myWorkshops.length === 0 ? (
                                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                                                  <Typography color="text.secondary">
                                                            {locale === 'ar' ? 'لا توجد لك ورش عمل حالياً' : 'You do not have any workshops right now'}
                                                  </Typography>
                                        </Card>
                              ) : (
                                        <Grid container spacing={3}>
                                                  {myWorkshops.map((workshop: any) => (
                                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshop.id}>
                                                                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s', borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}` } }} onClick={() => navigate(`/workshops/${workshop.id}`)}>
                                                                                <Box sx={{ height: 180, bgcolor: 'grey.100', backgroundImage: `url(${workshop.image_url || 'https://via.placeholder.com/400x200?text=Workshop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
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
                                                                                                              {locale === 'ar' ? 'إدارة التواجد والتفاصيل' : 'Manage Attendance & Details'}
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
