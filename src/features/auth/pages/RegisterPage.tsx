import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Link, Alert, MenuItem,
  useTheme, alpha, ToggleButtonGroup, ToggleButton,
  RadioGroup, FormControlLabel, Radio, FormControl,
  Grid
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Person,
  Phone, PersonAdd, School, Work
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import authService, { RegisterTrainerPayload } from '../../../api/services/auth.service';
import { getDashboardPath } from '../../../components/guards/RouteGuards';
import { UserRole } from '../../../types';
import { AxiosError } from 'axios';
import { useSpecializations } from '../../specializations/hooks/useSpecializations';

const getTraineeSchema = (t: any) => z.object({
  full_name: z.string().min(3, t('validation.nameMin', 'Name must be at least 3 characters')),
  email: z.string().email(t('validation.invalidEmail', 'Invalid email')),
  password: z.string().min(8, t('validation.passwordMinReg', 'Password must be at least 8 characters')),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordMismatch', 'Passwords do not match'),
  path: ['confirmPassword'],
});

const getTrainerSchema = (t: any) => z.object({
  full_name: z.string().min(3, t('validation.nameMin', 'Name must be at least 3 characters')),
  email: z.string().email(t('validation.invalidEmail', 'Invalid email')),
  password: z.string().min(8, t('validation.passwordMinReg', 'Password must be at least 8 characters')),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  trainer_type: z.enum(['professional', 'university_prof']),
  category_id: z.string().min(1, t('validation.required', 'Required')),
  experience_years: z.number().min(0, t('validation.minZero', 'Must be at least 0')),
  bio_ar: z.string().optional(),
  bio_en: z.string().optional(),
  job_title: z.string().optional(),
  core_skills: z.string().optional(),
  academic_degree: z.string().optional(),
  academic_specialization: z.string().optional(),
  academic_title: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordMismatch', 'Passwords do not match'),
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.trainer_type === 'professional') {
    if (!data.job_title?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.required', 'Required'), path: ['job_title'] });
    }
    if (!data.core_skills?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.required', 'Required'), path: ['core_skills'] });
    }
  } else if (data.trainer_type === 'university_prof') {
    if (!data.academic_degree?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.required', 'Required'), path: ['academic_degree'] });
    }
    if (!data.academic_specialization?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.required', 'Required'), path: ['academic_specialization'] });
    }
    if (!data.academic_title?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.required', 'Required'), path: ['academic_title'] });
    }
  }
});

type TraineeForm = z.infer<ReturnType<typeof getTraineeSchema>>;
type TrainerForm = z.infer<ReturnType<typeof getTrainerSchema>>;

