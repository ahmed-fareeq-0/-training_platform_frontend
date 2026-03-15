import { Box, Typography, Card, CardContent, Rating, TextField, Button, useTheme, alpha } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { useReviewMutations } from '../hooks/useReviews';

interface ReviewFormProps {
          attendedBookings: any[];
          selectedWorkshop: string | null;
          setSelectedWorkshop: (id: string) => void;
          rating: number;
          setRating: (rating: number) => void;
          comment: string;
          setComment: (comment: string) => void;
}

export default function ReviewForm({
          attendedBookings,
          selectedWorkshop,
          setSelectedWorkshop,
          rating,
          setRating,
          comment,
          setComment
}: ReviewFormProps) {
          const theme = useTheme();
          const { locale } = useUIStore();

          const resetForm = () => {
                    setComment('');
                    setRating(4);
          };

          const { createReview } = useReviewMutations(resetForm);

          if (attendedBookings.length === 0) return null;

          return (
                    <Card sx={{ border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                              <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                                  {locale === 'ar' ? 'أضف تقييمك' : 'Write a Review'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                                  {attendedBookings.map((b: any) => (
                                                            <Button
                                                                      key={b.id}
                                                                      variant={selectedWorkshop === b.workshop_id ? 'contained' : 'outlined'}
                                                                      size="small"
                                                                      onClick={() => setSelectedWorkshop(b.workshop_id)}
                                                            >
                                                                      {b.workshop?.title_ar || b.workshop?.title_en || b.workshop_id}
                                                            </Button>
                                                  ))}
                                        </Box>
                                        {selectedWorkshop && (
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                      <Typography variant="body2">{locale === 'ar' ? 'التقييم:' : 'Rating:'}</Typography>
                                                                      <Rating
                                                                                value={rating}
                                                                                onChange={(_, v) => v && setRating(v)}
                                                                                size="large"
                                                                      />
                                                            </Box>
                                                            <TextField
                                                                      multiline
                                                                      rows={3}
                                                                      value={comment}
                                                                      onChange={e => setComment(e.target.value)}
                                                                      label={locale === 'ar' ? 'تعليقك...' : 'Your comment...'}
                                                            />
                                                            <Button
                                                                      variant="contained"
                                                                      startIcon={<Send />}
                                                                      disabled={createReview.isPending}
                                                                      onClick={() => createReview.mutate({ workshop_id: selectedWorkshop, rating, comment })}
                                                                      sx={{ alignSelf: 'flex-end' }}
                                                            >
                                                                      {locale === 'ar' ? 'إرسال' : 'Submit'}
                                                            </Button>
                                                  </Box>
                                        )}
                              </CardContent>
                    </Card>
          );
}
