import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../../store/uiStore';
import type { Specialization } from '../../../types';

interface SpecializationFormDialogProps {
          open: boolean;
          onClose: () => void;
          editing: Specialization | null;
          form: {
                    name_ar: string;
                    name_en: string;
                    description_ar: string;
                    description_en: string;
                    icon: string;
          };
          setForm: (form: any) => void;
          onSubmit: () => void;
          isSubmitting: boolean;
}

export default function SpecializationFormDialog({
          open,
          onClose,
          editing,
          form,
          setForm,
          onSubmit,
          isSubmitting
}: SpecializationFormDialogProps) {
          const { t } = useTranslation();
          const { locale } = useUIStore();

          return (
                    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                              <DialogTitle sx={{ fontWeight: 700 }}>
                                        {editing
                                                  ? (locale === 'ar' ? 'تعديل الفئة' : 'Edit Category')
                                                  : (locale === 'ar' ? 'إضافة فئة جديدة' : 'Add Category')
                                        }
                              </DialogTitle>
                              <DialogContent dividers>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
                                                            {locale === 'ar' ? 'الفئات هي تصنيفات لتنظيم الدورات والورش. لا تتحكم في الوصول.' : 'Categories are tags to organize courses and workshops. They do not control access.'}
                                                  </Typography>

                                                  <TextField
                                                            label={locale === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                                                            value={form.name_ar}
                                                            onChange={e => setForm({ ...form, name_ar: e.target.value })}
                                                            required
                                                            fullWidth
                                                  />
                                                  <TextField
                                                            label={locale === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                                                            value={form.name_en}
                                                            onChange={e => setForm({ ...form, name_en: e.target.value })}
                                                            required
                                                            fullWidth
                                                  />
                                                  <TextField
                                                            label={locale === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                                                            value={form.description_ar}
                                                            onChange={e => setForm({ ...form, description_ar: e.target.value })}
                                                            multiline
                                                            rows={3}
                                                            fullWidth
                                                  />
                                                  <TextField
                                                            label={locale === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                                                            value={form.description_en}
                                                            onChange={e => setForm({ ...form, description_en: e.target.value })}
                                                            multiline
                                                            rows={3}
                                                            fullWidth
                                                  />
                                                  <TextField
                                                            label={locale === 'ar' ? 'الأيقونة (اسم MUI Icon)' : 'Icon (MUI Icon Name)'}
                                                            value={form.icon}
                                                            onChange={e => setForm({ ...form, icon: e.target.value })}
                                                            placeholder="e.g. Computer, Science, MedicalServices"
                                                            fullWidth
                                                  />
                                        </Box>
                              </DialogContent>
                              <DialogActions>
                                        <Button onClick={onClose} disabled={isSubmitting}>
                                                  {t('common.cancel')}
                                        </Button>
                                        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting || !form.name_ar || !form.name_en}>
                                                  {isSubmitting
                                                            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                                                            : (editing ? t('common.update') : t('common.create'))
                                                  }
                                        </Button>
                              </DialogActions>
                    </Dialog>
          );
}
