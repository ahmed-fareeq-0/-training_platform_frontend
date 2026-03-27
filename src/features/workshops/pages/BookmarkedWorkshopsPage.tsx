import { useState } from 'react';
import { Typography, Box, Grid, Skeleton, Pagination, Card, CardContent } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { useBookmarkedWorkshops } from '../hooks/useWorkshops';
import EmptyState from '../../../components/common/EmptyState';
import { useUIStore } from '../../../store/uiStore';
import WorkshopCard from '../components/WorkshopCard';

export default function BookmarkedWorkshopsPage() {
    const { locale } = useUIStore();
    const [page, setPage] = useState(1);

    const { data, isLoading } = useBookmarkedWorkshops({
        page,
        limit: 12,
    });

    const workshops = data?.data || [];
    const totalPages = data?.pagination?.totalPages || Math.ceil((data?.pagination?.total || 0) / 12) || 1;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Page Header */}
            <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 1 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                {locale === 'ar' ? 'المفضلة' : 'My Favorites'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {locale === 'ar' ? 'الورش التدريبية التي قمت بحفظها' : 'Workshops you have bookmarked'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Grid View */}
            <Grid container spacing={3}>
                {isLoading &&
                    Array.from(new Array(6)).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 6 }} />
                        </Grid>
                    ))}

                {!isLoading &&
                    workshops.map((workshop) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshop.id}>
                            <WorkshopCard workshop={workshop} isAdminOrManager={false} />
                        </Grid>
                    ))}

                {!isLoading && workshops.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 2 }}>
                            <EmptyState
                                icon={<SearchOff />}
                                title_ar="لا توجد ورش مفضلة"
                                title_en="No Favorite Workshops"
                                description_ar="لم تقم بإضافة أي ورش إلى مفضلتك حتى الآن. استكشف الورش التدريبية المتاحة."
                                description_en="You have not added any workshops to your favorites yet. Explore upcoming workshops."
                            />
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, val) => setPage(val)}
                        color="primary"
                        size="large"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 600,
                                borderRadius: '12px',
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
