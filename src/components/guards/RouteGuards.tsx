import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Box, CircularProgress } from '@mui/material';

interface RoleGuardProps {
          children: React.ReactNode;
          roles?: UserRole[];
}

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
          const { isAuthenticated, isLoading } = useAuthStore();
          const location = useLocation();

          if (isLoading) {
                    return (
                              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (!isAuthenticated) {
                    return <Navigate to="/login" state={{ from: location }} replace />;
          }

          return <>{children}</>;
};

export const RoleGuard = ({ children, roles }: RoleGuardProps) => {
          const { user, isLoading } = useAuthStore();

          if (isLoading) {
                    return (
                              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (!user) {
                    return <Navigate to="/login" replace />;
          }

          if (roles && !roles.includes(user.role)) {
                    return <Navigate to="/unauthorized" replace />;
          }

          return <>{children}</>;
};

export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
          const { isAuthenticated, isLoading, user } = useAuthStore();

          if (isLoading) {
                    return (
                              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (isAuthenticated && user) {
                    if (user.role === UserRole.SUPER_ADMIN) {
                              return <Navigate to={getDashboardPath(user.role)} replace />;
                    }
                    return <Navigate to="/home" replace />;
          }

          return <>{children}</>;
};

export const getDashboardPath = (role: UserRole): string => {
          switch (role) {
                    case UserRole.SUPER_ADMIN:
                              return '/dashboard/admin';
                    case UserRole.MANAGER:
                              return '/dashboard/manager';
                    case UserRole.TRAINER:
                              return '/dashboard/trainer';
                    case UserRole.TRAINEE:
                              return '/dashboard/trainee';
                    default:
                              return '/dashboard';
          }
};
