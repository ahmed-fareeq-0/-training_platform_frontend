import {
          Table, TableBody, TableCell, TableContainer,
          TableHead, TableRow, IconButton, Tooltip, Chip,
          Skeleton, useTheme, alpha, Box, Typography, Avatar
} from '@mui/material';
import { Block, CheckCircle, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useUIStore } from '../../../store/uiStore';
import { useUserMutations } from '../hooks/useUsers';

interface UsersTableProps {
          users: any[];
          isLoading: boolean;
          page: number;
}

export default function UsersTable({ users, isLoading, page }: UsersTableProps) {
          const theme = useTheme();
          const { locale } = useUIStore();
          const mutations = useUserMutations();

          const roleColors: Record<string, string> = {
                    super_admin: theme.palette.error.main,
                    manager: theme.palette.warning.main,
                    trainer: theme.palette.info.main,
                    trainee: theme.palette.success.main
          };

          return (
                    <TableContainer>
                              <Table>
                                        <TableHead>
                                                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                            <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'المستخدم' : 'User'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'البريد' : 'Email'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'الدور' : 'Role'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'الحالة' : 'Status'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'التاريخ' : 'Date'}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{locale === 'ar' ? 'إجراءات' : 'Actions'}</TableCell>
                                                  </TableRow>
                                        </TableHead>
                                        <TableBody>
                                                  {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                                            <TableRow key={i}>
                                                                      {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                                                            </TableRow>
                                                  ))}
                                                  {!isLoading && users.map((user: any, idx: number) => (
                                                            <TableRow key={user.id} hover>
                                                                      <TableCell>{(page - 1) * 10 + idx + 1}</TableCell>
                                                                      <TableCell>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                          <Avatar sx={{ width: 36, height: 36, bgcolor: roleColors[user.role] || theme.palette.grey[500], fontSize: 14 }}>
                                                                                                    {user.full_name?.charAt(0)}
                                                                                          </Avatar>
                                                                                          <Typography variant="body2" fontWeight={500}>{user.full_name}</Typography>
                                                                                </Box>
                                                                      </TableCell>
                                                                      <TableCell><Typography variant="body2" color="text.secondary">{user.email}</Typography></TableCell>
                                                                      <TableCell>
                                                                                <Chip label={user.role} size="small" sx={{ bgcolor: alpha(roleColors[user.role] || '#999', 0.1), color: roleColors[user.role], fontWeight: 600 }} />
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Chip label={user.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')} size="small" color={user.is_active ? 'success' : 'default'} />
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Typography variant="caption" color="text.secondary">{dayjs(user.created_at).format('DD/MM/YY')}</Typography>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                          {user.is_active ? (
                                                                                                    <Tooltip title={locale === 'ar' ? 'تعطيل' : 'Deactivate'}>
                                                                                                              <IconButton size="small" color="warning" onClick={() => mutations.deactivate.mutate(user.id)} disabled={mutations.deactivate.isPending}>
                                                                                                                        <Block fontSize="small" />
                                                                                                              </IconButton>
                                                                                                    </Tooltip>
                                                                                          ) : (
                                                                                                    <Tooltip title={locale === 'ar' ? 'تفعيل' : 'Activate'}>
                                                                                                              <IconButton size="small" color="success" onClick={() => mutations.activate.mutate(user.id)} disabled={mutations.activate.isPending}>
                                                                                                                        <CheckCircle fontSize="small" />
                                                                                                              </IconButton>
                                                                                                    </Tooltip>
                                                                                          )}
                                                                                          <Tooltip title={locale === 'ar' ? 'حذف' : 'Delete'}>
                                                                                                    <Box component="span">
                                                                                                              <IconButton
                                                                                                                        size="small"
                                                                                                                        color="error"
                                                                                                                        onClick={() => {
                                                                                                                                  if (window.confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to hard delete this user? This action cannot be undone.')) {
                                                                                                                                            mutations.remove.mutate(user.id);
                                                                                                                                  }
                                                                                                                        }}
                                                                                                                        disabled={mutations.remove.isPending}
                                                                                                              >
                                                                                                                        <Delete fontSize="small" />
                                                                                                              </IconButton>
                                                                                                    </Box>
                                                                                          </Tooltip>
                                                                                </Box>
                                                                      </TableCell>
                                                            </TableRow>
                                                  ))}
                                                  {!isLoading && users.length === 0 && (
                                                            <TableRow>
                                                                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                                                                <Typography color="text.secondary">{locale === 'ar' ? 'لا توجد بيانات' : 'No data'}</Typography>
                                                                      </TableCell>
                                                            </TableRow>
                                                  )}
                                        </TableBody>
                              </Table>
                    </TableContainer>
          );
}
