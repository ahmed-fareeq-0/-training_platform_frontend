import { useState } from 'react';
import {
  Grid, Box, Typography, Card, CardContent, Avatar, Chip,
  Button, Skeleton, useTheme, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Divider, useMediaQuery
} from '@mui/material';
import { CheckCircle, Cancel, School, Visibility, Close, Email, Phone, Work, Category, AssignmentInd, BusinessCenter } from '@mui/icons-material';
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

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

  const handleClose = () => setSelectedTrainer(null);

  return (
    <>
      <Grid container spacing={3}>
        {trainers.map((trainer) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trainer.id}>
            <Card sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)' }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main, fontSize: 20 }}>
                    {(trainer.user?.full_name || trainer.full_name || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography fontWeight={600} sx={{ mb: 0, lineHeight: 1.2 }}>{trainer.user?.full_name || trainer.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>{(trainer.user?.email || (trainer as any).email) || 'N/A'}</Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {trainer.trainer_type && (
                        <Chip
                          label={trainer.trainer_type === 'professional' ? (locale === 'ar' ? 'مدرب محترف' : 'Professional Trainer') : (locale === 'ar' ? 'أستاذ جامعي' : 'University Professor')}
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={<AssignmentInd fontSize="small" />}
                        />
                      )}
                      {(trainer.experience_years != null || trainer.years_of_experience != null) && (
                        <Chip
                          label={`${trainer.experience_years ?? trainer.years_of_experience} ${locale === 'ar' ? 'سنوات خبرة' : 'yrs experience'}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {trainer.specialization && (
                    <Chip
                      icon={<Category fontSize="small" />}
                      label={locale === 'ar' ? trainer.specialization.name_ar : trainer.specialization.name_en}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {!trainer.is_approved && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedTrainer(trainer)}
                    fullWidth
                  >
                    {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </Button>
                </Box>

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

      {/* Trainer Details Dialog */}
      <Dialog
        open={Boolean(selectedTrainer)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        {selectedTrainer && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {locale === 'ar' ? 'تفاصيل المدرب / طلب الانضمام' : 'Trainer Details / Application'}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, md: 4 } }}>
              <Grid container spacing={4}>
                {/* Section 1: Basic Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main, fontSize: 36, mx: 'auto', mb: 2 }}>
                      {((selectedTrainer.user?.full_name || selectedTrainer.full_name || 'U')).charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedTrainer.user?.full_name || selectedTrainer.full_name}
                    </Typography>
                    <Chip
                      label={selectedTrainer.trainer_type === 'professional' ? (locale === 'ar' ? 'مدرب محترف' : 'Professional Trainer') : (locale === 'ar' ? 'أستاذ جامعي' : 'University Professor')}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    {locale === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{(selectedTrainer.user?.email || (selectedTrainer as any).email) || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" dir="ltr" sx={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                        {(selectedTrainer.user?.phone || (selectedTrainer as any).phone) || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    {locale === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={selectedTrainer.is_approved ? (locale === 'ar' ? 'حساب معتمد' : 'Approved Account') : (locale === 'ar' ? 'بانتظار المراجعة' : 'Pending Review')}
                      size="small"
                      color={selectedTrainer.is_approved ? 'success' : 'warning'}
                      icon={selectedTrainer.is_approved ? <CheckCircle /> : undefined}
                    />
                  </Box>
                </Grid>

                {/* Section 2: Professional Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessCenter color="primary" />
                    {locale === 'ar' ? 'التفاصيل المهنية والأكاديمية' : 'Professional & Academic Details'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        {locale === 'ar' ? 'سنوات الخبرة' : 'Experience Years'}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedTrainer.experience_years ?? selectedTrainer.years_of_experience ?? '0'} {locale === 'ar' ? 'سنوات' : 'years'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        {locale === 'ar' ? 'التخصص / الفئة' : 'Specialization / Category'}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {(selectedTrainer.specialization ? (locale === 'ar' ? selectedTrainer.specialization.name_ar : selectedTrainer.specialization.name_en) : null) ||
                          ((selectedTrainer as any).specialization_name_ar ? (locale === 'ar' ? (selectedTrainer as any).specialization_name_ar : (selectedTrainer as any).specialization_name_en) : 'N/A')}
                      </Typography>
                    </Grid>

                    {selectedTrainer.trainer_type === 'professional' ? (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            {locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>{selectedTrainer.job_title || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            {locale === 'ar' ? 'المهارات الأساسية' : 'Core Skills'}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>{selectedTrainer.core_skills || 'N/A'}</Typography>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            {locale === 'ar' ? 'اللقب العلمي' : 'Academic Title'}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedTrainer.academic_title === 'lecturer' ? (locale === 'ar' ? 'مدرس' : 'Lecturer')
                              : selectedTrainer.academic_title === 'assistant_professor' ? (locale === 'ar' ? 'أستاذ مساعد' : 'Assistant Professor')
                                : selectedTrainer.academic_title === 'associate_professor' ? (locale === 'ar' ? 'أستاذ مشارك' : 'Associate Professor')
                                  : selectedTrainer.academic_title === 'professor' ? (locale === 'ar' ? 'أستاذ' : 'Professor')
                                    : (selectedTrainer.academic_title || 'N/A')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            {locale === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedTrainer.academic_degree === 'bachelor' ? (locale === 'ar' ? 'بكالوريوس' : 'Bachelor')
                              : selectedTrainer.academic_degree === 'master' ? (locale === 'ar' ? 'ماجستير' : 'Master')
                                : selectedTrainer.academic_degree === 'phd' ? (locale === 'ar' ? 'دكتوراه' : 'PhD')
                                  : (selectedTrainer.academic_degree || 'N/A')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">
                            {locale === 'ar' ? 'التخصص الأكاديمي' : 'Academic Specialization'}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>{selectedTrainer.academic_specialization || 'N/A'}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>

                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="primary" />
                    {locale === 'ar' ? 'النبذة التعريفية (Bio)' : 'Biography'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {locale === 'ar' ? (selectedTrainer.bio_ar || selectedTrainer.bio || selectedTrainer.bio_en || 'لا توجد نبذة تعريفية') : (selectedTrainer.bio_en || selectedTrainer.bio || selectedTrainer.bio_ar || 'No biography provided')}
                    </Typography>
                  </Box>

                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleClose} color="inherit">
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </Button>

              {!selectedTrainer.is_approved && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      mutations.reject.mutate(selectedTrainer.id);
                      handleClose();
                    }}
                    disabled={mutations.reject.isPending}
                  >
                    {locale === 'ar' ? 'رفض الطلب' : 'Reject Application'}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      mutations.approve.mutate(selectedTrainer.id);
                      handleClose();
                    }}
                    disabled={mutations.approve.isPending}
                  >
                    {locale === 'ar' ? 'موافقة الطلب' : 'Approve Application'}
                  </Button>
                </Box>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
