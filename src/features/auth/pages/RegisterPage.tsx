import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
          Box, Card, CardContent, Typography, TextField, Button,
          InputAdornment, IconButton, Link, Alert, MenuItem,
          useTheme, alpha,
} from '@mui/material';
import {
          Visibility, VisibilityOff, Email, Lock, Person,
          Phone, PersonAdd,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import authService from '../../../api/services/auth.service';
import { getDashboardPath } from '../../../components/guards/RouteGuards';
import { UserRole } from '../../../types';
import { AxiosError } from 'axios';

const getRegisterSchema = (t: any) => z.object({
          full_name: z.string().min(3, t('validation.nameMin', 'Name must be at least 3 characters')),
          email: z.string().email(t('validation.invalidEmail', 'Invalid email')),
          password: z.string().min(8, t('validation.passwordMinReg', 'Password must be at least 8 characters')),
          confirmPassword: z.string(),
          phone: z.string().optional(),
          role: z.string().min(1, t('validation.roleRequired', 'Role is required')),
}).refine((data) => data.password === data.confirmPassword, {
          message: t('validation.passwordMismatch', 'Passwords do not match'),
          path: ['confirmPassword'],
});

type RegisterForm = z.infer<ReturnType<typeof getRegisterSchema>>;

const roleOptions = [
          { value: UserRole.TRAINEE, labelKey: 'auth.roles.trainee' },
          { value: UserRole.TRAINER, labelKey: 'auth.roles.trainer' },
];

export default function RegisterPage() {
          const theme = useTheme();
          const navigate = useNavigate();
          const { t } = useTranslation();
          const { login } = useAuthStore();
          const [showPassword, setShowPassword] = useState(false);
          const [serverError, setServerError] = useState('');

          const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
                    resolver: zodResolver(getRegisterSchema(t)),
                    defaultValues: { full_name: '', email: '', password: '', confirmPassword: '', phone: '', role: '' },
          });

          const onSubmit = async (data: RegisterForm) => {
                    try {
                              setServerError('');
                              const { confirmPassword: _, ...payload } = data;
                              const result = await authService.register(payload);
                              login(result.user, result.accessToken, result.refreshToken);
                              toast.success(t('auth.registerSuccess'));
                              navigate(getDashboardPath(result.user.role));
                    } catch (error) {
                              const axiosError = error as AxiosError<{ message?: string }>;
                              setServerError(axiosError.response?.data?.message || 'Registration failed');
                    }
          };

          return (
                    <Box
                              sx={{
                                        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
                                        p: 2,
                              }}
                    >
                              <Card
                                        sx={{
                                                  width: '100%', maxWidth: 480, p: 1,
                                                  backdropFilter: 'blur(20px)',
                                                  border: `1px solid ${theme.palette.divider}`,
                                        }}
                              >
                                        <CardContent sx={{ p: 4 }}>
                                                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                                                            <Box
                                                                      sx={{
                                                                                width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
                                                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                      }}
                                                            >
                                                                      <PersonAdd sx={{ color: '#fff', fontSize: 28 }} />
                                                            </Box>
                                                            <Typography variant="h4" fontWeight={700}>{t('auth.createAccount')}</Typography>
                                                  </Box>

                                                  {serverError && (
                                                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{serverError}</Alert>
                                                  )}

                                                  <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                                                            <Controller name="full_name" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} label={t('auth.fullName')} error={!!errors.full_name}
                                                                                          helperText={errors.full_name?.message} sx={{ mb: 2 }}
                                                                                          InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
                                                                                />
                                                                      )}
                                                            />

                                                            <Controller name="email" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} label={t('auth.email')} type="email" error={!!errors.email}
                                                                                          helperText={errors.email?.message} sx={{ mb: 2 }}
                                                                                          InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
                                                                                />
                                                                      )}
                                                            />

                                                            <Controller name="phone" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} label={t('auth.phone')} error={!!errors.phone}
                                                                                          helperText={errors.phone?.message} sx={{ mb: 2 }}
                                                                                          InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }}
                                                                                />
                                                                      )}
                                                            />

                                                            <Controller name="role" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} select label={t('auth.selectRole')} error={!!errors.role}
                                                                                          helperText={errors.role?.message} sx={{ mb: 2 }}
                                                                                >
                                                                                          {roleOptions.map((opt) => (
                                                                                                    <MenuItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</MenuItem>
                                                                                          ))}
                                                                                </TextField>
                                                                      )}
                                                            />

                                                            <Controller name="password" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} label={t('auth.password')}
                                                                                          type={showPassword ? 'text' : 'password'}
                                                                                          error={!!errors.password} helperText={errors.password?.message} sx={{ mb: 2 }}
                                                                                          InputProps={{
                                                                                                    startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                                                                                    endAdornment: (
                                                                                                              <InputAdornment position="end">
                                                                                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                                                                                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                                                                        </IconButton>
                                                                                                              </InputAdornment>
                                                                                                    ),
                                                                                          }}
                                                                                />
                                                                      )}
                                                            />

                                                            <Controller name="confirmPassword" control={control}
                                                                      render={({ field }) => (
                                                                                <TextField {...field} label={t('auth.confirmPassword')}
                                                                                          type={showPassword ? 'text' : 'password'}
                                                                                          error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} sx={{ mb: 3 }}
                                                                                          InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
                                                                                />
                                                                      )}
                                                            />

                                                            <Button fullWidth type="submit" variant="contained" size="large"
                                                                      disabled={isSubmitting}
                                                                      sx={{
                                                                                py: 1.5, fontSize: '1rem',
                                                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                                      }}
                                                            >
                                                                      {isSubmitting ? t('common.loading') : t('auth.register')}
                                                            </Button>
                                                  </Box>

                                                  <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
                                                            {t('auth.hasAccount')}{' '}
                                                            <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
                                                                      {t('auth.login')}
                                                            </Link>
                                                  </Typography>
                                        </CardContent>
                              </Card>
                    </Box>
          );
}