export default function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useUIStore();
  const { login } = useAuthStore();
  
  const [registerMode, setRegisterMode] = useState<'trainee' | 'trainer'>('trainee');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  const { data: specializations } = useSpecializations();

  // Trainee Form Hook
  const traineeForm = useForm<TraineeForm>({
    resolver: zodResolver(getTraineeSchema(t)),
    defaultValues: { full_name: '', email: '', password: '', confirmPassword: '', phone: '' },
  });

  // Trainer Form Hook
  const trainerForm = useForm<TrainerForm>({
    resolver: zodResolver(getTrainerSchema(t)),
    defaultValues: {
      full_name: '', email: '', password: '', confirmPassword: '', phone: '',
      trainer_type: 'professional', category_id: '', experience_years: 0,
      bio_ar: '', bio_en: '', job_title: '', core_skills: '',
      academic_degree: '', academic_specialization: '', academic_title: ''
    },
  });

  const onTraineeSubmit = async (data: TraineeForm) => {
    try {
      setServerError('');
      const { confirmPassword: _, ...payload } = data;
      const result = await authService.register({ ...payload, role: UserRole.TRAINEE });
      login(result.user, result.accessToken, result.refreshToken);
      toast.success(t('auth.registerSuccess'));
      navigate(getDashboardPath(result.user.role));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message || 'Registration failed');
    }
  };

  const onTrainerSubmit = async (data: TrainerForm) => {
    try {
      setServerError('');
      const { confirmPassword: _, ...payload } = data;
      await authService.registerTrainer(payload as RegisterTrainerPayload);
      toast.success(t('auth.registerSuccess'));
      setPendingApproval(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message || 'Registration failed');
    }
  };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'trainee' | 'trainer' | null,
  ) => {
    if (newMode !== null) {
      setRegisterMode(newMode);
      setServerError('');
    }
  };

  const activeForm = registerMode === 'trainee' ? traineeForm : trainerForm;
  const watchTrainerType = trainerForm.watch('trainer_type');

  if (pendingApproval) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`, p: 2 }}>
        <Card sx={{ width: '100%', maxWidth: 480, p: 3, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <School sx={{ color: theme.palette.success.main, fontSize: 32 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {locale === 'ar' ? 'تم إرسال الطلب!' : 'Request Submitted!'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {locale === 'ar' 
              ? 'لقد تلقينا طلب انضمامك كمدرب. سيقوم فريقنا بمراجعة التفاصيل الخاصة بك وسيتم إعلامك فور الموافقة. يمكنك تسجيل الدخول بعد ذلك.' 
              : 'Your application to join as a trainer has been received. Our team will review your details and you will be notified once approved. You can then log in.'}
          </Typography>
          <Button variant="contained" component={RouterLink} to="/login" fullWidth size="large">
            {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Return to Login'}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`, p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: registerMode === 'trainer' ? 900 : 480, p: 1, backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.divider}`, transition: 'max-width 0.3s' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonAdd sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>{t('auth.createAccount')}</Typography>
            
            <ToggleButtonGroup
              value={registerMode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              sx={{ mt: 2, '& .MuiToggleButton-root': { py: 1.5 } }}
            >
              <ToggleButton value="trainee">
                <School sx={{ mr: 1, fontSize: 20 }} />
                {locale === 'ar' ? 'انضم كمتدرب' : 'Join as Trainee'}
              </ToggleButton>
              <ToggleButton value="trainer">
                <Work sx={{ mr: 1, fontSize: 20 }} />
                {locale === 'ar' ? 'انضم كمدرب' : 'Join as Trainer'}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
          )}

          <Box 
            component="form" 
            onSubmit={registerMode === 'trainee' ? traineeForm.handleSubmit(onTraineeSubmit) : trainerForm.handleSubmit(onTrainerSubmit as any)} 
            noValidate
          >
            <Grid container spacing={3}>
              {/* ----- TRAINEE COMMON FIELDS ----- */}
              {registerMode === 'trainee' && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Controller name="full_name" control={traineeForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.fullName')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="email" control={traineeForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.email')} type="email" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="phone" control={traineeForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.phone')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="password" control={traineeForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.password')} type={showPassword ? 'text' : 'password'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                    }} />
                  )} />
                  <Controller name="confirmPassword" control={traineeForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.confirmPassword')} type={showPassword ? 'text' : 'password'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }} />
                  )} />
                </Grid>
              )}

              {/* ----- TRAINER COMMON FIELDS ----- */}
              {registerMode === 'trainer' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                  </Typography>
                  <Controller name="full_name" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.fullName')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="email" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.email')} type="email" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="phone" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.phone')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
                  )} />
                  <Controller name="password" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.password')} type={showPassword ? 'text' : 'password'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                    }} />
                  )} />
                  <Controller name="confirmPassword" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={t('auth.confirmPassword')} type={showPassword ? 'text' : 'password'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }} />
                  )} />
                </Grid>
              )}

              {/* Trainer Specific Fields */}
              {registerMode === 'trainer' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {locale === 'ar' ? 'المعلومات المهنية' : 'Professional Information'}
                  </Typography>

                  <Controller name="trainer_type" control={trainerForm.control} render={({ field, fieldState }) => (
                    <FormControl component="fieldset" error={!!fieldState.error} sx={{ mb: 3, width: '100%' }}>
                      <RadioGroup row {...field} sx={{ justifyContent: 'space-around', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                        <FormControlLabel value="professional" control={<Radio />} label={locale === 'ar' ? 'مدرب محترف' : 'Professional Trainer'} />
                        <FormControlLabel value="university_prof" control={<Radio />} label={locale === 'ar' ? 'أستاذ جامعي' : 'University Professor'} />
                      </RadioGroup>
                    </FormControl>
                  )} />

                  <Controller name="category_id" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} select label={locale === 'ar' ? 'الفئة' : 'Category'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} slotProps={{ select: { native: false } }}>
                      {specializations?.data?.map((spec: any) => (
                        <MenuItem key={spec.id} value={spec.id}>{locale === 'ar' ? spec.name_ar : spec.name_en}</MenuItem>
                      ))}
                    </TextField>
                  )} />

                  <Controller name="experience_years" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField 
                      {...field} 
                      type="number" 
                      label={
                        watchTrainerType === 'professional' 
                          ? (locale === 'ar' ? 'سنوات الخبرة' : 'Years of Experience') 
                          : (locale === 'ar' ? 'سنوات الخبرة الأكاديمية' : 'Years of Academic Experience')
                      } 
                      error={!!fieldState.error} 
                      helperText={fieldState.error?.message} 
                      fullWidth 
                      sx={{ mb: 2 }} 
                      onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                    />
                  )} />

                  {watchTrainerType === 'professional' ? (
                    <>
                      <Controller name="job_title" control={trainerForm.control} render={({ field, fieldState }) => (
                        <TextField {...field} label={locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title'} placeholder={locale === 'ar' ? 'مثال: مدرب تطوير ذاتي' : 'e.g. Personal Development Coach'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} />
                      )} />
                      <Controller name="core_skills" control={trainerForm.control} render={({ field, fieldState }) => (
                        <TextField {...field} label={locale === 'ar' ? 'المهارات الأساسية' : 'Core Skills'} placeholder={locale === 'ar' ? 'اذكر مهاراتك الأساسية (مفصولة بفواصل)' : 'List your core skills (comma separated)'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} multiline rows={2} />
                      )} />
                    </>
                  ) : (
                    <>
                      <Controller name="academic_title" control={trainerForm.control} render={({ field, fieldState }) => (
                        <TextField {...field} select label={locale === 'ar' ? 'اللقب العلمي' : 'Academic Title'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} slotProps={{ select: { native: false } }}>
                          <MenuItem value="lecturer">{locale === 'ar' ? 'مدرس' : 'Lecturer'}</MenuItem>
                          <MenuItem value="assistant_professor">{locale === 'ar' ? 'أستاذ مساعد' : 'Assistant Professor'}</MenuItem>
                          <MenuItem value="associate_professor">{locale === 'ar' ? 'أستاذ مشارك' : 'Associate Professor'}</MenuItem>
                          <MenuItem value="professor">{locale === 'ar' ? 'أستاذ' : 'Professor'}</MenuItem>
                        </TextField>
                      )} />
                      <Controller name="academic_degree" control={trainerForm.control} render={({ field, fieldState }) => (
                        <TextField {...field} select label={locale === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} slotProps={{ select: { native: false } }}>
                          <MenuItem value="bachelor">{locale === 'ar' ? 'بكالوريوس' : 'Bachelor'}</MenuItem>
                          <MenuItem value="master">{locale === 'ar' ? 'ماجستير' : 'Master'}</MenuItem>
                          <MenuItem value="phd">{locale === 'ar' ? 'دكتوراه' : 'PhD'}</MenuItem>
                        </TextField>
                      )} />
                      <Controller name="academic_specialization" control={trainerForm.control} render={({ field, fieldState }) => (
                        <TextField {...field} label={locale === 'ar' ? 'التخصص الأكاديمي' : 'Academic Specialization'} placeholder={locale === 'ar' ? 'مثال: هندسة البرمجيات' : 'e.g. Software Engineering'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} />
                      )} />
                    </>
                  )}
                </Grid>
              )}
            </Grid>

            {registerMode === 'trainer' && (
              <Grid container spacing={3} sx={{ mt: -1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller name="bio_ar" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={locale === 'ar' ? 'نبذة عنك (عربي)' : 'Bio (Arabic)'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2, mt: 1 }} multiline rows={3} />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller name="bio_en" control={trainerForm.control} render={({ field, fieldState }) => (
                    <TextField {...field} label={locale === 'ar' ? 'نبذة عنك (إنجليزي)' : 'Bio (English)'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 3, mt: 1 }} multiline rows={3} />
                  )} />
                </Grid>
              </Grid>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={activeForm.formState.isSubmitting}
              sx={{
                py: 1.5, fontSize: '1rem', mt: registerMode === 'trainer' ? 0 : 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              {activeForm.formState.isSubmitting ? t('common.loading') : (registerMode === 'trainee' ? t('auth.register') : (locale === 'ar' ? 'إرسال طلب الانضمام كمدرب' : 'Submit Trainer Application'))}
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
