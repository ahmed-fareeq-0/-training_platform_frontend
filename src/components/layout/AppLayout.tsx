import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import GlobalLoadingBar from '../common/GlobalLoadingBar';

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  // Guests (!user) or standard roles (Trainee, Trainer, Manager) use top header navigation and wider padding.
  // Admins use the sidebar.
  const isHeaderNavRole = !user || [UserRole.TRAINEE, UserRole.TRAINER, UserRole.MANAGER].includes(user.role as UserRole);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <GlobalLoadingBar />
      {!isHeaderNavRole && <Sidebar />}
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile || !sidebarOpen || isHeaderNavRole ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
          transition: 'all 0.3s ease',
          py: 4,
          px: isHeaderNavRole ? { xs: 2, sm: 3, md: 6, lg: 10, xl: 14 } : { xs: 2, sm: 3 },
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        {isHeaderNavRole && <Footer />}
      </Box>
    </Box>
  );
}
