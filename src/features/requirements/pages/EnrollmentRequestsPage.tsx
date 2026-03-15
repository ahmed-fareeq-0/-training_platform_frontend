import { useState } from 'react';
import {
          Box, Typography, Card, CardContent, useTheme, alpha, Button, Chip,
          Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
          Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
          TextField, CircularProgress, Tooltip, Tabs, Tab,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import { usePendingEnrollmentRequests, useReviewSubmission } from '../../requirements/hooks/useRequirements';
import { useUIStore } from '../../../store/uiStore';

export default function EnrollmentRequestsPage() {
          const theme = useTheme();
          const { locale } = useUIStore();
          const isRTL = locale === 'ar';

          const [typeFilter, setTypeFilter] = useState<string>('all');
          const [page] = useState(1);

          const { data, isLoading } = usePendingEnrollmentRequests({
                    page,
                    limit: 20,
                    type: typeFilter === 'all' ? undefined : typeFilter,
          });

          const reviewMutation = useReviewSubmission();

          // Review dialog
          const [reviewDialog, setReviewDialog] = useState<{
                    open: boolean;
                    submissionId: string;
                    action: 'approve' | 'reject';
          }>({ open: false, submissionId: '', action: 'approve' });
          const [reviewNotes, setReviewNotes] = useState('');

          const handleReview = async () => {
                    await reviewMutation.mutateAsync({
                              submissionId: reviewDialog.submissionId,
                              data: {
                                        is_satisfied: reviewDialog.action === 'approve',
                                        notes: reviewNotes || undefined,
                              },
                    });
                    setReviewDialog({ open: false, submissionId: '', action: 'approve' });
                    setReviewNotes('');
          };

          const requests = data?.data || [];

          return (
                    <Box>
                              {/* Header */}
                              <Box sx={{ mb: 4 }}>
                                        <Typography variant="h4" fontWeight={800} gutterBottom>
                                                  {isRTL ? 'طلبات التسجيل' : 'Enrollment Requests'}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                                  {isRTL
                                                            ? 'مراجعة طلبات التسجيل في الدورات والورش التي تتطلب موافقة'
                                                            : 'Review enrollment requests for courses and workshops that require approval'}
                                        </Typography>
                              </Box>

                              {/* Filter Tabs */}
                              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs value={typeFilter} onChange={(_e, v) => setTypeFilter(v)}>
                                                  <Tab value="all" label={isRTL ? 'الكل' : 'All'} />
                                                  <Tab value="course" label={isRTL ? 'الدورات' : 'Courses'} />
                                                  <Tab value="workshop" label={isRTL ? 'الورش' : 'Workshops'} />
                                        </Tabs>
                              </Box>

                              {/* Content */}
                              {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                                  <CircularProgress />
                                        </Box>
                              ) : requests.length === 0 ? (
                                        <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                  <CardContent sx={{ p: 6, textAlign: 'center' }}>
                                                            <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                            <Typography variant="h6" color="text.secondary">
                                                                      {isRTL ? 'لا توجد طلبات قيد المراجعة' : 'No pending enrollment requests'}
                                                            </Typography>
                                                  </CardContent>
                                        </Card>
                              ) : (
                                        <TableContainer component={Paper} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                  <Table>
                                                            <TableHead>
                                                                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المتدرب' : 'Trainee'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'النوع' : 'Type'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'اسم التدريب' : 'Training Name'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'المتطلب' : 'Requirement'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'الملاحظات' : 'Notes'}</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700 }}>{isRTL ? 'إجراء' : 'Actions'}</TableCell>
                                                                      </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                      {requests.map((req: any) => (
                                                                                <TableRow key={req.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                                                                          <TableCell>
                                                                                                    <Typography fontWeight={600}>{req.trainee_name || '—'}</Typography>
                                                                                                    <Typography variant="caption" color="text.secondary">{req.trainee_email || ''}</Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Chip
                                                                                                              label={req.enrollment_type === 'course' ? (isRTL ? 'دورة' : 'Course') : (isRTL ? 'ورشة' : 'Workshop')}
                                                                                                              size="small"
                                                                                                              color={req.enrollment_type === 'course' ? 'primary' : 'secondary'}
                                                                                                              variant="outlined"
                                                                                                    />
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography fontWeight={500}>
                                                                                                              {isRTL ? req.training_title_ar : req.training_title_en}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography variant="body2">
                                                                                                              {isRTL ? req.requirement?.label_ar : req.requirement?.label_en}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Chip
                                                                                                              label={req.is_satisfied
                                                                                                                        ? (isRTL ? 'مقبول' : 'Approved')
                                                                                                                        : (isRTL ? 'قيد المراجعة' : 'Pending')}
                                                                                                              size="small"
                                                                                                              color={req.is_satisfied ? 'success' : 'warning'}
                                                                                                    />
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                              {req.notes || '—'}
                                                                                                    </Typography>
                                                                                          </TableCell>
                                                                                          <TableCell>
                                                                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                                              {req.document_url && (
                                                                                                                        <Tooltip title={isRTL ? 'عرض المستند' : 'View Document'}>
                                                                                                                                  <IconButton size="small" href={req.document_url} target="_blank">
                                                                                                                                            <VisibilityIcon fontSize="small" />
                                                                                                                                  </IconButton>
                                                                                                                        </Tooltip>
                                                                                                              )}
                                                                                                              {!req.is_satisfied && (
                                                                                                                        <>
                                                                                                                                  <Tooltip title={isRTL ? 'قبول' : 'Approve'}>
                                                                                                                                            <IconButton
                                                                                                                                                      size="small" color="success"
                                                                                                                                                      onClick={() => setReviewDialog({ open: true, submissionId: req.id, action: 'approve' })}
                                                                                                                                            >
                                                                                                                                                      <CheckCircleIcon fontSize="small" />
                                                                                                                                            </IconButton>
                                                                                                                                  </Tooltip>
                                                                                                                                  <Tooltip title={isRTL ? 'رفض' : 'Reject'}>
                                                                                                                                            <IconButton
                                                                                                                                                      size="small" color="error"
                                                                                                                                                      onClick={() => setReviewDialog({ open: true, submissionId: req.id, action: 'reject' })}
                                                                                                                                            >
                                                                                                                                                      <CancelIcon fontSize="small" />
                                                                                                                                            </IconButton>
                                                                                                                                  </Tooltip>
                                                                                                                        </>
                                                                                                              )}
                                                                                                    </Box>
                                                                                          </TableCell>
                                                                                </TableRow>
                                                                      ))}
                                                            </TableBody>
                                                  </Table>
                                        </TableContainer>
                              )}

                              {/* Review Dialog */}
                              <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, submissionId: '', action: 'approve' })} maxWidth="sm" fullWidth>
                                        <DialogTitle sx={{ fontWeight: 700, color: reviewDialog.action === 'approve' ? 'success.main' : 'error.main' }}>
                                                  {reviewDialog.action === 'approve'
                                                            ? (isRTL ? 'تأكيد القبول' : 'Confirm Approval')
                                                            : (isRTL ? 'تأكيد الرفض' : 'Confirm Rejection')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <TextField
                                                            label={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                                                            fullWidth multiline rows={3}
                                                            value={reviewNotes}
                                                            onChange={e => setReviewNotes(e.target.value)}
                                                            sx={{ mt: 1 }}
                                                  />
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 2 }}>
                                                  <Button onClick={() => setReviewDialog({ open: false, submissionId: '', action: 'approve' })} sx={{ borderRadius: '50px' }}>
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            color={reviewDialog.action === 'approve' ? 'success' : 'error'}
                                                            onClick={handleReview}
                                                            disabled={reviewMutation.isPending}
                                                            sx={{ borderRadius: '50px', fontWeight: 600 }}
                                                  >
                                                            {reviewMutation.isPending ? <CircularProgress size={20} /> : (
                                                                      reviewDialog.action === 'approve'
                                                                                ? (isRTL ? 'قبول' : 'Approve')
                                                                                : (isRTL ? 'رفض' : 'Reject')
                                                            )}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Box>
          );
}
