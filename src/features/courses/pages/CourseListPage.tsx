import React, { useState } from 'react';
import {
          Box, Typography, Grid, CircularProgress, TextField, InputAdornment,
          MenuItem, Pagination, Button, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { usePublishedCourses } from '../hooks/useCourses';
import { useSpecializations } from '../../specializations/hooks/useSpecializations';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import CourseCard from '../components/CourseCard';
import { Course, UserRole } from '../../../types';

const CourseListPage: React.FC = () => {
          const navigate = useNavigate();
          const { user } = useAuthStore();
          const { locale } = useUIStore();
          const [page, setPage] = useState(1);
          const [search, setSearch] = useState('');
          const [specFilter, setSpecFilter] = useState('');

          const { data, isLoading } = usePublishedCourses({
                    page,
                    limit: 12,
                    specialization_id: specFilter || undefined,
          });
          const { data: specializations } = useSpecializations();

          const courses: Course[] = data?.data || [];
          const totalPages = data?.pagination?.totalPages || 1;
          const specList = (specializations as any)?.data || specializations || [];

          const isAdminOrTrainer = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.TRAINER;

          const filtered = search
                    ? courses.filter((c: Course) =>
                              c.title_ar.includes(search) || c.title_en.toLowerCase().includes(search.toLowerCase())
                    )
                    : courses;

          return (
                    <Box>
                              {/* Constrained Header Card */}
                              <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                                            <Box>
                                                                      <Typography variant="h4" fontWeight={700} gutterBottom>
                                                                                {locale === 'ar' ? 'الدورات التدريبية' : 'Online Courses'}
                                                                      </Typography>
                                                                      <Typography variant="body1" color="text.secondary">
                                                                                {locale === 'ar' ? 'تصفح الدورات المتاحة وابدأ رحلتك التعليمية' : 'Browse available courses and start learning'}
                                                                      </Typography>
                                                            </Box>
                                                            {isAdminOrTrainer && (
                                                                      <Button
                                                                                variant="contained"
                                                                                startIcon={<SettingsIcon />}
                                                                                onClick={() => navigate('/courses/manage')}
                                                                                sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
                                                                      >
                                                                                {locale === 'ar' ? 'إدارة الدورات' : 'Manage Courses'}
                                                                      </Button>
                                                            )}
                                                  </Box>

                                                  {/* Filters */}
                                                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                                                            <TextField
                                                                      placeholder={locale === 'ar' ? 'ابحث عن دورة...' : 'Search courses...'}
                                                                      value={search}
                                                                      onChange={(e) => setSearch(e.target.value)}
                                                                      sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
                                                                      slotProps={{
                                                                                input: {
                                                                                          startAdornment: (
                                                                                                    <InputAdornment position="start">
                                                                                                              <SearchIcon />
                                                                                                    </InputAdornment>
                                                                                          ),
                                                                                }
                                                                      }}
                                                            />
                                                            <TextField
                                                                      select
                                                                      label={locale === 'ar' ? 'الفئة' : 'Category'}
                                                                      sx={{ width: { xs: '100%', sm: 250 }, flexShrink: 0 }}
                                                                      value={specFilter}
                                                                      onChange={(e) => { setSpecFilter(e.target.value); setPage(1); }}
                                                            >
                                                                      <MenuItem value="">{locale === 'ar' ? 'الكل' : 'All'}</MenuItem>
                                                                      {specList.map((s: any) => (
                                                                                <MenuItem key={s.id} value={s.id}>{locale === 'ar' ? s.name_ar : s.name_en}</MenuItem>
                                                                      ))}
                                                            </TextField>
                                                  </Box>
                                        </CardContent>
                              </Card>

                              {/* Loading */}
                              {isLoading && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                                  <CircularProgress />
                                        </Box>
                              )}

                              {/* Course Grid */}
                              {!isLoading && filtered.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 8 }}>
                                                  <Typography variant="h6" color="text.secondary">
                                                            لا توجد دورات متاحة حالياً / No courses available
                                                  </Typography>
                                        </Box>
                              )}

                              <Grid container spacing={3}>
                                        {filtered.map((course: Course) => (
                                                  <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                                            <CourseCard course={course} />
                                                  </Grid>
                                        ))}
                              </Grid>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                                  <Pagination
                                                            count={totalPages}
                                                            page={page}
                                                            onChange={(_, p) => setPage(p)}
                                                            color="primary"
                                                            size="large"
                                                  />
                                        </Box>
                              )}
                    </Box>
          );
};

export default CourseListPage;
