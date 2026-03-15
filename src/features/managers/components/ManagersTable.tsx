import {
          Table, TableBody, TableCell, TableContainer,
          TableHead, TableRow, IconButton, Tooltip, Avatar,
          Skeleton, Typography, Box, useTheme, alpha
} from '@mui/material';
import { Shield, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useUIStore } from '../../../store/uiStore';
import { useDeleteManager } from '../hooks/useManagers';

interface ManagersTableProps {
          managers: any[];
          isLoading: boolean;
          page: number;
          onOpenPermissions: (id: string, name: string) => void;
}

export default function ManagersTable({ managers, isLoading, page, onOpenPermissions }: ManagersTableProps) {
          const theme = useTheme();
          const { locale } = useUIStore();
          const deleteMut = useDeleteManager();

          const handleDelete = (id: string) => {
                    if (confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المدير؟' : 'Are you sure you want to delete this manager?')) {
                              deleteMut.mutate(id);
                    }
          };

          return (
                    <TableContainer>
                              <Table>
                                        <TableHead>
                                                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                            <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'المدير' : 'Manager'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'البريد' : 'Email'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'الهاتف' : 'Phone'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'تاريخ الانضمام' : 'Joined Date'}</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                                      {locale === 'ar' ? 'إجراءات' : 'Actions'}
                                                            </TableCell>
                                                  </TableRow>
                                        </TableHead>
                                        <TableBody>
                                                  {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                                            <TableRow key={i}>
                                                                      {Array.from({ length: 6 }).map((_, j) => (
                                                                                <TableCell key={j}><Skeleton /></TableCell>
                                                                      ))}
                                                            </TableRow>
                                                  ))}

                                                  {!isLoading && managers.map((manager: any, idx: number) => (
                                                            <TableRow key={manager.id} hover>
                                                                      <TableCell>{(page - 1) * 10 + idx + 1}</TableCell>
                                                                      <TableCell>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                          <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.warning.main, fontSize: 14 }}>
                                                                                                    {manager.full_name?.charAt(0)}
                                                                                          </Avatar>
                                                                                          <Typography variant="body2" fontWeight={500}>{manager.full_name}</Typography>
                                                                                </Box>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Typography variant="body2" color="text.secondary">{manager.email}</Typography>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Typography variant="body2" color="text.secondary">{manager.phone || '-'}</Typography>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                          {dayjs(manager.created_at).format('DD/MM/YYYY')}
                                                                                </Typography>
                                                                      </TableCell>
                                                                      <TableCell align="center">
                                                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                                          <Tooltip title={locale === 'ar' ? 'إدارة الصلاحيات' : 'Manage Permissions'}>
                                                                                                    <IconButton size="small" color="primary" onClick={() => onOpenPermissions(manager.id, manager.full_name)}>
                                                                                                              <Shield fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                          <Tooltip title={locale === 'ar' ? 'حذف' : 'Delete'}>
                                                                                                    <IconButton
                                                                                                              size="small"
                                                                                                              color="error"
                                                                                                              onClick={() => handleDelete(manager.id)}
                                                                                                              disabled={deleteMut.isPending}
                                                                                                    >
                                                                                                              <Delete fontSize="small" />
                                                                                                    </IconButton>
                                                                                          </Tooltip>
                                                                                </Box>
                                                                      </TableCell>
                                                            </TableRow>
                                                  ))}

                                                  {!isLoading && managers.length === 0 && (
                                                            <TableRow>
                                                                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                                                <Typography color="text.secondary">
                                                                                          {locale === 'ar' ? 'لا توجد بيانات' : 'No data'}
                                                                                </Typography>
                                                                      </TableCell>
                                                            </TableRow>
                                                  )}
                                        </TableBody>
                              </Table>
                    </TableContainer>
          );
}
