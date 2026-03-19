import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Grid, Card, CardContent, Skeleton, TextField, MenuItem, InputAdornment,
          useTheme, alpha, Pagination, Button, IconButton, Menu, MenuItem as MUI_MenuItem,
          ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar
} from '@mui/material';
import {
          Search, CalendarMonth, LocationOn, MoreVert, Delete,
          ViewModule, ViewList, SearchOff
} from '@mui/icons-material';
import { useUpcomingWorkshops, useMyWorkshops, useDeleteWorkshop } from '../hooks/useWorkshops';
import { useQuery } from '@tanstack/react-query';
import specializationService from '../../../api/services/specialization.service';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import dayjs from 'dayjs';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { UserRole } from '../../../types';
import WorkshopFormDialog from '../components/WorkshopFormDialog';
import WorkshopCard from '../components/WorkshopCard';

export default function WorkshopListPage() {
          const theme = useTheme();
          const navigate = useNavigate();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const [page, setPage] = useState(1);
          const [search, setSearch] = useState('');
          const [specializationId, setSpecializationId] = useState('');
          const [isFormOpen, setIsFormOpen] = useState(false);
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
          const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

          const isAdminOrManager = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
          const canCreateWorkshop = isAdminOrManager || user?.role === UserRole.TRAINER;
          const deleteWorkshopMut = useDeleteWorkshop();

          const { data: specData } = useQuery({
                    queryKey: ['specializations'],
                    queryFn: () => specializationService.getAll(),
          });
          const specializations = specData?.data || [];

          const isTrainer = user?.role === UserRole.TRAINER;

          const upcomingFilters = {
                    page,
                    limit: 12,
                    ...(specializationId ? { specialization_id: specializationId } : {})
          };
          const { data: upcomingData, isLoading: loadingUpcoming } = useUpcomingWorkshops(upcomingFilters);
          const { data: myData, isLoading: loadingMy } = useMyWorkshops(upcomingFilters);

          // Trainers see only their own workshops; others see all upcoming
          const data = isTrainer ? myData : upcomingData;
          const isLoading = isTrainer ? loadingMy : loadingUpcoming;
          const workshops = data?.data || [];
          const pagination = data?.pagination;

          const getLocalizedField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

          const handleDeleteWorkshop = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (selectedWorkshopId && window.confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الورشة؟' : 'Are you sure you want to delete this workshop?')) {
                              deleteWorkshopMut.mutate(selectedWorkshopId);
                    }
                    setAnchorEl(null);
                    setSelectedWorkshopId(null);
          };

          const filteredWorkshops = workshops.filter(w => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    return w.title_ar?.toLowerCase().includes(q) || w.title_en?.toLowerCase().includes(q);
          });

          return (
                    <Box>
                              <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                  {/* Page Header */}
                                                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                                            <Box>
                                                                      <Typography variant="h4" fontWeight={700} gutterBottom>
                                                                                {t('workshop.title')}
                                                                      </Typography>
                                                                      <Typography variant="body1" color="text.secondary">
                                                                                {locale === 'ar' ? 'تصفح الورش التدريبية المتاحة وقم بالحجز' : 'Browse available workshops and book your seat'}
                                                                      </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                      {canCreateWorkshop && (
                                                                                <ToggleButtonGroup
                                                                                          value={viewMode}
                                                                                          exclusive
                                                                                          onChange={(_, newMode) => {
                                                                                                    if (newMode !== null) setViewMode(newMode);
                                                                                          }}
                                                                                          size="small"
                                                                                >
                                                                                          <ToggleButton value="grid" aria-label="grid view">
                                                                                                    <ViewModule fontSize="small" />
                                                                                          </ToggleButton>
                                                                                          <ToggleButton value="table" aria-label="table view">
                                                                                                    <ViewList fontSize="small" />
                                                                                          </ToggleButton>
                                                                                </ToggleButtonGroup>
                                                                      )}
                                                                      {canCreateWorkshop && (
                                                                                <Button
                                                                                          variant="contained"
                                                                                          onClick={() => setIsFormOpen(true)}
                                                                                          sx={{ borderRadius: 2 }}
                                                                                >
                                                                                          {locale === 'ar' ? 'إضافة ورشة' : 'Add Workshop'}
                                                                                </Button>
                                                                      )}
                                                            </Box>
                                                  </Box>

                                                  {/* Search & Filters */}
                                                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                                                            <TextField
                                                                      placeholder={locale === 'ar' ? 'ابحث عن ورشة...' : 'Search workshops...'}
                                                                      value={search}
                                                                      onChange={(e) => setSearch(e.target.value)}
                                                                      sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
                                                                      slotProps={{
                                                                                input: {
                                                                                          startAdornment: (
                                                                                                    <InputAdornment position="start">
                                                                                                              <Search />
                                                                                                    </InputAdornment>
                                                                                          ),
                                                                                }
                                                                      }}
                                                            />
                                                            <TextField
                                                                      select
                                                                      label={locale === 'ar' ? 'الفئة' : 'Category'}
                                                                      sx={{ width: { xs: '100%', sm: 250 }, flexShrink: 0 }}
                                                                      value={specializationId}
                                                                      onChange={(e) => { setSpecializationId(e.target.value); setPage(1); }}
                                                            >
                                                                      <MenuItem value="">{locale === 'ar' ? 'الكل' : 'All'}</MenuItem>
                                                                      {specializations.map(s => (
                                                                                <MenuItem key={s.id} value={s.id}>{locale === 'ar' ? s.name_ar : s.name_en}</MenuItem>
                                                                      ))}
                                                            </TextField>
                                                  </Box>
                                        </CardContent>
                              </Card>

                              <Box>
                                        {/* Workshop Grid / Table */}
                                        {viewMode === 'grid' ? (
                                                  <Grid container spacing={3}>
                                                            {isLoading && Array.from({ length: 6 }).map((_, i) => (
                                                                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                                                <Card sx={{ height: '100%' }}>
                                                                                          <Skeleton variant="rectangular" height={180} />
                                                                                          <CardContent>
                                                                                                    <Skeleton width="80%" height={28} />
                                                                                                    <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                                                                                                    <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                                                                                          </CardContent>
                                                                                </Card>
                                                                      </Grid>
                                                            ))}

                                                            {!isLoading && filteredWorkshops
                                                                      .map((workshop) => (
                                                                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshop.id}>
                                                                                          <WorkshopCard
                                                                                                    workshop={workshop}
                                                                                                    isAdminOrManager={isAdminOrManager}
                                                                                                    onMenuClick={(e, id) => {
                                                                                                              e.stopPropagation();
                                                                                                              setAnchorEl(e.currentTarget as HTMLElement);
                                                                                                              setSelectedWorkshopId(id);
                                                                                                    }}
                                                                                          />
                                                                                </Grid>
                                                                      ))}

                                                            {!isLoading && filteredWorkshops.length === 0 && (
                                                                      <Grid size={12}>
                                                                                <Box sx={{ mt: 2 }}>
                                                                                          <EmptyState
                                                                                                    icon={<SearchOff />}
                                                                                                    title_ar="لا توجد ورش مطابقة"
                                                                                                    title_en="No matching workshops"
                                                                                                    description_ar="لم نتمكن من العثور على أي ورش تدريبية تطابق بحثك."
                                                                                                    description_en="We couldn't find any workshops matching your search or filters."
                                                                                          />
                                                                                </Box>
                                                                      </Grid>
                                                            )}
                                                  </Grid>
                                        ) : (
                                                  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: 'background.paper', overflow: 'auto' }}>
                                                            <Table sx={{ minWidth: 800 }}>
                                                                      <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                                                                <TableRow>
                                                                                          <TableCell>{locale === 'ar' ? 'الورشة' : 'Workshop'}</TableCell>
                                                                                          <TableCell>{locale === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</TableCell>
                                                                                          <TableCell>{locale === 'ar' ? 'المقاعد' : 'Seats'}</TableCell>
                                                                                          <TableCell>{locale === 'ar' ? 'السعر' : 'Price'}</TableCell>
                                                                                          <TableCell>{locale === 'ar' ? 'الحالة' : 'Status'}</TableCell>
                                                                                          <TableCell align="right">{t('common.actions')}</TableCell>
                                                                                </TableRow>
                                                                      </TableHead>
                                                                      <TableBody>
                                                                                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                                                                                          <TableRow key={i}>
                                                                                                    <TableCell colSpan={6}><Skeleton animation="wave" height={50} /></TableCell>
                                                                                          </TableRow>
                                                                                )) : filteredWorkshops.map(workshop => (
                                                                                          <TableRow key={workshop.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/workshops/${workshop.id}`)}>
                                                                                                    <TableCell>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                                                                        <Avatar src={workshop.cover_image || undefined} variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                                                                                                                                  {!workshop.cover_image && <CalendarMonth />}
                                                                                                                        </Avatar>
                                                                                                                        <Box>
                                                                                                                                  <Typography variant="subtitle2" fontWeight={600}>{getLocalizedField(workshop.title_ar, workshop.title_en)}</Typography>
                                                                                                                                  {workshop.location_ar && (
                                                                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                                                                      <LocationOn sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                                                                                                                                      {getLocalizedField(workshop.location_ar, workshop.location_en)}
                                                                                                                                            </Typography>
                                                                                                                                  )}
                                                                                                                        </Box>
                                                                                                              </Box>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2">{dayjs(workshop.start_date).format('DD MMM YYYY')}</Typography>
                                                                                                              <Typography variant="caption" color="text.secondary">{workshop.duration_hours} {t('workshop.hours')}</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2">{workshop.total_seats}</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <Typography variant="body2" fontWeight={600} color="primary.main">{workshop.price} IQD</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              <StatusBadge status={workshop.status} type="workshop" />
                                                                                                    </TableCell>
                                                                                                    <TableCell align="right">
                                                                                                              <IconButton onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setAnchorEl(e.currentTarget);
                                                                                                                        setSelectedWorkshopId(workshop.id);
                                                                                                              }}>
                                                                                                                        <MoreVert />
                                                                                                              </IconButton>
                                                                                                    </TableCell>
                                                                                          </TableRow>
                                                                                ))}
                                                                                {!isLoading && filteredWorkshops.length === 0 && (
                                                                                          <TableRow>
                                                                                                    <TableCell colSpan={6} align="center" sx={{ borderBottom: 'none' }}>
                                                                                                              <EmptyState
                                                                                                                        icon={<SearchOff />}
                                                                                                                        title_ar="لا توجد ورش مطابقة"
                                                                                                                        title_en="No matching workshops"
                                                                                                                        description_ar="لم نتمكن من العثور على أي ورش تدريبية تطابق بحثك."
                                                                                                                        description_en="We couldn't find any workshops matching your search or filters."
                                                                                                              />
                                                                                                    </TableCell>
                                                                                          </TableRow>
                                                                                )}
                                                                      </TableBody>
                                                            </Table>
                                                  </TableContainer>
                                        )}

                                        <Menu
                                                  anchorEl={anchorEl}
                                                  open={Boolean(anchorEl)}
                                                  onClose={() => {
                                                            setAnchorEl(null);
                                                            setSelectedWorkshopId(null);
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                        >
                                                  {/* Edit could go here in the future if a form supports editing */}
                                                  <MUI_MenuItem
                                                            onClick={handleDeleteWorkshop}
                                                            sx={{ color: 'error.main', gap: 1 }}
                                                            disabled={deleteWorkshopMut.isPending}
                                                  >
                                                            <Delete fontSize="small" />
                                                            {deleteWorkshopMut.isPending ? 'Deleting...' : (locale === 'ar' ? 'حذف' : 'Delete')}
                                                  </MUI_MenuItem>
                                        </Menu>

                                        {/* Pagination */}
                                        {pagination && pagination.totalPages > 1 && (
                                                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                                            <Pagination
                                                                      count={pagination.totalPages}
                                                                      page={page}
                                                                      onChange={(_, v) => setPage(v)}
                                                                      color="primary"
                                                                      shape="rounded"
                                                            />
                                                  </Box>
                                        )}
                              </Box>

                              {/* Form Dialog */}
                              <WorkshopFormDialog
                                        open={isFormOpen}
                                        onClose={() => setIsFormOpen(false)}
                                        onCreated={(workshopId) => navigate(`/workshops/${workshopId}/edit`)}
                              />
                    </Box>
          );
}
