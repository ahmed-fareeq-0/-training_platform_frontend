import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { useSpecializations, useSpecializationMutations } from '../hooks/useSpecializations';
import SpecializationsList from '../components/SpecializationsList';
import SpecializationFormDialog from '../components/SpecializationFormDialog';
import type { Specialization } from '../../../types';

export default function SpecializationsPage() {
          const { t } = useTranslation();
          const { locale } = useUIStore();

          const [dialogOpen, setDialogOpen] = useState(false);
          const [editing, setEditing] = useState<Specialization | null>(null);
          const [form, setForm] = useState<{
                    name_ar: string;
                    name_en: string;
                    description_ar: string;
                    description_en: string;
                    icon: string;
          }>({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    description_en: '',
                    icon: '',
          });

          const { data, isLoading } = useSpecializations();
          const specializations = data?.data || [];

          const resetFormAndClose = () => {
                    setDialogOpen(false);
                    setEditing(null);
                    setForm({ name_ar: '', name_en: '', description_ar: '', description_en: '', icon: '' });
          };

          const { create, update } = useSpecializationMutations(resetFormAndClose);

          const openEdit = (s: Specialization) => {
                    setEditing(s);
                    setForm({
                              name_ar: s.name_ar,
                              name_en: s.name_en,
                              description_ar: s.description_ar || '',
                              description_en: s.description_en || '',
                              icon: s.icon || '',
                    });
                    setDialogOpen(true);
          };

          const handleSubmit = () => {
                    if (editing) {
                              update.mutate({ id: editing.id, data: form });
                    } else {
                              create.mutate(form);
                    }
          };

          return (
                    <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h4" fontWeight={700}>{t('nav.specializations')}</Typography>
                                        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                                                  {locale === 'ar' ? 'إضافة فئة' : 'Add Category'}
                                        </Button>
                              </Box>

                              <SpecializationsList
                                        specializations={specializations}
                                        isLoading={isLoading}
                                        onEdit={openEdit}
                              />

                              <SpecializationFormDialog
                                        open={dialogOpen}
                                        onClose={resetFormAndClose}
                                        editing={editing}
                                        form={form}
                                        setForm={setForm}
                                        onSubmit={handleSubmit}
                                        isSubmitting={create.isPending || update.isPending}
                              />
                    </Box>
          );
}
