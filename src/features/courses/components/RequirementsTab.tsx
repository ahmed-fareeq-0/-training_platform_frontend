import { useState } from 'react';
import {
          Box, Typography, Card, CardContent, Button, TextField, Stack,
          Switch, FormControlLabel, IconButton, MenuItem, Chip,
          Dialog, DialogTitle, DialogContent, DialogActions,
          useTheme, alpha, CircularProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotesIcon from '@mui/icons-material/Notes';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
          useTrainingRequirements,
          useCreateRequirement,
          useUpdateRequirement,
          useDeleteRequirement,
} from '../../requirements/hooks/useRequirements';
import { RequirementType } from '../../../types';
import type { TrainingRequirement } from '../../../types';

interface RequirementsTabProps {
          courseId: string;
          requiresApproval: boolean;
          onToggleApproval: (val: boolean) => void;
          isRTL: boolean;
}

const REQUIREMENT_TYPE_OPTIONS = [
          { value: RequirementType.DOCUMENT, labelAr: 'مستند / وثيقة', labelEn: 'Document Upload', icon: <DescriptionIcon /> },
          { value: RequirementType.PREREQUISITE_COURSE, labelAr: 'دورة سابقة مطلوبة', labelEn: 'Prerequisite Course', icon: <SchoolIcon /> },
          { value: RequirementType.PREREQUISITE_WORKSHOP, labelAr: 'ورشة سابقة مطلوبة', labelEn: 'Prerequisite Workshop', icon: <EventIcon /> },
          { value: RequirementType.MANAGER_APPROVAL, labelAr: 'موافقة المدير', labelEn: 'Manager Approval', icon: <AdminPanelSettingsIcon /> },
          { value: RequirementType.CUSTOM, labelAr: 'شرط مخصص', labelEn: 'Custom Requirement', icon: <NotesIcon /> },
];

const getTypeIcon = (type: RequirementType) => {
          const opt = REQUIREMENT_TYPE_OPTIONS.find(o => o.value === type);
          return opt?.icon || <NotesIcon />;
};

const getTypeLabel = (type: RequirementType, isRTL: boolean) => {
          const opt = REQUIREMENT_TYPE_OPTIONS.find(o => o.value === type);
          return isRTL ? (opt?.labelAr || type) : (opt?.labelEn || type);
};

