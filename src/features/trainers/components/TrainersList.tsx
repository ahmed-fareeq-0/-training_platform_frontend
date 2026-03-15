import { Grid, Box, Typography, Card, CardContent, Avatar, Chip, Button, Skeleton, useTheme, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, School } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { useTrainerMutations } from '../hooks/useTrainers';
import type { Trainer } from '../../../types';

interface TrainersListProps {
          trainers: Trainer[];
          isLoading: boolean;
}

export default function TrainersList({ trainers, isLoading }: TrainersListProps) {
          const theme = useTheme();
          const { locale } = useUIStore();
          const mutations = useTrainerMutations();

          if (isLoading) {
                    return (
                              <Grid container spacing={3}>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                            <Card>
                                                                      <CardContent>
                                                                                <Skeleton height={180} />
                                                                      </CardContent>
                                                            </Card>
                                                  </Grid>
                                        ))}
                              </Grid>
                    );
          }

          if (trainers.length === 0) {
                    return (
                              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                                        <Typography>{locale === 'ar' ? 'لا يوجد مدربون' : 'No trainers found'}</Typography>
                              </Box>
                    );
          }

          return (
                    <Grid container spacing={3}>
                              {trainers.map((trainer) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trainer.id}>
                                                  <Card sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)' } }}>
                                                            <CardContent sx={{ p: 3 }}>
                                                                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                                                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main, fontSize: 20 }}>
                                                                                          {(trainer.user?.full_name || trainer.full_name || 'U').charAt(0).toUpperCase()}
                                                                                </Avatar>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                          <Typography fontWeight={600}>{trainer.user?.full_name || trainer.full_name}</Typography>
                                                                                          <Typography variant="caption" color="text.secondary">{trainer.user?.email || 'N/A'}</Typography>
                                                                                          <Box sx={{ mt: 0.5 }}>
                                                                                                    <Chip
                                                                                                              label={trainer.is_approved ? (locale === 'ar' ? 'معتمد' : 'Approved') : (locale === 'ar' ? 'في الانتظار' : 'Pending')}
                                                                                                              size="small"
                                                                                                              color={trainer.is_approved ? 'success' : 'warning'}
                                                                                                              icon={trainer.is_approved ? <CheckCircle /> : undefined}
                                                                                                    />
                                                                                          </Box>
                                                                                </Box>
                                                                      </Box>

                                                                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                                                {trainer.specialization && (
                                                                                          <Chip
                                                                                                    icon={<School />}
                                                                                                    label={locale === 'ar' ? trainer.specialization.name_ar : trainer.specialization.name_en}
                                                                                                    size="small"
                                                                                                    variant="outlined"
                                                                                          />
                                                                                )}
                                                                                {trainer.years_of_experience != null && (
                                                                                          <Chip
                                                                                                    label={`${trainer.years_of_experience} ${locale === 'ar' ? 'سنوات' : 'yrs'}`}
                                                                                                    size="small"
                                                                                                    variant="outlined"
                                                                                          />
                                                                                )}
                                                                      </Box>

                                                                      {(trainer.bio || trainer.bio_en || trainer.bio_ar) && (
                                                                                <Typography
                                                                                          variant="body2"
                                                                                          color="text.secondary"
                                                                                          sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                                                                >
                                                                                          {locale === 'ar' ? (trainer.bio_ar || trainer.bio || trainer.bio_en) : (trainer.bio_en || trainer.bio || trainer.bio_ar)}
                                                                                </Typography>
                                                                      )}

                                                                      {!trainer.is_approved && (
                                                                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                                                                          <Button
                                                                                                    variant="contained"
                                                                                                    color="success"
                                                                                                    size="small"
                                                                                                    startIcon={<CheckCircle />}
                                                                                                    onClick={() => mutations.approve.mutate(trainer.id)}
                                                                                                    disabled={mutations.approve.isPending}
                                                                                                    fullWidth
                                                                                          >
                                                                                                    {locale === 'ar' ? 'موافقة' : 'Approve'}
                                                                                          </Button>
                                                                                          <Button
                                                                                                    variant="outlined"
                                                                                                    color="error"
                                                                                                    size="small"
                                                                                                    startIcon={<Cancel />}
                                                                                                    onClick={() => mutations.reject.mutate(trainer.id)}
                                                                                                    disabled={mutations.reject.isPending}
                                                                                                    fullWidth
                                                                                          >
                                                                                                    {locale === 'ar' ? 'رفض' : 'Reject'}
                                                                                          </Button>
                                                                                </Box>
                                                                      )}

                                                                      {/* SuperAdmin hard delete action */}
                                                                      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                                                                                <Tooltip title={locale === 'ar' ? 'حذف' : 'Delete'}>
                                                                                          <Box component="span">
                                                                                                    <Button
                                                                                                              variant="outlined"
                                                                                                              color="error"
                                                                                                              size="small"
                                                                                                              sx={{ minWidth: 'auto', p: 1 }}
                                                                                                              onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        if (window.confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المدرب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to hard delete this trainer? This action cannot be undone.')) {
                                                                                                                                  mutations.remove.mutate(trainer.id);
                                                                                                                        }
                                                                                                              }}
                                                                                                              disabled={mutations.remove.isPending}
                                                                                                    >
                                                                                                              <Cancel fontSize="small" />
                                                                                                    </Button>
                                                                                          </Box>
                                                                                </Tooltip>
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              ))}
                    </Grid>
          );
}
