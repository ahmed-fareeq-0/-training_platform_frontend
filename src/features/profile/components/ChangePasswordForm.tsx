import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useProfileMutations } from '../hooks/useProfile';

export default function ChangePasswordForm() {
    const { changePassword } = useProfileMutations();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        changePassword.mutate(
            { oldPassword, newPassword },
            {
                onSuccess: () => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                },
                onError: (err: any) => {
                    setError(err.response?.data?.message || 'Failed to change password');
                }
            }
        );
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }}>
            <Typography variant="h6" fontWeight={600}>Change Password</Typography>

            <TextField
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                fullWidth
                required
            />

            <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
            />

            <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
                error={!!error}
                helperText={error}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={changePassword.isPending}
                sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
        </Box>
    );
}
