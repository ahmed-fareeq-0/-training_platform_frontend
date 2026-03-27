import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, FormControl, InputLabel,
    Select, MenuItem, OutlinedInput, Chip,
    FormHelperText,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateManager } from '../hooks/useManagers';
import specializationService from '../../../api/services/specialization.service';
import { useUIStore } from '../../../store/uiStore';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    full_name: z.string().min(3),
    phone: z.string().optional(),
    specialization_ids: z.array(z.string()).min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManagerFormDialog({
    open, onClose
}: {
    open: boolean; onClose: () => void;
}) {
    const { locale } = useUIStore();
    const createMut = useCreateManager();

    const { data: specData } = useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getAll(),
    });
    const specializations = specData?.data || [];

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '', password: '', full_name: '', phone: '', specialization_ids: [],
        }
    });

    const onSubmit = (data: FormValues) => {
        createMut.mutate(data, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{locale === 'ar' ? 'إضافة مدير جديد' : 'Add New Manager'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller name="full_name" control={control} render={({ field }) => (
                            <TextField {...field} label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} fullWidth error={!!errors.full_name} helperText={errors.full_name?.message} />
                        )} />
                        <Controller name="email" control={control} render={({ field }) => (
                            <TextField {...field} type="email" label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} fullWidth error={!!errors.email} helperText={errors.email?.message} />
                        )} />
                        <Controller name="password" control={control} render={({ field }) => (
                            <TextField {...field} type="password" label={locale === 'ar' ? 'كلمة المرور' : 'Password'} fullWidth error={!!errors.password} helperText={errors.password?.message} />
                        )} />
                        <Controller name="phone" control={control} render={({ field }) => (
                            <TextField {...field} label={locale === 'ar' ? 'رقم الهاتف' : 'Phone'} fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                        )} />

                        <FormControl fullWidth error={!!errors.specialization_ids}>
                            <InputLabel>{locale === 'ar' ? 'نطاق المراجعة (الفئات)' : 'Review Scope (Categories)'}</InputLabel>
                            <Controller
                                name="specialization_ids"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        multiple
                                        input={<OutlinedInput label={locale === 'ar' ? 'نطاق المراجعة (الفئات)' : 'Review Scope (Categories)'} />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const spec = specializations.find(s => s.id === value);
                                                    return <Chip key={value} label={locale === 'ar' ? spec?.name_ar : spec?.name_en} size="small" />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {specializations.map((spec) => (
                                            <MenuItem key={spec.id} value={spec.id}>
                                                {locale === 'ar' ? spec.name_ar : spec.name_en}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.specialization_ids && <FormHelperText>{errors.specialization_ids.message}</FormHelperText>}
                            {!errors.specialization_ids && <FormHelperText>{locale === 'ar' ? 'يحدد الفئات التي يمكن لهذا المدير مراجعتها — لا يقيّد وصول المتدربين' : 'Defines which enrollments & content this manager reviews — does not restrict trainee access'}</FormHelperText>}
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button type="submit" variant="contained" disabled={createMut.isPending}>
                        {createMut.isPending ? '...' : (locale === 'ar' ? 'إضافة' : 'Add')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
