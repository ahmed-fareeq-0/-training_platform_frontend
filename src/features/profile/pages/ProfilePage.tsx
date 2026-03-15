import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
          Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
          Button, useTheme, alpha, Divider, Skeleton
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Person, Email, Phone, Save, ContactPage } from '@mui/icons-material';

import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { useProfileMutations, useProfile, useTrainerProfile } from '../hooks/useProfile';
import { useUploads } from '../../../hooks/useUploads';
import ProfileUploader from '../components/ProfileUploader';
import ChangePasswordForm from '../components/ChangePasswordForm';
import FileUploader from '../../../components/common/FileUploader';
import specializationService from '../../../api/services/specialization.service';
import { UserRole } from '../../../types';

export default function ProfilePage() {
          const theme = useTheme();
          const { t } = useTranslation();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const { data, isLoading: isProfileLoading } = useProfile();
          const { updateProfile, updateTrainerProfile } = useProfileMutations();
          const { uploadCV, progress: cvProgress } = useUploads();

          const profileData = data || user;
          const { data: trainerData, isLoading: isTrainerLoading } = useTrainerProfile(profileData?.role);

          // Fetch specializations
          const specializationsQuery = useQuery({
                    queryKey: ['specializations', 'all'],
                    queryFn: async () => specializationService.getAll()
          });

          const [form, setForm] = useState({
                    full_name: '',
                    phone: '',
                    bio_ar: '',
                    bio_en: '',
                    qualifications: '',
                    specialization_id: '',
                    trainer_type: 'professional' as string,
                    academic_degree: '',
                    academic_specialization: '',
                    academic_title: '',
                    job_title: '',
                    core_skills: '',
                    experience_years: '' as string | number,
          });

          useEffect(() => {
                    if (profileData) {
                              setForm(prev => ({
                                        ...prev,
                                        full_name: profileData.full_name || '',
                                        phone: profileData.phone || '',
                              }));
                    }
          }, [profileData]);

          useEffect(() => {
                    if (trainerData) {
                              setForm(prev => ({
                                        ...prev,
                                        bio_ar: trainerData.bio_ar || '',
                                        bio_en: trainerData.bio_en || '',
                                        qualifications: trainerData.qualifications || '',
                                        specialization_id: trainerData.specialization_id || '',
                                        trainer_type: trainerData.trainer_type || 'professional',
                                        academic_degree: trainerData.academic_degree || '',
                                        academic_specialization: trainerData.academic_specialization || '',
                                        academic_title: trainerData.academic_title || '',
                                        job_title: trainerData.job_title || '',
                                        core_skills: trainerData.core_skills || '',
                                        experience_years: trainerData.experience_years ?? '',
                              }));
                    }
          }, [trainerData]);

          const handleSave = () => {
                    updateProfile.mutate({ full_name: form.full_name, phone: form.phone });

                    if (profileData?.role === UserRole.TRAINER && profileData?.id) {
                              // Use trainerData.id if available, otherwise fallback to profileData.id
                              // The backend should handle the case where the trainer record needs upserting
                              const targetId = trainerData?.id || profileData.id;

                              updateTrainerProfile.mutate({
                                        id: targetId,
                                        data: {
                                                  bio_ar: form.bio_ar,
                                                  bio_en: form.bio_en,
                                                  qualifications: form.qualifications,
                                                  specialization_id: form.specialization_id,
                                                  trainer_type: form.trainer_type,
                                                  academic_degree: form.academic_degree,
                                                  academic_specialization: form.academic_specialization,
                                                  academic_title: form.academic_title,
                                                  job_title: form.job_title,
                                                  core_skills: form.core_skills,
                                                  experience_years: form.experience_years !== '' ? Number(form.experience_years) : undefined,
                                        }
                              });
                    }
          };

          const handleImageUploaded = (newUrl: string) => {
                    updateProfile.mutate({ profile_image: newUrl });
          };

          const handleCVUploaded = async (files: File[]) => {
                    if (files.length > 0) {
                              const res = await uploadCV.mutateAsync(files[0]);
                              if (res?.url) {
                                        // Usually, you might update the user profile context with the new CV URL if the backend doesnt fully automate that part, but typically it returns the URL
                              }
                    }
          };

          if (isProfileLoading || (profileData?.role === UserRole.TRAINER && isTrainerLoading)) {
                    return <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />;
          }

          if (!profileData) return null;

          return (
                    <Box>
                              <Typography variant="h4" fontWeight={700} gutterBottom>{t('nav.profile')}</Typography>

                              <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                                  <Card sx={{ textAlign: 'center', height: '100%' }}>
                                                            <CardContent sx={{ p: 4 }}>
                                                                      <ProfileUploader
                                                                                currentImage={profileData.profile_image}
                                                                                onUploadSuccess={handleImageUploaded}
                                                                      />

                                                                      <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>{profileData.full_name}</Typography>
                                                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{profileData.email}</Typography>
                                                                      <Box sx={{ mt: 2, display: 'inline-block', px: 2, py: 0.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                                                                <Typography variant="body2" fontWeight={600} color="primary">{profileData.role?.replace('_', ' ').toUpperCase()}</Typography>
                                                                      </Box>
                                                            </CardContent>
                                                  </Card>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 8 }}>
                                                  <Card sx={{ height: '100%' }}>
                                                            <CardContent sx={{ p: 4 }}>
                                                                      <Typography variant="h6" fontWeight={600} gutterBottom>
                                                                                {locale === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
                                                                      </Typography>
                                                                      <Divider sx={{ mb: 3 }} />

                                                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                                                <TextField
                                                                                          label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                                                                          value={form.full_name}
                                                                                          onChange={e => setForm({ ...form, full_name: e.target.value })}
                                                                                          InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}><Person /></Box> }}
                                                                                />
                                                                                <TextField
                                                                                          label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                                                                          value={profileData.email || ''}
                                                                                          disabled
                                                                                          InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}><Email /></Box> }}
                                                                                />
                                                                                <TextField
                                                                                          label={locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                                                                          value={form.phone}
                                                                                          onChange={e => setForm({ ...form, phone: e.target.value })}
                                                                                          InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}><Phone /></Box> }}
                                                                                />

                                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                                                          <Button
                                                                                                    variant="contained" startIcon={<Save />} onClick={handleSave} disabled={updateProfile.isPending}
                                                                                                    sx={{ px: 4, py: 1.2 }}
                                                                                          >
                                                                                                    {updateProfile.isPending ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                                                                                          </Button>
                                                                                </Box>
                                                                      </Box>

                                                                      <Box sx={{ mt: 5 }}>
                                                                                <Divider sx={{ mb: 4 }} />
                                                                                <ChangePasswordForm />
                                                                      </Box>

                                                                      {profileData.role === UserRole.TRAINER && (
                                                                                <Box sx={{ mt: 5 }}>
                                                                                          <Divider sx={{ mb: 4 }} />

                                                                                          <Typography variant="h6" fontWeight={600} gutterBottom>
                                                                                                    {locale === 'ar' ? 'معلومات المدرب' : 'Trainer Information'}
                                                                                          </Typography>

                                                                                          {/* Trainer Type Toggle */}
                                                                                          <Box sx={{
                                                                                                    display: 'flex', gap: 2, mb: 4, p: 1.5,
                                                                                                    bgcolor: alpha(theme.palette.background.default, 0.6),
                                                                                                    borderRadius: 3, border: `1px solid ${theme.palette.divider}`
                                                                                          }}>
                                                                                                    <Button
                                                                                                              variant={form.trainer_type === 'professional' ? 'contained' : 'text'}
                                                                                                              onClick={() => setForm({ ...form, trainer_type: 'professional' })}
                                                                                                              fullWidth
                                                                                                              sx={{
                                                                                                                        py: 1.5, borderRadius: 2, fontWeight: 700,
                                                                                                                        ...(form.trainer_type === 'professional' ? {} : { color: 'text.secondary' })
                                                                                                              }}
                                                                                                    >
                                                                                                              {locale === 'ar' ? '🎯 مدرب محترف' : '🎯 Professional Trainer'}
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                              variant={form.trainer_type === 'university_professor' ? 'contained' : 'text'}
                                                                                                              onClick={() => setForm({ ...form, trainer_type: 'university_professor' })}
                                                                                                              fullWidth
                                                                                                              sx={{
                                                                                                                        py: 1.5, borderRadius: 2, fontWeight: 700,
                                                                                                                        ...(form.trainer_type === 'university_professor' ? {} : { color: 'text.secondary' })
                                                                                                              }}
                                                                                                    >
                                                                                                              {locale === 'ar' ? '🎓 أستاذ جامعي' : '🎓 University Professor'}
                                                                                                    </Button>
                                                                                          </Box>

                                                                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                                                                                                    {/* Category (renamed from Specialization) — always shown */}
                                                                                                    <TextField
                                                                                                              select
                                                                                                              label={locale === 'ar' ? 'الفئة' : 'Category'}
                                                                                                              value={form.specialization_id}
                                                                                                              onChange={e => setForm({ ...form, specialization_id: e.target.value })}
                                                                                                              helperText={locale === 'ar' ? 'يرجى اختيار فئتك التدريبية' : 'Please select your training category'}
                                                                                                              slotProps={{ select: { native: false } }}
                                                                                                    >
                                                                                                              {specializationsQuery.data?.data?.map((spec: any) => (
                                                                                                                        <MenuItem key={spec.id} value={spec.id}>
                                                                                                                                  {locale === 'ar' ? spec.name_ar : spec.name_en}
                                                                                                                        </MenuItem>
                                                                                                              ))}
                                                                                                    </TextField>

                                                                                                    {/* ---- Professional Trainer Fields ---- */}
                                                                                                    {form.trainer_type === 'professional' && (
                                                                                                              <>
                                                                                                                        <TextField
                                                                                                                                  label={locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                                                                                                                                  value={form.job_title}
                                                                                                                                  onChange={e => setForm({ ...form, job_title: e.target.value })}
                                                                                                                                  placeholder={locale === 'ar' ? 'مثال: مدرب تطوير ذاتي' : 'e.g. Personal Development Coach'}
                                                                                                                        />
                                                                                                                        <TextField
                                                                                                                                  label={locale === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                                                                                                                                  type="number"
                                                                                                                                  value={form.experience_years}
                                                                                                                                  onChange={e => setForm({ ...form, experience_years: e.target.value })}
                                                                                                                                  slotProps={{ htmlInput: { min: 0, max: 60 } }}
                                                                                                                        />
                                                                                                                        <TextField
                                                                                                                                  label={locale === 'ar' ? 'المهارات الأساسية' : 'Core Skills'}
                                                                                                                                  multiline rows={3}
                                                                                                                                  value={form.core_skills}
                                                                                                                                  onChange={e => setForm({ ...form, core_skills: e.target.value })}
                                                                                                                                  placeholder={locale === 'ar' ? 'اذكر مهاراتك الأساسية (مفصولة بفواصل)' : 'List your core skills (comma separated)'}
                                                                                                                        />
                                                                                                              </>
                                                                                                    )}

                                                                                                    {/* ---- University Professor Fields ---- */}
                                                                                                    {form.trainer_type === 'university_professor' && (
                                                                                                              <>
                                                                                                                        <TextField
                                                                                                                                  select
                                                                                                                                  label={locale === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
                                                                                                                                  value={form.academic_degree}
                                                                                                                                  onChange={e => setForm({ ...form, academic_degree: e.target.value })}
                                                                                                                                  slotProps={{ select: { native: false } }}
                                                                                                                        >
                                                                                                                                  <MenuItem value="bachelor">{locale === 'ar' ? 'بكالوريوس' : 'Bachelor'}</MenuItem>
                                                                                                                                  <MenuItem value="master">{locale === 'ar' ? 'ماجستير' : 'Master'}</MenuItem>
                                                                                                                                  <MenuItem value="phd">{locale === 'ar' ? 'دكتوراه' : 'PhD'}</MenuItem>
                                                                                                                        </TextField>
                                                                                                                        <TextField
                                                                                                                                  label={locale === 'ar' ? 'التخصص الأكاديمي' : 'Academic Specialization'}
                                                                                                                                  value={form.academic_specialization}
                                                                                                                                  onChange={e => setForm({ ...form, academic_specialization: e.target.value })}
                                                                                                                                  placeholder={locale === 'ar' ? 'مثال: هندسة البرمجيات' : 'e.g. Software Engineering'}
                                                                                                                        />
                                                                                                                        <TextField
                                                                                                                                  select
                                                                                                                                  label={locale === 'ar' ? 'اللقب العلمي' : 'Academic Title'}
                                                                                                                                  value={form.academic_title}
                                                                                                                                  onChange={e => setForm({ ...form, academic_title: e.target.value })}
                                                                                                                                  slotProps={{ select: { native: false } }}
                                                                                                                        >
                                                                                                                                  <MenuItem value="lecturer">{locale === 'ar' ? 'مدرس' : 'Lecturer'}</MenuItem>
                                                                                                                                  <MenuItem value="assistant_professor">{locale === 'ar' ? 'أستاذ مساعد' : 'Assistant Professor'}</MenuItem>
                                                                                                                                  <MenuItem value="associate_professor">{locale === 'ar' ? 'أستاذ مشارك' : 'Associate Professor'}</MenuItem>
                                                                                                                                  <MenuItem value="professor">{locale === 'ar' ? 'أستاذ' : 'Professor'}</MenuItem>
                                                                                                                        </TextField>
                                                                                                                        <TextField
                                                                                                                                  label={locale === 'ar' ? 'سنوات الخبرة الأكاديمية' : 'Years of Academic Experience'}
                                                                                                                                  type="number"
                                                                                                                                  value={form.experience_years}
                                                                                                                                  onChange={e => setForm({ ...form, experience_years: e.target.value })}
                                                                                                                                  slotProps={{ htmlInput: { min: 0, max: 60 } }}
                                                                                                                        />
                                                                                                              </>
                                                                                                    )}

                                                                                                    {/* Biography — always shown */}
                                                                                                    <TextField
                                                                                                              label={locale === 'ar' ? 'نبذة عنك (عربي)' : 'Bio (Arabic)'}
                                                                                                              multiline rows={3}
                                                                                                              value={form.bio_ar}
                                                                                                              onChange={e => setForm({ ...form, bio_ar: e.target.value })}
                                                                                                    />
                                                                                                    <TextField
                                                                                                              label={locale === 'ar' ? 'نبذة عنك (إنجليزي)' : 'Bio (English)'}
                                                                                                              multiline rows={3}
                                                                                                              value={form.bio_en}
                                                                                                              onChange={e => setForm({ ...form, bio_en: e.target.value })}
                                                                                                    />

                                                                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                                                                              <Button
                                                                                                                        variant="contained" startIcon={<Save />} onClick={handleSave} disabled={updateProfile.isPending || updateTrainerProfile.isPending}
                                                                                                                        sx={{ px: 4, py: 1.2 }}
                                                                                                              >
                                                                                                                        {updateTrainerProfile.isPending ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ معلومات المدرب' : 'Save Trainer Info')}
                                                                                                              </Button>
                                                                                                    </Box>
                                                                                          </Box>

                                                                                          <Divider sx={{ mb: 4 }} />

                                                                                          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                    <ContactPage color="primary" /> {locale === 'ar' ? 'السيرة الذاتية (CV)' : 'Curriculum Vitae (CV)'}
                                                                                          </Typography>
                                                                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                                                                    {locale === 'ar' ? 'قم بتحميل أو تحديث سيرتك الذاتية (بصيغة PDF فقط)' : 'Upload or update your CV (PDF format only)'}
                                                                                          </Typography>
                                                                                          <FileUploader
                                                                                                    accept=".pdf,application/pdf"
                                                                                                    maxSizeMB={10}
                                                                                                    isLoading={uploadCV.isPending}
                                                                                                    progress={cvProgress}
                                                                                                    onUpload={handleCVUploaded}
                                                                                          />
                                                                                </Box>
                                                                      )}
                                                            </CardContent>
                                                  </Card>
                                        </Grid>
                              </Grid>
                    </Box>
          );
}
