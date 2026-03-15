import { useState } from 'react';
import { Box, Typography, Card, Button, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useManagers } from '../hooks/useManagers';
import { useUIStore } from '../../../store/uiStore';
import ManagerFormDialog from '../components/ManagerFormDialog';
import ManagerPermissionsDialog from '../components/ManagerPermissionsDialog';
import ManagersTable from '../components/ManagersTable';

export default function ManagersPage() {
          const { locale } = useUIStore();
          const [page, setPage] = useState(1);
          const [isFormOpen, setIsFormOpen] = useState(false);
          const [permManagerId, setPermManagerId] = useState<string | null>(null);
          const [permManagerName, setPermManagerName] = useState('');

          const { data, isLoading } = useManagers({ page, limit: 10 });
          const managers = data?.data || [];
          const pagination = data?.pagination;

          const openPermissions = (id: string, name: string) => {
                    setPermManagerId(id);
                    setPermManagerName(name);
          };

          return (
                    <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h4" fontWeight={700}>
                                                  {locale === 'ar' ? 'إدارة المديرين' : 'Managers Management'}
                                        </Typography>
                                        <Button
                                                  variant="contained"
                                                  startIcon={<Add />}
                                                  onClick={() => setIsFormOpen(true)}
                                                  sx={{ borderRadius: 2 }}
                                        >
                                                  {locale === 'ar' ? 'إضافة مدير' : 'Add Manager'}
                                        </Button>
                              </Box>

                              <Card>
                                        <ManagersTable
                                                  managers={managers}
                                                  isLoading={isLoading}
                                                  page={page}
                                                  onOpenPermissions={openPermissions}
                                        />
                              </Card>

                              {pagination && pagination.totalPages > 1 && (
                                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                                  <Pagination
                                                            count={pagination.totalPages}
                                                            page={page}
                                                            onChange={(_, v) => setPage(v)}
                                                            color="primary"
                                                            shape="rounded"
                                                  />
                                        </Box>
                              )}

                              <ManagerFormDialog open={isFormOpen} onClose={() => setIsFormOpen(false)} />

                              <ManagerPermissionsDialog
                                        open={!!permManagerId}
                                        onClose={() => setPermManagerId(null)}
                                        managerId={permManagerId}
                                        managerName={permManagerName}
                              />
                    </Box>
          );
}
