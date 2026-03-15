import {
          Grid, Card, CardContent, Skeleton, Box, Typography,
          IconButton, Tooltip, Chip, Switch, useTheme, alpha
} from '@mui/material';
import { Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { useSpecializationMutations } from '../hooks/useSpecializations';
import type { Specialization } from '../../../types';

interface SpecializationsListProps {
          specializations: Specialization[];
          isLoading: boolean;
          onEdit: (spec: Specialization) => void;
}

export default function SpecializationsList({ specializations, isLoading, onEdit }: SpecializationsListProps) {
          const theme = useTheme();
          const { locale } = useUIStore();
          const mutations = useSpecializationMutations();

          const getField = (ar: string, en: string) => locale === 'ar' ? ar : en;

          if (isLoading) {
                    return (
                              <Grid container spacing={3}>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                            <Card>
                                                                      <CardContent>
                                                                                <Skeleton height={120} />
                                                                      </CardContent>
                                                            </Card>
                                                  </Grid>
                                        ))}
                              </Grid>
                    );
          }

          return (
                    <Grid container spacing={3}>
                              {specializations.map((spec: Specialization) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spec.id}>
                                                  <Card sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)' } }}>
                                                            <CardContent sx={{ p: 3 }}>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                                <Box sx={{
                                                                                          width: 44,
                                                                                          height: 44,
                                                                                          borderRadius: 2,
                                                                                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                          color: theme.palette.primary.main,
                                                                                          display: 'flex',
                                                                                          alignItems: 'center',
                                                                                          justifyContent: 'center',
                                                                                          fontSize: '1.4rem'
                                                                                }}>
                                                                                          {spec.icon || '📚'}
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                          <Tooltip title={locale === 'ar' ? 'تعديل' : 'Edit'}>
                                                                                                    <IconButton size="small" onClick={() => onEdit(spec)}>
                                                                                                              <Edit fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                          <Tooltip title={locale === 'ar' ? 'حذف' : 'Delete'}>
                                                                                                    <IconButton
                                                                                                              size="small"
                                                                                                              color="error"
                                                                                                              onClick={() => mutations.remove.mutate(spec.id)}
                                                                                                              disabled={mutations.remove.isPending}
                                                                                                    >
                                                                                                              <Delete fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                </Box>
                                                                      </Box>
                                                                      <Typography variant="h6" fontWeight={600} gutterBottom>
                                                                                {getField(spec.name_ar, spec.name_en)}
                                                                      </Typography>
                                                                      <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                sx={{ mb: 2, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                                                      >
                                                                                {getField(spec.description_ar || '', spec.description_en || '') || '—'}
                                                                      </Typography>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                <Chip
                                                                                          label={spec.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
                                                                                          color={spec.is_active ? 'success' : 'default'}
                                                                                          size="small"
                                                                                          icon={spec.is_active ? <CheckCircle /> : <Cancel />}
                                                                                />
                                                                                <Switch
                                                                                          checked={spec.is_active}
                                                                                          size="small"
                                                                                          onChange={() => mutations.toggle.mutate({ id: spec.id, active: spec.is_active })}
                                                                                          disabled={mutations.toggle.isPending}
                                                                                />
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              ))}
                    </Grid>
          );
}
