import { Card, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useUIStore } from '../../../store/uiStore';
import { UserRole } from '../../../types';

interface UserFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    roleFilter: string;
    onRoleFilterChange: (val: string) => void;
}

export default function UserFilters({ search, onSearchChange, roleFilter, onRoleFilterChange }: UserFiltersProps) {
    const { locale } = useUIStore();

    return (
        <Card sx={{ mb: 3, p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
                size="small"
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                sx={{ minWidth: 250 }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{locale === 'ar' ? 'الدور' : 'Role'}</InputLabel>
                <Select
                    value={roleFilter}
                    label={locale === 'ar' ? 'الدور' : 'Role'}
                    onChange={e => onRoleFilterChange(e.target.value)}
                >
                    <MenuItem value="">{locale === 'ar' ? 'الكل' : 'All'}</MenuItem>
                    {Object.values(UserRole).map(r => (
                        <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Card>
    );
}
