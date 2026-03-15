import { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useMyBookings } from '../../bookings/hooks/useBookings';
import { useUIStore } from '../../../store/uiStore';
import { BookingStatus } from '../../../types';
import { useWorkshopReviews } from '../hooks/useReviews';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';

export default function ReviewsPage() {
          const { locale } = useUIStore();

          const { data: bookingsData } = useMyBookings({ page: 1, limit: 50, status: BookingStatus.ATTENDED });
          const attendedBookings = bookingsData?.data?.filter((b: any) => b.status === BookingStatus.ATTENDED || b.status === BookingStatus.PAID) || [];

          const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
          const [rating, setRating] = useState<number>(4);
          const [comment, setComment] = useState('');

          const { data: workshopReviews, isLoading } = useWorkshopReviews(selectedWorkshop);

          return (
                    <Box>
                              <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {locale === 'ar' ? 'التقييمات' : 'Reviews'}
                              </Typography>

                              <Grid container spacing={3}>
                                        <Grid size={12}>
                                                  <ReviewForm
                                                            attendedBookings={attendedBookings}
                                                            selectedWorkshop={selectedWorkshop}
                                                            setSelectedWorkshop={setSelectedWorkshop}
                                                            rating={rating}
                                                            setRating={setRating}
                                                            comment={comment}
                                                            setComment={setComment}
                                                  />
                                        </Grid>

                                        <Grid size={12}>
                                                  <ReviewsList
                                                            reviews={workshopReviews?.data || []}
                                                            isLoading={isLoading}
                                                            selectedWorkshop={selectedWorkshop}
                                                  />
                                        </Grid>

                                        {!selectedWorkshop && attendedBookings.length === 0 && (
                                                  <Grid size={12}>
                                                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                                                      <Star sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                                      <Typography variant="h6" color="text.secondary">
                                                                                {locale === 'ar' ? 'احضر ورشة لتتمكن من تقييمها' : 'Attend a workshop to leave a review'}
                                                                      </Typography>
                                                            </Box>
                                                  </Grid>
                                        )}
                              </Grid>
                    </Box>
          );
}
