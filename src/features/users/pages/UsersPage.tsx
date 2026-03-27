import { useState } from 'react';
import { Box, Typography, Card, Pagination } from '@mui/material';
import { useUIStore } from '../../../store/uiStore';
import { useUsers } from '../hooks/useUsers';
import UsersTable from '../components/UsersTable';
import UserFilters from '../components/UserFilters';

export default function UsersPage() {
    const { locale } = useUIStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const { data, isLoading } = useUsers(page, 10, roleFilter);

    const users = data?.data || [];
    const pagination = data?.pagination;

    // Client-side search (since backend doesn't seem to support search query param here based on the original code)
    const filteredUsers = search
        ? users.filter((u: any) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
        : users;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>
                    {locale === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
                </Typography>
            </Box>

            <UserFilters
                search={search}
                onSearchChange={setSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={(val) => { setRoleFilter(val); setPage(1); }}
            />

            <Card>
                <UsersTable users={filteredUsers} isLoading={isLoading} page={page} />
            </Card>

            {pagination && pagination.totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </Box>
    );
}
