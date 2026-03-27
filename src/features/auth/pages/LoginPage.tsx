import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, Link, Alert, useTheme, alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import authService from '../../../api/services/auth.service';
import { getDashboardPath } from '../../../components/guards/RouteGuards';
import { UserRole } from '../../../types';
import { AxiosError } from 'axios';

const getLoginSchema = (t: any) => z.object({
    email: z.string().email(t('validation.invalidEmail', 'Invalid email')),
    password: z.string().min(6, t('validation.passwordMin', 'Password must be at least 6 characters')),
});

type LoginForm = z.infer<ReturnType<typeof getLoginSchema>>;

export default function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login } = useAuthStore();
    const { locale } = useUIStore();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(getLoginSchema(t)),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setServerError('');
            const result = await authService.login(data);
            login(result.user, result.accessToken, result.refreshToken);
            toast.success(t('auth.loginSuccess'));
            if (result.user.role === UserRole.SUPER_ADMIN) {
                navigate(getDashboardPath(result.user.role));
            } else {
                navigate('/home');
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setServerError(axiosError.response?.data?.message || t('auth.invalidCredentials'));
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
                    width: '100%', maxWidth: 440, p: 1,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        {/* <Box
                            sx={{
                                width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <LoginIcon sx={{ color: '#fff', fontSize: 28 }} />
                        </Box> */}
                        <Box
                            component="img"
                            src="/logo.png"
                            alt={t('common.appName')}
                            sx={{ width: '100%', maxWidth: '130px', }}
                        />
                        <Typography variant="h4" fontWeight={700}>{t('auth.welcomeBack')}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {t('auth.login')}
                        </Typography>
                    </Box>

                    {serverError && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('auth.email')}
                                    type="email"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    sx={{ mb: 2.5 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start"><Email color="action" /></InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('auth.password')}
                                    type={showPassword ? 'text' : 'password'}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start"><Lock color="action" /></InputAdornment>
                                        ),
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

                        <Button
                            fullWidth type="submit" variant="contained" size="large"
                            disabled={isSubmitting}
                            sx={{
                                borderRadius: 1,
                                py: 1.5, fontSize: '1rem',
                                background: theme.palette.primary.main,
                            }}
                        >
                            {isSubmitting ? t('common.loading') : t('auth.login')}
                        </Button>

                        <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                            <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                                {locale === 'ar' ? 'أو' : 'OR'}
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    if (!credentialResponse.credential) return;
                                    try {
                                        setServerError('');
                                        const result = await authService.oauthLogin(credentialResponse.credential);
                                        if (result.requires_registration) {
                                            navigate('/register', {
                                                state: {
                                                    oauthToken: credentialResponse.credential,
                                                    email: result.email,
                                                    name: result.name
                                                }
                                            });
                                        } else {
                                            login(result.user, result.accessToken, result.refreshToken);
                                            toast.success(t('auth.loginSuccess'));
                                            if (result.user.role === UserRole.SUPER_ADMIN) {
                                                navigate(getDashboardPath(result.user.role));
                                            } else {
                                                navigate('/home');
                                            }
                                        }
                                    } catch (error) {
                                        const axiosError = error as AxiosError<{ message?: string }>;
                                        setServerError(axiosError.response?.data?.message || (locale === 'ar' ? 'فشل الدخول بواسطة جوجل' : 'Google Login Failed'));
                                    }
                                }}
                                onError={() => {
                                    setServerError(locale === 'ar' ? 'فشل الدخول بواسطة جوجل' : 'Google Login Failed');
                                }}
                            />
                        </Box>
                    </Box>

                    <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
                        {t('auth.noAccount')}{' '}
                        <Link component={RouterLink} to="/register" fontWeight={600} underline="hover">
                            {t('auth.register')}
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