export default function RequirementsTab({ courseId, requiresApproval, onToggleApproval, isRTL }: RequirementsTabProps) {
          const theme = useTheme();

          const { data: requirements, isLoading } = useTrainingRequirements('course', courseId);
          const createReq = useCreateRequirement('course', courseId);
          const updateReq = useUpdateRequirement('course', courseId);
          const deleteReq = useDeleteRequirement('course', courseId);

          const [dialogOpen, setDialogOpen] = useState(false);
          const [editingReq, setEditingReq] = useState<TrainingRequirement | null>(null);
          const [form, setForm] = useState({
                    requirement_type: RequirementType.DOCUMENT as RequirementType,
                    label_ar: '',
                    label_en: '',
                    description_ar: '',
                    description_en: '',
                    is_required: true,
          });

          const resetForm = () => {
                    setForm({
                              requirement_type: RequirementType.DOCUMENT,
                              label_ar: '',
                              label_en: '',
                              description_ar: '',
                              description_en: '',
                              is_required: true,
                    });
                    setEditingReq(null);
          };

          const openAdd = () => {
                    resetForm();
                    setDialogOpen(true);
          };

          const openEdit = (req: TrainingRequirement) => {
                    setEditingReq(req);
                    setForm({
                              requirement_type: req.requirement_type,
                              label_ar: req.label_ar,
                              label_en: req.label_en,
                              description_ar: req.description_ar || '',
                              description_en: req.description_en || '',
                              is_required: req.is_required,
                    });
                    setDialogOpen(true);
          };

          const handleSave = async () => {
                    if (editingReq) {
                              await updateReq.mutateAsync({ reqId: editingReq.id, data: form });
                    } else {
                              await createReq.mutateAsync({
                                        ...form,
                                        sort_order: (requirements?.length || 0) + 1,
                              });
                    }
                    setDialogOpen(false);
                    resetForm();
          };

          const handleDelete = async (reqId: string) => {
                    await deleteReq.mutateAsync(reqId);
          };

          return (
                    <Box>
                              {/* Requires Approval Toggle */}
                              <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
                                        <CardContent sx={{ p: 3 }}>
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box>
                                                                      <Typography variant="h6" fontWeight={700}>
                                                                                {isRTL ? 'طلب موافقة للتسجيل' : 'Require Enrollment Approval'}
                                                                      </Typography>
                                                                      <Typography variant="body2" color="text.secondary">
                                                                                {isRTL
                                                                                          ? 'عند التفعيل، سيدخل المتدربون في حالة "قيد المراجعة" بدلاً من التسجيل المباشر'
                                                                                          : 'When enabled, trainees will enter "pending review" status instead of enrolling directly'}
                                                                      </Typography>
                                                            </Box>
                                                            <FormControlLabel
                                                                      control={<Switch checked={requiresApproval} onChange={(_, v) => onToggleApproval(v)} color="primary" />}
                                                                      label=""
                                                            />
                                                  </Box>
                                        </CardContent>
                              </Card>

                              {/* Requirements List */}
                              <Card sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                        <CardContent sx={{ p: 3 }}>
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                            <Typography variant="h6" fontWeight={700}>
                                                                      {isRTL ? 'متطلبات التسجيل' : 'Enrollment Requirements'}
                                                            </Typography>
                                                            <Button
                                                                      variant="contained"
                                                                      startIcon={<AddIcon />}
                                                                      onClick={openAdd}
                                                                      sx={{ borderRadius: '50px', fontWeight: 600, textTransform: 'none' }}
                                                            >
                                                                      {isRTL ? 'إضافة متطلب' : 'Add Requirement'}
                                                            </Button>
                                                  </Box>

                                                  {isLoading ? (
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                                                  ) : !requirements?.length ? (
                                                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                                                      <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                                      <Typography color="text.secondary">
                                                                                {isRTL ? 'لا توجد متطلبات. التسجيل مفتوح للجميع.' : 'No requirements. Enrollment is open to everyone.'}
                                                                      </Typography>
                                                            </Box>
                                                  ) : (
                                                            <Stack spacing={1.5}>
                                                                      {requirements.map((req, index) => (
                                                                                <Box
                                                                                          key={req.id}
                                                                                          sx={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    gap: 2,
                                                                                                    p: 2,
                                                                                                    borderRadius: '12px',
                                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                                                                                    transition: 'all 0.2s',
                                                                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                                                                                          }}
                                                                                >
                                                                                          <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
                                                                                          <Box sx={{
                                                                                                    width: 40, height: 40, borderRadius: '10px',
                                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                                    color: theme.palette.primary.main,
                                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                          }}>
                                                                                                    {getTypeIcon(req.requirement_type)}
                                                                                          </Box>
                                                                                          <Box sx={{ flex: 1 }}>
                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                              <Typography fontWeight={600}>
                                                                                                                        {index + 1}. {isRTL ? req.label_ar : req.label_en}
                                                                                                              </Typography>
                                                                                                              {req.is_required && (
                                                                                                                        <Chip label={isRTL ? 'مطلوب' : 'Required'} size="small" color="error" variant="outlined" />
                                                                                                              )}
                                                                                                    </Box>
                                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                                              {getTypeLabel(req.requirement_type, isRTL)}
                                                                                                    </Typography>
                                                                                          </Box>
                                                                                          <Tooltip title={isRTL ? 'تعديل' : 'Edit'}>
                                                                                                    <IconButton size="small" onClick={() => openEdit(req)}>
                                                                                                              <EditIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                          <Tooltip title={isRTL ? 'حذف' : 'Delete'}>
                                                                                                    <IconButton size="small" color="error" onClick={() => handleDelete(req.id)}>
                                                                                                              <DeleteIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                </Box>
                                                                      ))}
                                                            </Stack>
                                                  )}
                                        </CardContent>
                              </Card>

                              {/* Add/Edit Dialog */}
                              <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                                        <DialogTitle sx={{ fontWeight: 700 }}>
                                                  {editingReq
                                                            ? (isRTL ? 'تعديل المتطلب' : 'Edit Requirement')
                                                            : (isRTL ? 'إضافة متطلب جديد' : 'Add New Requirement')}
                                        </DialogTitle>
                                        <DialogContent>
                                                  <Stack spacing={2.5} sx={{ mt: 1 }}>
                                                            <TextField
                                                                      select fullWidth
                                                                      label={isRTL ? 'نوع المتطلب' : 'Requirement Type'}
                                                                      value={form.requirement_type}
                                                                      onChange={e => setForm(p => ({ ...p, requirement_type: e.target.value as RequirementType }))}
                                                            >
                                                                      {REQUIREMENT_TYPE_OPTIONS.map(opt => (
                                                                                <MenuItem key={opt.value} value={opt.value}>
                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                    {opt.icon}
                                                                                                    {isRTL ? opt.labelAr : opt.labelEn}
                                                                                          </Box>
                                                                                </MenuItem>
                                                                      ))}
                                                            </TextField>
                                                            <TextField
                                                                      label={isRTL ? 'العنوان بالعربية' : 'Label (Arabic)'}
                                                                      fullWidth required
                                                                      value={form.label_ar}
                                                                      onChange={e => setForm(p => ({ ...p, label_ar: e.target.value }))}
                                                            />
                                                            <TextField
                                                                      label={isRTL ? 'العنوان بالإنجليزية' : 'Label (English)'}
                                                                      fullWidth required
                                                                      value={form.label_en}
                                                                      onChange={e => setForm(p => ({ ...p, label_en: e.target.value }))}
                                                            />
                                                            <TextField
                                                                      label={isRTL ? 'وصف بالعربية (اختياري)' : 'Description Arabic (optional)'}
                                                                      fullWidth multiline rows={2}
                                                                      value={form.description_ar}
                                                                      onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                                                            />
                                                            <TextField
                                                                      label={isRTL ? 'وصف بالإنجليزية (اختياري)' : 'Description English (optional)'}
                                                                      fullWidth multiline rows={2}
                                                                      value={form.description_en}
                                                                      onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))}
                                                            />
                                                            <FormControlLabel
                                                                      control={<Switch checked={form.is_required} onChange={(_, v) => setForm(p => ({ ...p, is_required: v }))} />}
                                                                      label={isRTL ? 'مطلوب (إلزامي)' : 'Required (mandatory)'}
                                                            />
                                                  </Stack>
                                        </DialogContent>
                                        <DialogActions sx={{ px: 3, pb: 2 }}>
                                                  <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: '50px' }}>
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                  </Button>
                                                  <Button
                                                            variant="contained"
                                                            onClick={handleSave}
                                                            disabled={!form.label_ar || !form.label_en || createReq.isPending || updateReq.isPending}
                                                            sx={{ borderRadius: '50px', fontWeight: 600 }}
                                                  >
                                                            {(createReq.isPending || updateReq.isPending) ? <CircularProgress size={20} /> : (isRTL ? 'حفظ' : 'Save')}
                                                  </Button>
                                        </DialogActions>
                              </Dialog>
                    </Box>
          );
}
