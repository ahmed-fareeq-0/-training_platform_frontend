import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel,
    Select, MenuItem, FormHelperText, Grid,
    Stepper, Step, StepLabel, Box,
    CircularProgress, Typography, InputAdornment, IconButton
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkshop, useUpdateWorkshop } from '../hooks/useWorkshops';
import specializationService from '../../../api/services/specialization.service';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useUploads } from '../../../hooks/useUploads';
import type { Trainer, Specialization, Workshop } from '../../../types';
import { UserRole } from '../../../types';
import dayjs from 'dayjs';

const formSchema = z.object({
    title_ar: z.string().min(5),
    title_en: z.string().min(5),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    specialization_id: z.string().uuid(),
    trainer_id: z.string().uuid().optional().or(z.literal('')),
    price: z.number().min(0),
    total_seats: z.number().int().min(1),
    duration_hours: z.number().int().min(1),
    location_ar: z.string().optional().or(z.literal('')),
    location_en: z.string().optional().or(z.literal('')),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    session_start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    session_end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    cover_image: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated?: (workshopId: string) => void;
    workshop?: Workshop | null;
}

export default function WorkshopFormDialog({ open, onClose, onCreated, workshop }: Props) {
    const { locale } = useUIStore();
    const { user } = useAuthStore();
    const { uploadWorkshopCover, deleteUpload } = useUploads();
    const createMut = useCreateWorkshop();
    const updateMut = useUpdateWorkshop();

    const isTrainer = user?.role === UserRole.TRAINER;

    const isEdit = !!workshop;
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Info',
        locale === 'ar' ? 'اللوجستيات' : 'Logistics',
        locale === 'ar' ? 'الجدول الزمني' : 'Schedule',
    ];

    const { control, handleSubmit, reset, trigger, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title_ar: '', title_en: '', description_ar: '', description_en: '',
            specialization_id: '', trainer_id: '', price: 0, total_seats: 10,
            duration_hours: 1, location_ar: '', location_en: '',
            start_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
            end_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
            session_start_time: '09:00',
            session_end_time: '12:00',
            cover_image: ''
        }
    });

    const selectedSpecializationId = useWatch({ control, name: 'specialization_id' });

    const { data: specData } = useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getAll(),
    });
    const specializations: Specialization[] = specData?.data || [];

    const { data: trainersData, isLoading: isLoadingTrainers } = useQuery({
        queryKey: ['trainers', 'approved', selectedSpecializationId],
        queryFn: async () => {
            const params = selectedSpecializationId ? { specialization_id: selectedSpecializationId, limit: 100 } : { limit: 100 };
            const { data } = await api.get<{ data: Trainer[] }>(ENDPOINTS.TRAINERS.APPROVED, { params });
            return data.data;
        },
        enabled: !!selectedSpecializationId
    });
    const trainers: Trainer[] = trainersData || [];

    // Auto-fetch the trainer's own profile if they are a Trainer
    const { data: myTrainerProfile } = useQuery({
        queryKey: ['trainer', 'me'],
        queryFn: async () => {
            const { data } = await api.get<{ data: Trainer }>(ENDPOINTS.TRAINERS.ME);
            return data.data;
        },
        enabled: isTrainer && open
    });

    useEffect(() => {
        if (open) {
            setActiveStep(0);
        }
        if (workshop && open) {
            reset({
                title_ar: workshop.title_ar || '',
                title_en: workshop.title_en || '',
                description_ar: workshop.description_ar || '',
                description_en: workshop.description_en || '',
                specialization_id: workshop.specialization_id,
                trainer_id: workshop.trainer_id,
                price: Number(workshop.price),
                total_seats: workshop.total_seats,
                duration_hours: workshop.duration_hours,
                location_ar: workshop.location_ar || '',
                location_en: workshop.location_en || '',
                start_date: dayjs(workshop.start_date).format('YYYY-MM-DD'),
                end_date: dayjs(workshop.end_date).format('YYYY-MM-DD'),
                session_start_time: workshop.session_start_time?.substring(0, 5) || '09:00',
                session_end_time: workshop.session_end_time?.substring(0, 5) || '12:00',
                cover_image: workshop.cover_image || ''
            });
        } else if (!open) {
            reset();
        }
    }, [workshop, open, reset]);

    // Auto-set trainer_id for Trainer users when their profile loads
    useEffect(() => {
        if (isTrainer && myTrainerProfile && open && !isEdit) {
            reset((prev) => ({ ...prev, trainer_id: myTrainerProfile.id }));
        }
    }, [isTrainer, myTrainerProfile, open, isEdit, reset]);

    const onSubmit = (data: FormValues) => {
        // clean empty strings
        const payload: any = { ...data };
        if (!payload.cover_image) delete payload.cover_image;
        // For trainers, remove trainer_id if empty — backend auto-resolves it
        if (!payload.trainer_id) delete payload.trainer_id;

        // Dates and times are already in correct formats (YYYY-MM-DD and HH:mm)
        // Backend handles them directly now.

        if (isEdit) {
            updateMut.mutate({ id: workshop.id, data: payload }, {
                onSuccess: () => onClose()
            });
        } else {
            createMut.mutate(payload, {
                onSuccess: (data: any) => {
                    onClose();
                    if (onCreated && data?.id) {
                        onCreated(data.id);
                    }
                }
            });
        }
    };

    const isPending = createMut.isPending || updateMut.isPending;

    const handleNext = async () => {
        let fieldsToValidate: (keyof FormValues)[] = [];
        if (activeStep === 0) {
            fieldsToValidate = ['title_ar', 'title_en', 'description_ar', 'description_en', 'specialization_id', 'cover_image'];
        } else if (activeStep === 1) {
            fieldsToValidate = isTrainer
                ? ['total_seats', 'price', 'location_ar', 'location_en']
                : ['total_seats', 'price', 'location_ar', 'location_en', 'trainer_id'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setActiveStep((prev: number) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev: number) => prev - 1);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? (locale === 'ar' ? 'تعديل الورشة' : 'Edit Workshop') : (locale === 'ar' ? 'إضافة ورشة جديدة' : 'Add New Workshop')}</DialogTitle>

            <Box sx={{ width: '100%', pt: 2, px: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <div>
                <DialogContent dividers sx={{ minHeight: 350 }}>
                    {activeStep === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="title_ar" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} fullWidth error={!!errors.title_ar} helperText={errors.title_ar?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="title_en" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} fullWidth error={!!errors.title_en} helperText={errors.title_en?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="description_ar" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'} fullWidth multiline rows={3} error={!!errors.description_ar} helperText={errors.description_ar?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="description_en" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'} fullWidth multiline rows={3} error={!!errors.description_en} helperText={errors.description_en?.message} />
                                )} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth error={!!errors.specialization_id}>
                                    <InputLabel>{locale === 'ar' ? 'الفئة' : 'Category'}</InputLabel>
                                    <Controller name="specialization_id" control={control} render={({ field }) => (
                                        <Select {...field} label={locale === 'ar' ? 'الفئة' : 'Category'}>
                                            {specializations.map(s => (
                                                <MenuItem key={s.id} value={s.id}>{locale === 'ar' ? s.name_ar : s.name_en}</MenuItem>
                                            ))}
                                        </Select>
                                    )} />
                                    {errors.specialization_id && <FormHelperText>{errors.specialization_id.message}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="cover_image" control={control} render={({ field }) => (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {locale === 'ar' ? 'صورة الغلاف' : 'Cover Image'}
                                        </Typography>
                                        {!field.value ? (
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                disabled={uploadWorkshopCover.isPending}
                                                startIcon={uploadWorkshopCover.isPending ? <CircularProgress size={20} /> : <CloudUpload />}
                                            >
                                                {uploadWorkshopCover.isPending
                                                    ? (locale === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                                                    : (locale === 'ar' ? 'رفع صورة' : 'Upload Image')}
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const res = await uploadWorkshopCover.mutateAsync(file);
                                                                if (res && res.url) {
                                                                    field.onChange(res.url);
                                                                }
                                                            } catch (err) { }
                                                        }
                                                    }}
                                                />
                                            </Button>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={field.value}>
                                                    {field.value}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={async () => {
                                                        try {
                                                            if (typeof field.value === 'string' && field.value) {
                                                                await deleteUpload.mutateAsync(field.value);
                                                                field.onChange('');
                                                            }
                                                        } catch (e) { }
                                                    }}
                                                    disabled={deleteUpload.isPending}
                                                >
                                                    {deleteUpload.isPending ? <CircularProgress size={16} /> : <Delete fontSize="small" />}
                                                </IconButton>
                                            </Box>
                                        )}
                                        {errors.cover_image && <FormHelperText error>{errors.cover_image.message}</FormHelperText>}
                                    </Box>
                                )} />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Grid container spacing={3}>
                            {!isTrainer && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth error={!!errors.trainer_id}>
                                        <InputLabel>{locale === 'ar' ? 'المدرب' : 'Trainer'}</InputLabel>
                                        <Controller name="trainer_id" control={control} render={({ field }) => (
                                            <Select {...field} label={locale === 'ar' ? 'المدرب' : 'Trainer'} disabled={!selectedSpecializationId || isLoadingTrainers}>
                                                {isLoadingTrainers && <MenuItem disabled value="">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</MenuItem>}
                                                {!isLoadingTrainers && trainers.length === 0 && selectedSpecializationId && (
                                                    <MenuItem disabled value="">
                                                        {locale === 'ar' ? 'لا يوجد مدربين متاحين لهذه الفئة' : 'No trainers available for the selected category'}
                                                    </MenuItem>
                                                )}
                                                {!isLoadingTrainers && trainers.map(t => (
                                                    <MenuItem key={t.id} value={t.id}>{t.full_name || t.user?.full_name}</MenuItem>
                                                ))}
                                            </Select>
                                        )} />
                                        {errors.trainer_id && <FormHelperText>{errors.trainer_id.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="price" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" label={locale === 'ar' ? 'السعر' : 'Price'} fullWidth error={!!errors.price} helperText={errors.price?.message} onChange={e => field.onChange(Number(e.target.value))} InputProps={{ endAdornment: <InputAdornment position="end">IQD</InputAdornment> }} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="total_seats" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" label={locale === 'ar' ? 'عدد المقاعد' : 'Total Seats'} fullWidth error={!!errors.total_seats} helperText={errors.total_seats?.message} onChange={e => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="location_ar" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'الموقع (عربي)' : 'Location (Arabic)'} fullWidth error={!!errors.location_ar} helperText={errors.location_ar?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="location_en" control={control} render={({ field }) => (
                                    <TextField {...field} label={locale === 'ar' ? 'الموقع (إنجليزي)' : 'Location (English)'} fullWidth error={!!errors.location_en} helperText={errors.location_en?.message} />
                                )} />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 2 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="start_date" control={control} render={({ field }) => (
                                    <TextField {...field} type="date" label={locale === 'ar' ? 'تاريخ البداية' : 'Start Date'} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.start_date} helperText={errors.start_date?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="end_date" control={control} render={({ field }) => (
                                    <TextField {...field} type="date" label={locale === 'ar' ? 'تاريخ النهاية' : 'End Date'} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.end_date} helperText={errors.end_date?.message} />
                                )} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="session_start_time" control={control} render={({ field }) => (
                                    <TextField {...field} type="time" label={locale === 'ar' ? 'وقت بدء الجلسة' : 'Session Start Time'} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.session_start_time} helperText={errors.session_start_time?.message} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="session_end_time" control={control} render={({ field }) => (
                                    <TextField {...field} type="time" label={locale === 'ar' ? 'وقت انتهاء الجلسة' : 'Session End Time'} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.session_end_time} helperText={errors.session_end_time?.message} />
                                )} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="duration_hours" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" label={locale === 'ar' ? 'إجمالي المدة (ساعات)' : 'Total Duration (Hours)'} fullWidth error={!!errors.duration_hours} helperText={errors.duration_hours?.message} onChange={e => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="inherit" sx={{ mr: 'auto' }}>
                        {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {activeStep > 0 && (
                            <Button type="button" onClick={handleBack}>
                                {locale === 'ar' ? 'السابق' : 'Back'}
                            </Button>
                        )}

                        {activeStep < steps.length - 1 ? (
                            <Button type="button" variant="contained" onClick={handleNext}>
                                {locale === 'ar' ? 'التالي' : 'Next'}
                            </Button>
                        ) : (
                            <Button type="button" variant="contained" disabled={isPending} onClick={handleSubmit(onSubmit)}>
                                {isPending ? '...' : (locale === 'ar' ? 'حفظ' : 'Save')}
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </div>
        </Dialog>
    );
}
