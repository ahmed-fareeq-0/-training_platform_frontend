import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, Link, Alert, MenuItem,
  useTheme, alpha, ToggleButtonGroup, ToggleButton,
  RadioGroup, FormControlLabel, Radio, FormControl,
  Grid, Stepper, Step, StepLabel
} from '@mui/material';
import {
  Email, Person, Phone, PersonAdd, School, Work
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
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
  bio_ar: z.string().min(10, t('validation.minLength', 'Must be at least 10 characters')),
  bio_en: z.string().min(10, t('validation.minLength', 'Must be at least 10 characters')),
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
  const location = useLocation();
  const { t } = useTranslation();
  const { locale } = useUIStore();
  const { login } = useAuthStore();

  const oauthState = location.state as { oauthToken?: string; email?: string; name?: string } | null;
  const [oauthToken, setOauthToken] = useState<string | null>(oauthState?.oauthToken || null);

  const [registerMode, setRegisterMode] = useState<'trainee' | 'trainer'>('trainee');
  const [serverError, setServerError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const trainerSteps = locale === 'ar'
    ? ['المعلومات الأساسية', 'المعلومات المهنية', 'السيرة الذاتية']
    : ['Basic Information', 'Professional Details', 'Biography'];

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

  useEffect(() => {
    if (oauthState?.oauthToken) {
      traineeForm.setValue('email', oauthState.email || '');
      traineeForm.setValue('full_name', oauthState.name || '');
      traineeForm.setValue('password', 'OauthDummyPassword1!');
      traineeForm.setValue('confirmPassword', 'OauthDummyPassword1!');

      trainerForm.setValue('email', oauthState.email || '');
      trainerForm.setValue('full_name', oauthState.name || '');
      trainerForm.setValue('password', 'OauthDummyPassword1!');
      trainerForm.setValue('confirmPassword', 'OauthDummyPassword1!');
    }
  }, [oauthState, traineeForm, trainerForm]);

  const onTraineeSubmit = async (data: TraineeForm) => {
    if (!oauthToken) return;
    try {
      setServerError('');
      const result = await authService.oauthRegisterTrainee({
        token: oauthToken,
        full_name: data.full_name,
        phone: data.phone,
      });
      login(result.user, result.accessToken, result.refreshToken);
      toast.success(t('auth.registerSuccess'));
      if (result.user.role === UserRole.SUPER_ADMIN) {
        navigate(getDashboardPath(result.user.role));
      } else {
        navigate('/home');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message || 'Registration failed');
    }
  };

  const onTrainerSubmit = async (data: TrainerForm) => {
    if (!oauthToken) return;
    try {
      setServerError('');
      const { confirmPassword: _, password: __, email: ___, ...rest } = data;
      await authService.oauthRegisterTrainer({
        ...rest,
        token: oauthToken,
      } as RegisterTrainerPayload & { token: string });
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
      setActiveStep(0);
    }
  };

  const handleNextTrainerStep = async () => {
    let isValid = false;
    if (activeStep === 0) {
      isValid = await trainerForm.trigger(['full_name', 'phone']);
    } else if (activeStep === 1) {
      isValid = await trainerForm.trigger([
        'trainer_type', 'category_id', 'experience_years', 'job_title',
        'core_skills', 'academic_title', 'academic_degree', 'academic_specialization'
      ]);
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBackTrainerStep = () => {
    setActiveStep((prev) => prev - 1);
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
            <Box
              component="img"
              src="/logo.png"
              alt={t('common.appName')}
              sx={{ width: '100%', maxWidth: '130px', }}
            />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {oauthToken ? (locale === 'ar' ? 'أكمل تسجيل حسابك' : 'Complete Registration') : t('auth.createAccount')}
            </Typography>

            {oauthToken && (
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
            )}
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
          )}

          {!oauthToken ? (
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, px: 2 }}>
                {locale === 'ar'
                  ? 'لضمان موثوقية الحسابات، يرجى المتابعة باستخدام حساب جوجل لإنشاء ملفك الشخصي.'
                  : 'To ensure account authenticity, please continue with your Google account to create your profile.'}
              </Typography>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  try {
                    setServerError('');
                    const result = await authService.oauthLogin(credentialResponse.credential);
                    if (result.requires_registration) {
                      setOauthToken(credentialResponse.credential);
                      traineeForm.setValue('email', result.email || '');
                      traineeForm.setValue('full_name', result.name || '');
                      traineeForm.setValue('password', 'OauthDummyPassword1!');
                      traineeForm.setValue('confirmPassword', 'OauthDummyPassword1!');

                      trainerForm.setValue('email', result.email || '');
                      trainerForm.setValue('full_name', result.name || '');
                      trainerForm.setValue('password', 'OauthDummyPassword1!');
                      trainerForm.setValue('confirmPassword', 'OauthDummyPassword1!');
                    } else {
                      login(result.user, result.accessToken, result.refreshToken);
                      toast.success(t('auth.loginSuccess'));
                      navigate('/home');
                    }
                  } catch (error) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    setServerError(axiosError.response?.data?.message || (locale === 'ar' ? 'فشل التسجيل بواسطة جوجل' : 'Google Registration Failed'));
                  }
                }}
                onError={() => {
                  setServerError(locale === 'ar' ? 'فشل التسجيل بواسطة جوجل' : 'Google Registration Failed');
                }}
              />
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={registerMode === 'trainee' ? traineeForm.handleSubmit(onTraineeSubmit) : trainerForm.handleSubmit(onTrainerSubmit as any)}
              noValidate
            >
              {registerMode === 'trainer' && (
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 1 }}>
                  {trainerSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              <Grid container spacing={3}>
                {/* ----- TRAINEE COMMON FIELDS ----- */}
                {registerMode === 'trainee' && (
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Controller name="full_name" control={traineeForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.fullName')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                    )} />
                    <Controller name="email" control={traineeForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.email')} type="email" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} slotProps={{ htmlInput: { readOnly: true } }} InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
                    )} />
                    <Controller name="phone" control={traineeForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.phone')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
                    )} />
                  </Grid>
                )}

                {/* ----- TRAINER STEP 1 (BASIC INFO) ----- */}
                {registerMode === 'trainer' && activeStep === 0 && (
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                    </Typography>
                    <Controller name="full_name" control={trainerForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.fullName')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                    )} />
                    <Controller name="email" control={trainerForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.email')} type="email" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} slotProps={{ htmlInput: { readOnly: true } }} InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
                    )} />
                    <Controller name="phone" control={trainerForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={t('auth.phone')} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
                    )} />
                  </Grid>
                )}

                {/* ----- TRAINER STEP 2 (PROFESSIONAL INFO) ----- */}
                {registerMode === 'trainer' && activeStep === 1 && (
                  <Grid size={{ xs: 12, md: 12 }}>
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

              {/* ----- TRAINER STEP 3 (BIOGRAPHY) ----- */}
              {registerMode === 'trainer' && activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 1, mb: 1 }}>
                      {locale === 'ar' ? 'السيرة الذاتية' : 'Biography'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Controller name="bio_ar" control={trainerForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={locale === 'ar' ? 'نبذة عنك (عربي)' : 'Bio (Arabic)'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} multiline rows={4} />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Controller name="bio_en" control={trainerForm.control} render={({ field, fieldState }) => (
                      <TextField {...field} label={locale === 'ar' ? 'نبذة عنك (إنجليزي)' : 'Bio (English)'} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth sx={{ mb: 2 }} multiline rows={4} />
                    )} />
                  </Grid>
                </Grid>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: registerMode === 'trainer' ? 4 : 2, gap: 2 }}>
                {registerMode === 'trainer' && activeStep > 0 && (
                  <Button type="button" variant="outlined" size="large" onClick={handleBackTrainerStep} sx={{ borderRadius: 1, py: 1.5, minWidth: 120 }}>
                    {locale === 'ar' ? 'السابق' : 'Back'}
                  </Button>
                )}

                {registerMode === 'trainer' && activeStep < trainerSteps.length - 1 ? (
                  <Button type="button" variant="contained" size="large" onClick={handleNextTrainerStep} sx={{ borderRadius: 1, py: 1.5, flex: 1, background: theme.palette.primary.main }}>
                    {locale === 'ar' ? 'التالي' : 'Next'}
                  </Button>
                ) : (
                  <Button
                    fullWidth={registerMode === 'trainee'}
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={activeForm.formState.isSubmitting}
                    sx={{
                      borderRadius: 1,
                      py: 1.5, flex: 1,
                      background: theme.palette.primary.main,
                    }}
                  >
                    {activeForm.formState.isSubmitting ? t('common.loading') : (registerMode === 'trainee' ? t('auth.register') : (locale === 'ar' ? 'إرسال طلب الانضمام كمدرب' : 'Submit Application'))}
                  </Button>
                )}
              </Box>
            </Box>
          )}

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
