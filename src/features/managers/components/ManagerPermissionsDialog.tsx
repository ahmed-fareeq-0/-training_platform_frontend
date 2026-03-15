import { useState, useEffect } from 'react';
import {
          Dialog, DialogTitle, DialogContent, DialogActions,
          Button, Box, Typography, Switch, FormControlLabel,
          IconButton, Divider, CircularProgress, Select, MenuItem,
          FormControl, InputLabel,
} from '@mui/material';
import { Delete, Add, Save } from '@mui/icons-material';
import {
          useManagerPermissions, useUpdateManagerPermission
} from '../hooks/useManagers';
import { useQuery } from '@tanstack/react-query';
import specializationService from '../../../api/services/specialization.service';
import { useUIStore } from '../../../store/uiStore';
import { ManagerPermission } from '../../../types';

export default function ManagerPermissionsDialog({
          open, onClose, managerId, managerName
}: {
          open: boolean; onClose: () => void; managerId: string | null; managerName: string;
}) {
          const { locale } = useUIStore();
          const [newSpecId, setNewSpecId] = useState('');
          const [localPerms, setLocalPerms] = useState<ManagerPermission[]>([]);

          const { data: permsData, isLoading } = useManagerPermissions(managerId || '');

          useEffect(() => {
                    if (open && permsData?.data) {
                              setLocalPerms(permsData.data);
                    }
          }, [open, permsData]);

          const { data: specData } = useQuery({
                    queryKey: ['specializations'],
                    queryFn: () => specializationService.getAll(),
          });
          const specializations = specData?.data || [];

          const updateMut = useUpdateManagerPermission();

          const handleToggle = (specId: string, field: keyof ManagerPermission) => {
                    setLocalPerms(prev => prev.map(p =>
                              p.specialization_id === specId ? { ...p, [field]: !p[field] } : p
                    ));
          };

          const handleAdd = () => {
                    if (!managerId || !newSpecId) return;
                    const spec = specializations.find(s => s.id === newSpecId);
                    if (!spec) return;

                    setLocalPerms(prev => [...prev, {
                              manager_id: managerId as string,
                              specialization_id: newSpecId,
                              can_approve_enrollments: true,
                              can_approve_content: true,
                              can_manage_workshops: true,
                              can_view_reports: true,
                              created_at: new Date().toISOString(),
                              specialization: spec
                    }]);
                    setNewSpecId('');
          };

          const handleRemove = (specId: string) => {
                    if (confirm(locale === 'ar' ? 'هل أنت متأكد من إزالة هذا التخصص؟' : 'Are you sure you want to remove this specialization?')) {
                              setLocalPerms(prev => prev.filter(p => p.specialization_id !== specId));
                    }
          };

          const handleSave = () => {
                    if (!managerId) return;
                    updateMut.mutate({
                              managerId,
                              data: {
                                        permissions: localPerms.map(p => ({
                                                  specialization_id: p.specialization_id,
                                                  can_approve_enrollments: p.can_approve_enrollments,
                                                  can_approve_content: p.can_approve_content,
                                                  can_manage_workshops: p.can_manage_workshops,
                                                  can_view_reports: p.can_view_reports
                                        }))
                              }
                    }, {
                              onSuccess: () => onClose()
                    });
          };

          // Filter out already assigned specializations for the add dropdown
          const availableSpecs = specializations.filter(
                    s => !localPerms.some(p => p.specialization_id === s.id)
          );

          return (
                    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                              <DialogTitle>
                                        {locale === 'ar' ? `نطاق المراجعة والصلاحيات - ${managerName}` : `Review Scope & Permissions - ${managerName}`}
                              </DialogTitle>
                              <DialogContent dividers>
                                        {isLoading ? (
                                                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                                        ) : (
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                      {locale === 'ar'
                                                                                ? 'الفئات هنا تحدد نطاق المراجعة فقط — أي طلبات التسجيل والمحتوى الذي يمكن لهذا المدير مراجعته. هذا لا يقيّد وصول المتدربين.'
                                                                                : 'Categories here define the review scope only — which enrollment requests and content this manager can review. This does not restrict trainee access.'}
                                                            </Typography>

                                                            {/* Existing Permissions List */}
                                                            {localPerms.length === 0 ? (
                                                                      <Typography color="text.secondary" align="center">
                                                                                {locale === 'ar' ? 'لا توجد تخصصات مخصصة' : 'No assigned specializations'}
                                                                      </Typography>
                                                            ) : (
                                                                      localPerms.map((perm) => (
                                                                                <Box key={perm.specialization_id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                                                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                                                                              {locale === 'ar' ? perm.specialization?.name_ar : perm.specialization?.name_en}
                                                                                                    </Typography>
                                                                                                    <IconButton size="small" color="error" onClick={() => handleRemove(perm.specialization_id)} disabled={updateMut.isPending}>
                                                                                                              <Delete fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Box>
                                                                                          <Divider sx={{ mb: 2 }} />
                                                                                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
                                                                                                    <FormControlLabel
                                                                                                              control={<Switch size="small" checked={perm.can_approve_enrollments} onChange={() => handleToggle(perm.specialization_id, 'can_approve_enrollments')} disabled={updateMut.isPending} />}
                                                                                                              label={<Typography variant="body2">{locale === 'ar' ? 'قبول التسجيلات' : 'Approve Enrollments'}</Typography>}
                                                                                                    />
                                                                                                    <FormControlLabel
                                                                                                              control={<Switch size="small" checked={perm.can_approve_content} onChange={() => handleToggle(perm.specialization_id, 'can_approve_content')} disabled={updateMut.isPending} />}
                                                                                                              label={<Typography variant="body2">{locale === 'ar' ? 'اعتماد المحتوى' : 'Approve Content'}</Typography>}
                                                                                                    />
                                                                                                    <FormControlLabel
                                                                                                              control={<Switch size="small" checked={perm.can_manage_workshops} onChange={() => handleToggle(perm.specialization_id, 'can_manage_workshops')} disabled={updateMut.isPending} />}
                                                                                                              label={<Typography variant="body2">{locale === 'ar' ? 'إدارة الورش' : 'Manage Workshops'}</Typography>}
                                                                                                    />
                                                                                                    <FormControlLabel
                                                                                                              control={<Switch size="small" checked={perm.can_view_reports} onChange={() => handleToggle(perm.specialization_id, 'can_view_reports')} disabled={updateMut.isPending} />}
                                                                                                              label={<Typography variant="body2">{locale === 'ar' ? 'عرض التقارير' : 'View Reports'}</Typography>}
                                                                                                    />
                                                                                          </Box>
                                                                                </Box>
                                                                      ))
                                                            )}

                                                            {/* Add New Specialization Section */}
                                                            {availableSpecs.length > 0 && (
                                                                      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                                                                                <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
                                                                                          <InputLabel>{locale === 'ar' ? 'إضافة نطاق مراجعة' : 'Add Review Scope'}</InputLabel>
                                                                                          <Select
                                                                                                    value={newSpecId}
                                                                                                    onChange={(e) => setNewSpecId(e.target.value)}
                                                                                                    label={locale === 'ar' ? 'إضافة نطاق مراجعة' : 'Add Review Scope'}
                                                                                          >
                                                                                                    {availableSpecs.map(s => (
                                                                                                              <MenuItem key={s.id} value={s.id}>
                                                                                                                        {locale === 'ar' ? s.name_ar : s.name_en}
                                                                                                              </MenuItem>
                                                                                                    ))}
                                                                                          </Select>
                                                                                </FormControl>
                                                                                <Button
                                                                                          variant="contained"
                                                                                          startIcon={<Add />}
                                                                                          disabled={!newSpecId || updateMut.isPending}
                                                                                          onClick={handleAdd}
                                                                                >
                                                                                          {locale === 'ar' ? 'إضافة' : 'Add'}
                                                                                </Button>
                                                                      </Box>
                                                            )}

                                                  </Box>
                                        )}
                              </DialogContent>
                              <DialogActions>
                                        <Button onClick={onClose} color="inherit" disabled={updateMut.isPending}>
                                                  {locale === 'ar' ? 'إغلاق' : 'Close'}
                                        </Button>
                                        <Button onClick={handleSave} variant="contained" color="primary" startIcon={updateMut.isPending ? <CircularProgress size={20} /> : <Save />} disabled={updateMut.isPending}>
                                                  {locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                                        </Button>
                              </DialogActions>
                    </Dialog>
          );
}
