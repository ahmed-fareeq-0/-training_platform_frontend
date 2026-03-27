import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Rating,
    Typography,
    Box,
    TextField,
    CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useSubmitCourseReview } from '../hooks/useCourses';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface CourseRatingDialogProps {
    open: boolean;
    courseId: string;
    onSuccess: () => void;
}

export const CourseRatingDialog: React.FC<CourseRatingDialogProps> = ({ open, courseId, onSuccess }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');

    const submitReview = useSubmitCourseReview();

    const handleSubmit = () => {
        if (!rating || rating === 0) return;

        submitReview.mutate(
            { courseId, data: { rating, comment } },
            {
                onSuccess: () => {
                    toast.success(isRTL ? 'شكرًا لتقييمك الدورة!' : 'Thank you for rating the course!');
                    onSuccess();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
                }
            }
        );
    };

    return (
        <Dialog
            open={open}
            // Prevent closing by clicking outside or pressing escape
            disableEscapeKeyDown
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    // Do nothing to prevent dismissal
                }
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pt: 2 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                    {isRTL ? 'تهانينا على إتمام الدورة! 🎉' : 'Congratulations on finishing the course! 🎉'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isRTL
                        ? 'يرجى تقييم تجربتك الشاملة في هذه الدورة لمساعدة الآخرين'
                        : 'Please rate your overall experience in this course to help others'}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, my: 2 }}>
                    <Rating
                        name="course-rating"
                        value={rating}
                        onChange={(_event, newValue) => {
                            setRating(newValue);
                        }}
                        size="large"
                        precision={1}
                        icon={<StarIcon sx={{ fontSize: 40, mx: 0.5, color: '#FAAF00' }} />}
                        emptyIcon={<StarIcon sx={{ fontSize: 40, mx: 0.5, opacity: 0.3 }} />}
                        sx={{
                            color: '#FAAF00',
                            direction: isRTL ? 'ltr' : 'inherit' // Keep stars ltr even in RTL
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder={isRTL ? 'شاركنا رأيك أو تعليقك (اختياري)...' : 'Share your thoughts or feedback (optional)...'}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!rating || rating === 0 || submitReview.isPending}
                    sx={{
                        px: 6,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 'bold'
                    }}
                >
                    {submitReview.isPending ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        isRTL ? 'إرسال التقييم المكتمل' : 'Submit Review'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
