import { useState } from 'react';
import { Box, Typography, Card, CardContent, Rating, Avatar, Skeleton, useTheme, IconButton, Menu, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useReviewMutations } from '../hooks/useReviews';

interface ReviewsListProps {
          reviews: any[];
          isLoading: boolean;
          selectedWorkshop: string | null;
}

export default function ReviewsList({ reviews, isLoading, selectedWorkshop }: ReviewsListProps) {
          const theme = useTheme();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const { updateReview, deleteReview } = useReviewMutations();

          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const [selectedReview, setSelectedReview] = useState<any | null>(null);

          const [editDialogOpen, setEditDialogOpen] = useState(false);
          const [editRating, setEditRating] = useState<number>(0);
          const [editComment, setEditComment] = useState('');

          if (!selectedWorkshop) return null;

          const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: any) => {
                    setAnchorEl(event.currentTarget);
                    setSelectedReview(review);
          };

          const handleMenuClose = () => {
                    setAnchorEl(null);
                    setSelectedReview(null);
          };

          const handleOpenEdit = () => {
                    if (selectedReview) {
                              setEditRating(selectedReview.rating || 0);
                              setEditComment(selectedReview.comment || '');
                              setEditDialogOpen(true);
                    }
                    handleMenuClose();
          };

          const handleSaveEdit = () => {
                    if (selectedReview) {
                              updateReview.mutate(
                                        { id: selectedReview.id, data: { rating: editRating, comment: editComment } },
                                        { onSuccess: () => setEditDialogOpen(false) }
                              );
                    }
          };

          const handleDelete = () => {
                    if (selectedReview && window.confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this review?')) {
                              deleteReview.mutate(selectedReview.id);
                    }
                    handleMenuClose();
          };

          return (
                    <>
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                        {locale === 'ar' ? 'التقييمات السابقة' : 'Past Reviews'}
                              </Typography>

                              {isLoading ? (
                                        <Skeleton height={100} />
                              ) : reviews.length === 0 ? (
                                        <Typography color="text.secondary">
                                                  {locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                                        </Typography>
                              ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                  {reviews.map((review: any) => (
                                                            <Card key={review.id}>
                                                                      <CardContent sx={{ p: 2.5 }}>
                                                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                                                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                                                                                                    {review.user?.full_name?.charAt(0) || 'U'}
                                                                                          </Avatar>
                                                                                          <Box sx={{ flex: 1 }}>
                                                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                              <Typography fontWeight={600}>
                                                                                                                        {review.user?.full_name || 'User'}
                                                                                                              </Typography>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                                                                                                  {dayjs(review.created_at).format('DD/MM/YY')}
                                                                                                                        </Typography>
                                                                                                                        {(review.user?.id === user?.id || user?.role === 'super_admin') && (
                                                                                                                                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, review)}>
                                                                                                                                            <MoreVert fontSize="small" />
                                                                                                                                  </IconButton>
                                                                                                                        )}
                                                                                                              </Box>
                                                                                                    </Box>
                                                                                                    <Rating value={review.rating} size="small" readOnly sx={{ mt: 0.5 }} />
                                                                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                                                              {review.comment}
                                                                                                    </Typography>
                                                                                          </Box>
                                                                                </Box>
                                                                      </CardContent>
                                                            </Card>
                                                  ))}
                                        </Box>
                              )}

                              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                        <MenuItem onClick={handleOpenEdit} sx={{ gap: 1 }}>
                                                  <Edit fontSize="small" /> {locale === 'ar' ? 'تعديل' : 'Edit'}
                                        </MenuItem>
                                        <MenuItem onClick={handleDelete} sx={{ gap: 1, color: 'error.main' }}>
                                                  <Delete fontSize="small" /> {locale === 'ar' ? 'حذف' : 'Delete'}
                                        </MenuItem>
                              </Menu>

                              <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                                        <DialogTitle>{locale === 'ar' ? 'تعديل التقييم' : 'Edit Review'}</DialogTitle>
                                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Typography component="legend">{locale === 'ar' ? 'التقييم:' : 'Rating:'}</Typography>
                                                            <Rating
                                                                      value={editRating}
                                                                      onChange={(_, newValue) => setEditRating(newValue || 0)}
                                                            />
                                                  </Box>
                                                  <TextField
                                                            label={locale === 'ar' ? 'التعليق' : 'Comment'}
                                                            multiline
                                                            rows={3}
                                                            value={editComment}
                                                            onChange={(e) => setEditComment(e.target.value)}
                                                            fullWidth
                                                  />
                                        </DialogContent>
                                        <DialogActions>
                                                  <Button onClick={() => setEditDialogOpen(false)}>
                                                            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button onClick={handleSaveEdit} variant="contained" disabled={updateReview.isPending}>
                                                            {updateReview.isPending ? 'Saving...' : (locale === 'ar' ? 'حفظ' : 'Save')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </>
          );
}
