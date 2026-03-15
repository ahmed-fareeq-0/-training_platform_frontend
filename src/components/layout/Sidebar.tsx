import {
          Box,
          Drawer,
          List,
          ListItem,
          ListItemButton,
          ListItemIcon,
          ListItemText,
          Toolbar,
          Divider,
          Typography,
          useTheme,
          useMediaQuery,
          alpha,
} from '@mui/material';
import {
          Dashboard as DashboardIcon,
          School as WorkshopsIcon,
          EventSeat as BookingsIcon,
          People as UsersIcon,
          SupervisorAccount as ManagersIcon,
          Person as TrainersIcon,

          Category as SpecializationsIcon,
          Star as ReviewsIcon,
          BarChart as StatisticsIcon,
          Person,
          Logout,
          Favorite,
          MenuBook as CoursesIcon,
          AssignmentTurnedIn as EnrollmentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { UserRole } from '../../types';
import { getDashboardPath } from '../guards/RouteGuards';

const DRAWER_WIDTH = 280;

export interface NavItem {
          key: string;
          labelKey: string;
          icon: React.ReactNode;
          path: string;
          roles?: UserRole[];
}

export const getNavItems = (userRole: UserRole): NavItem[] => {
          const items: NavItem[] = [
                    { key: 'dashboard', labelKey: 'nav.dashboard', icon: <DashboardIcon />, path: getDashboardPath(userRole) },
                    { key: 'workshops', labelKey: 'nav.workshops', icon: <WorkshopsIcon />, path: '/workshops' },
                    { key: 'courses', labelKey: 'nav.courses', icon: <CoursesIcon />, path: '/courses' },
                    { key: 'bookings', labelKey: 'nav.bookings', icon: <BookingsIcon />, path: '/bookings' },
          ];

          if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MANAGER || userRole === UserRole.TRAINER) {
                    items.splice(3, 0, { key: 'course-manage', labelKey: 'nav.courseManage', icon: <CoursesIcon />, path: '/courses/manage' });
          }

          if (userRole === UserRole.TRAINEE) {
                    items.push(
                              { key: 'bookmarks', labelKey: 'nav.bookmarks', icon: <Favorite />, path: '/bookmarks' },
                    );
          }

          if (userRole === UserRole.SUPER_ADMIN) {
                    items.push(
                              { key: 'users', labelKey: 'nav.users', icon: <UsersIcon />, path: '/users' },
                              { key: 'managers', labelKey: 'nav.managers', icon: <ManagersIcon />, path: '/managers' },
                              { key: 'trainers', labelKey: 'nav.trainers', icon: <TrainersIcon />, path: '/trainers' },
                              { key: 'specializations', labelKey: 'nav.specializations', icon: <SpecializationsIcon />, path: '/specializations' },
                              { key: 'enrollment-requests', labelKey: 'nav.enrollmentRequests', icon: <EnrollmentIcon />, path: '/enrollment-requests' },
                    );
          }

          if (userRole === UserRole.MANAGER) {
                    items.push(
                              { key: 'trainers', labelKey: 'nav.trainers', icon: <TrainersIcon />, path: '/trainers' },
                              { key: 'enrollment-requests', labelKey: 'nav.enrollmentRequests', icon: <EnrollmentIcon />, path: '/enrollment-requests' },
                    );
          }

          items.push(
                    { key: 'reviews', labelKey: 'nav.reviews', icon: <ReviewsIcon />, path: '/reviews' },
                    { key: 'profile', labelKey: 'nav.profile', icon: <Person />, path: '/profile' },
          );

          if ([UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(userRole)) {
                    items.push(
                              { key: 'statistics', labelKey: 'nav.statistics', icon: <StatisticsIcon />, path: '/statistics' },
                    );
          }

          return items;
};

export default function Sidebar() {
          const theme = useTheme();
          const isMobile = useMediaQuery(theme.breakpoints.down('md'));
          const navigate = useNavigate();
          const location = useLocation();
          const { t } = useTranslation();
          const { user, logout } = useAuthStore();
          const { sidebarOpen, toggleSidebar } = useUIStore();

          if (!user) return null;

          const navItems = getNavItems(user.role);

          let activePath = '';
          let maxMatchLen = 0;
          navItems.forEach(item => {
                    if (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'))) {
                              if (item.path.length > maxMatchLen) {
                                        maxMatchLen = item.path.length;
                                        activePath = item.path;
                              }
                    }
          });

          return (
                    <Drawer
                              variant={isMobile ? 'temporary' : 'persistent'}
                              anchor="left"
                              open={sidebarOpen}
                              onClose={isMobile ? toggleSidebar : undefined}
                              sx={{
                                        width: sidebarOpen ? DRAWER_WIDTH : 0,
                                        flexShrink: 0,
                                        transition: 'width 0.3s ease',
                                        '& .MuiDrawer-paper': {
                                                  width: DRAWER_WIDTH,
                                                  boxSizing: 'border-box',
                                                  bgcolor: theme.palette.background.paper,
                                                  borderRight: `1px solid ${theme.palette.divider}`,
                                        },
                              }}
                    >
                              <Toolbar sx={{ gap: 1.5, px: 3 }}>
                                        <Box component="img" src="/logo.png" alt="Training Platform Logo" sx={{ width: '100%', maxWidth: '200px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => navigate(getDashboardPath(user?.role as UserRole))} />
                              </Toolbar>
                              <Divider />

                              <Box sx={{ p: 1.5, flex: 1, overflow: 'auto' }}>
                                        <Typography variant="overline" color="text.secondary" sx={{ px: 3, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                  MAIN MENU
                                        </Typography>
                                        <List disablePadding sx={{ px: 2 }}>
                                                  {navItems.map((item) => {
                                                            const isActive = item.path === activePath;
                                                            return (
                                                                      <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
                                                                                <ListItemButton
                                                                                          onClick={() => {
                                                                                                    navigate(item.path);
                                                                                                    if (isMobile) toggleSidebar();
                                                                                          }}
                                                                                          sx={{
                                                                                                    borderRadius: '50px',
                                                                                                    px: 2.5,
                                                                                                    py: 1.2,
                                                                                                    bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                                                                                                    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                                                                                                    '&:hover': {
                                                                                                              bgcolor: isActive
                                                                                                                        ? theme.palette.primary.main
                                                                                                                        : alpha(theme.palette.primary.main, 0.08),
                                                                                                              color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                                                                                    },
                                                                                                    transition: 'all 0.2s ease-in-out',
                                                                                          }}
                                                                                >
                                                                                          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                                                                                    {item.icon}
                                                                                          </ListItemIcon>
                                                                                          <ListItemText
                                                                                                    primary={t(item.labelKey)}
                                                                                                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem' }}
                                                                                          />
                                                                                </ListItemButton>
                                                                      </ListItem>
                                                            );
                                                  })}
                                        </List>
                              </Box>

                              <Box sx={{ p: 3 }}>


                                        <ListItemButton
                                                  onClick={logout}
                                                  sx={{
                                                            borderRadius: '50px',
                                                            px: 2.5,
                                                            py: 1.2,
                                                            color: theme.palette.text.secondary,
                                                            '&:hover': {
                                                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                      color: theme.palette.error.main,
                                                            },
                                                  }}
                                        >
                                                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                                            <Logout />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                            primary={t('common.logout')}
                                                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                                                  />
                                        </ListItemButton>
                              </Box>
                    </Drawer>
          );
}

export { DRAWER_WIDTH };
