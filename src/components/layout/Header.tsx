import {
          AppBar,
          Toolbar,
          IconButton,
          Typography,
          Box,
          Avatar,
          Menu,
          MenuItem,
          Badge,
          Tooltip,
          Divider,
          useTheme,
          useMediaQuery,
          Button,
          alpha,
          useScrollTrigger,
          Popover,
          ListItemIcon,
          ListItemText,
} from '@mui/material';
import {
          Menu as MenuIcon,
          Notifications as NotifIcon,
          Language,
          Logout,
          Person,
          DarkMode,
          LightMode,
          KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import authService from '../../api/services/auth.service';
import toast from 'react-hot-toast';
import { DRAWER_WIDTH, getNavItems } from './Sidebar';
import { getImageUrl } from '../../utils/imageUtils';
import { UserRole } from '../../types';
import { getDashboardPath } from '../guards/RouteGuards';
import { useNotifications, useUnreadCount, useNotificationMutations } from '../../features/notifications/hooks/useNotifications';
import NotificationList from '../../features/notifications/components/NotificationList';
import { DoneAll } from '@mui/icons-material';

export default function Header() {
          const theme = useTheme();
          const isMobile = useMediaQuery(theme.breakpoints.down('md'));
          const navigate = useNavigate();
          const location = useLocation();
          const { t, i18n } = useTranslation();
          const { user, logout: logoutStore } = useAuthStore();
          const { sidebarOpen, toggleSidebar, setLocale, locale, themeMode, toggleTheme } = useUIStore();
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
          const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

          const { data: notifData, isLoading: notifLoading } = useNotifications(1, 30);
          const { data: unread } = useUnreadCount();
          const { markAllRead } = useNotificationMutations();
          const notifications = notifData?.data || [];

          const trigger = useScrollTrigger({
                    disableHysteresis: true,
                    threshold: 0,
          });

          const isHeaderNavRole = !user || [UserRole.TRAINEE, UserRole.TRAINER, UserRole.MANAGER].includes(user.role as UserRole);

          const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

          let navItems: any[] = [];
          if (user) {
                    const allItems = getNavItems(user.role as UserRole);
                    navItems = allItems.filter(item => !['notifications', 'reviews', 'profile', 'statistics'].includes(item.key));

                    // Inject Home Page for Trainee, Trainer, and Manager roles
                    if ([UserRole.TRAINEE, UserRole.TRAINER, UserRole.MANAGER].includes(user.role as UserRole)) {
                              navItems.unshift({ key: 'home', labelKey: 'nav.home', path: '/home' });
                    }
          } else {
                    navItems = [
                              { key: 'home', labelKey: 'nav.home', path: '/' },
                              { key: 'courses', labelKey: 'nav.courses', path: '/courses' },
                              { key: 'workshops', labelKey: 'nav.workshops', path: '/workshops' }
                    ];
          }

          const MAX_VISIBLE_ITEMS = 6;
          const visibleNavItems = navItems.slice(0, MAX_VISIBLE_ITEMS);
          const moreNavItems = navItems.slice(MAX_VISIBLE_ITEMS);

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

          const handleLogout = async () => {
                    try {
                              const refreshToken = localStorage.getItem('refreshToken');
                              if (refreshToken) {
                                        await authService.logout(refreshToken);
                              }
                    } catch {
                              // ignore logout API errors
                    }
                    logoutStore();
                    toast.success(t('auth.logoutSuccess'));
                    navigate('/login');
                    setAnchorEl(null);
          };

          const handleToggleLocale = () => {
                    const next = locale === 'ar' ? 'en' : 'ar';
                    setLocale(next);
                    i18n.changeLanguage(next);
          };

          return (
                    <AppBar
                              position="fixed"
                              elevation={0}
                              sx={{
                                        width: isMobile || !sidebarOpen || isHeaderNavRole ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
                                        ml: isMobile || !sidebarOpen || isHeaderNavRole ? 0 : `${DRAWER_WIDTH}px`,
                                        transition: 'all 0.3s ease',
                                        bgcolor: isHeaderNavRole ? 'background.default' : theme.palette.background.paper,
                                        borderBottom: isHeaderNavRole
                                                  ? (trigger ? `1px solid ${alpha(theme.palette.divider, 0.4)}` : '1px solid transparent')
                                                  : `1px solid ${theme.palette.divider}`,
                                        color: theme.palette.text.primary,
                                        boxShadow: 'none',
                              }}
                    >
                              {/* <Toolbar disableGutters sx={{ px: { xs: 2, sm: 3, md: 6, lg: 10, xl: 14 } }}> */}
                              <Toolbar>
                                        {!isHeaderNavRole && (
                                                  <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 1 }}>
                                                            <MenuIcon />
                                                  </IconButton>
                                        )}

                                        {isHeaderNavRole && isMobile && (
                                                  <>
                                                            <IconButton edge="start" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ mr: 1, color: 'inherit' }}>
                                                                      <MenuIcon />
                                                            </IconButton>
                                                            <Menu
                                                                      anchorEl={mobileMenuAnchor}
                                                                      open={Boolean(mobileMenuAnchor)}
                                                                      onClose={() => setMobileMenuAnchor(null)}
                                                            >
                                                                      {navItems.map(item => (
                                                                                <MenuItem
                                                                                          key={item.path}
                                                                                          onClick={() => { navigate(item.path); setMobileMenuAnchor(null); }}
                                                                                          selected={item.path === activePath}
                                                                                >
                                                                                          {t(item.labelKey)}
                                                                                </MenuItem>
                                                                      ))}
                                                            </Menu>
                                                  </>
                                        )}

                                        {isHeaderNavRole ? (
                                                  <>
                                                            <Box
                                                                      component="img"
                                                                      src="/logo.png"
                                                                      alt={t('common.appName')}
                                                                      sx={{ width: '100%', maxWidth: '200px', display: { xs: 'none', md: 'block' }, cursor: 'pointer' }}
                                                                      onClick={() => navigate(user ? getDashboardPath(user.role as UserRole) : '/')}
                                                            />

                                                            {!isMobile && (
                                                                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                                {visibleNavItems.map(item => {
                                                                                          const isActive = item.path === activePath;
                                                                                          return (
                                                                                                    <Button
                                                                                                              key={item.path}
                                                                                                              onClick={() => navigate(item.path)}
                                                                                                              sx={{
                                                                                                                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                                                                                                        fontWeight: isActive ? "700" : 500,
                                                                                                                        borderRadius: '8px',
                                                                                                                        px: 2,
                                                                                                                        fontSize: '1.2rem',
                                                                                                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                                                                                                        boxShadow: 'none',
                                                                                                                        '&:hover': {
                                                                                                                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                                                                                                  boxShadow: 'none'
                                                                                                                        }
                                                                                                              }}
                                                                                                    >
                                                                                                              {t(item.labelKey)}
                                                                                                    </Button>
                                                                                          )
                                                                                })}
                                                                                {moreNavItems.length > 0 && (
                                                                                          <Box
                                                                                                    onMouseEnter={(e) => setMoreMenuAnchor(e.currentTarget)}
                                                                                                    onMouseLeave={() => setMoreMenuAnchor(null)}
                                                                                                    sx={{ position: 'relative', display: 'inline-block' }}
                                                                                          >
                                                                                                    <Button
                                                                                                              endIcon={<KeyboardArrowDownIcon sx={{ transition: 'transform 0.2s', transform: Boolean(moreMenuAnchor) ? 'rotate(180deg)' : 'none' }} />}
                                                                                                              sx={{
                                                                                                                        color: Boolean(moreMenuAnchor) ? theme.palette.primary.main : theme.palette.text.secondary,
                                                                                                                        fontWeight: Boolean(moreMenuAnchor) ? "700" : 500,
                                                                                                                        borderRadius: '8px',
                                                                                                                        px: 2,
                                                                                                                        fontSize: '1rem',
                                                                                                                        bgcolor: Boolean(moreMenuAnchor) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                                                                                                        boxShadow: 'none',
                                                                                                              }}
                                                                                                    >
                                                                                                              {t('common.more', { defaultValue: 'More' })}
                                                                                                    </Button>
                                                                                                    {Boolean(moreMenuAnchor) && (
                                                                                                              <Paper
                                                                                                                        elevation={4}
                                                                                                                        sx={{
                                                                                                                                  position: 'absolute',
                                                                                                                                  top: '100%',
                                                                                                                                  right: 0,
                                                                                                                                  mt: 1,
                                                                                                                                  minWidth: 160,
                                                                                                                                  borderRadius: 2,
                                                                                                                                  overflow: 'hidden',
                                                                                                                                  zIndex: 10,
                                                                                                                                  py: 1,
                                                                                                                                  border: `1px solid ${theme.palette.divider}`
                                                                                                                        }}
                                                                                                              >
                                                                                                                        {moreNavItems.map(item => (
                                                                                                                                  <MenuItem
                                                                                                                                            key={item.path}
                                                                                                                                            onClick={() => { navigate(item.path); setMoreMenuAnchor(null); }}
                                                                                                                                            selected={item.path === activePath}
                                                                                                                                            sx={{ fontSize: '1rem', px: 2, py: 1 }}
                                                                                                                                  >
                                                                                                                                            {t(item.labelKey)}
                                                                                                                                  </MenuItem>
                                                                                                                        ))}
                                                                                                              </Paper>
                                                                                                    )}
                                                                                          </Box>
                                                                                )}
                                                                      </Box>
                                                            )}
                                                            {isMobile && <Box sx={{ flexGrow: 1 }} />}
                                                  </>
                                        ) : (
                                                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="h6" fontWeight={800} color="text.primary">
                                                                      {t('common.greeting', { defaultValue: 'Hello' })}, {user?.full_name?.split(' ')[0]} 👋
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                      {t('common.welcomeBack', { defaultValue: "Let's see what's happening today." })}
                                                            </Typography>
                                                  </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  {!user && (
                                                            <>
                                                                      <Tooltip title={locale === 'ar' ? 'English' : 'عربي'}>
                                                                                <IconButton onClick={handleToggleLocale}>
                                                                                          <Language fontSize="small" />
                                                                                </IconButton>
                                                                      </Tooltip>
                                                                      <Tooltip title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
                                                                                <IconButton onClick={toggleTheme}>
                                                                                          {themeMode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                                                                                </IconButton>
                                                                      </Tooltip>
                                                                      <Button variant="text" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
                                                                                {locale === 'ar' ? 'دخول' : 'Login'}
                                                                      </Button>
                                                                      <Button variant="contained" onClick={() => navigate('/register')} sx={{ borderRadius: 2, fontWeight: 600 }}>
                                                                                {locale === 'ar' ? 'حساب جديد' : 'Register'}
                                                                      </Button>
                                                            </>
                                                  )}
                                                  {user && (
                                                            <>
                                                                      {/* Notifications */}
                                                                      <Tooltip title={t('nav.notifications')}>
                                                                                <IconButton
                                                                                          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                                                                                          sx={{
                                                                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F4F6F8',
                                                                                                    color: 'text.primary',
                                                                                                    p: 1.2,
                                                                                                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                                                                                          }}
                                                                                >
                                                                                          <Badge badgeContent={unread?.count || 0} color="error">
                                                                                                    <NotifIcon fontSize="small" />
                                                                                          </Badge>
                                                                                </IconButton>
                                                                      </Tooltip>

                                                                      <Popover
                                                                                open={Boolean(notifAnchorEl)}
                                                                                anchorEl={notifAnchorEl}
                                                                                onClose={() => setNotifAnchorEl(null)}
                                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                                                disableScrollLock
                                                                                slotProps={{
                                                                                          paper: {
                                                                                                    sx: { mt: 1.5, width: 300, height: 400, borderRadius: 1, boxShadow: theme.shadows[8] }
                                                                                          }
                                                                                }}
                                                                      >
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                                                          <Typography variant="subtitle1" fontWeight={700}>
                                                                                                    {t('nav.notifications')}
                                                                                          </Typography>
                                                                                          {(unread?.count ?? 0) > 0 && (
                                                                                                    <Button
                                                                                                              size="small"
                                                                                                              startIcon={<DoneAll fontSize="small" />}
                                                                                                              onClick={() => { markAllRead.mutate(); }}
                                                                                                              disabled={markAllRead.isPending}
                                                                                                              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                                                                                                    >
                                                                                                              {locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                                                                                                    </Button>
                                                                                          )}
                                                                                </Box>
                                                                                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                                                                          <NotificationList notifications={notifications} isLoading={notifLoading} />
                                                                                </Box>
                                                                      </Popover>

                                                                      {/* User menu */}
                                                                      <Box sx={{ ml: 1 }}>
                                                                                <IconButton
                                                                                          onClick={(e) => setAnchorEl(e.currentTarget)}
                                                                                          sx={{
                                                                                                    p: 0.5,
                                                                                                    border: `2px solid ${theme.palette.divider}`,
                                                                                          }}
                                                                                >
                                                                                          <Avatar
                                                                                                    src={getImageUrl(user?.profile_image)}
                                                                                                    sx={{
                                                                                                              width: 38, height: 38,
                                                                                                              bgcolor: theme.palette.primary.main,
                                                                                                              color: '#ffffff',
                                                                                                              fontSize: '0.9rem',
                                                                                                              fontWeight: 700,
                                                                                                    }}
                                                                                          >
                                                                                                    {user?.full_name?.charAt(0)?.toUpperCase()}
                                                                                          </Avatar>
                                                                                </IconButton>
                                                                                <Menu
                                                                                          anchorEl={anchorEl}
                                                                                          open={Boolean(anchorEl)}
                                                                                          onClose={() => setAnchorEl(null)}
                                                                                          transformOrigin={{ horizontal: locale === 'ar' ? 'left' : 'right', vertical: 'top' }}
                                                                                          anchorOrigin={{ horizontal: locale === 'ar' ? 'left' : 'right', vertical: 'bottom' }}
                                                                                          disableScrollLock={true}
                                                                                          slotProps={{
                                                                                                    paper: {
                                                                                                              sx: { width: 300, mt: 1, borderRadius: 1, zIndex: 9999 },
                                                                                                    },
                                                                                          }}
                                                                                >
                                                                                          <Box sx={{ px: 2, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                                                                                    <Avatar
                                                                                                              src={getImageUrl(user?.profile_image)}
                                                                                                              sx={{
                                                                                                                        width: 72, height: 72,
                                                                                                                        bgcolor: theme.palette.primary.main,
                                                                                                                        color: '#ffffff',
                                                                                                                        fontSize: '1.75rem',
                                                                                                                        fontWeight: 700,
                                                                                                                        border: `3px solid ${theme.palette.primary.main}`,
                                                                                                                        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                                                                                                              }}
                                                                                                    >
                                                                                                              {user?.full_name?.charAt(0)?.toUpperCase()}
                                                                                                    </Avatar>
                                                                                                    <Box sx={{ textAlign: 'center' }}>
                                                                                                              <Typography variant="h6" fontWeight={800} color="primary.main">
                                                                                                                        {user?.full_name}
                                                                                                              </Typography>
                                                                                                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                                                                        {user?.email}
                                                                                                              </Typography>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                          <Divider sx={{ my: 0.5 }} />
                                                                                          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }} sx={{ borderRadius: 1, mx: 1, py: 1.2 }}>
                                                                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                                                                              <Person sx={{ fontSize: '1.3rem', color: 'text.secondary' }} />
                                                                                                    </ListItemIcon>
                                                                                                    <ListItemText primary={t('nav.profile')} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                                                                          </MenuItem>
                                                                                          <MenuItem onClick={() => { handleToggleLocale(); setAnchorEl(null); }} sx={{ borderRadius: 1, mx: 1, py: 1.2 }}>
                                                                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                                                                              <Language sx={{ fontSize: '1.3rem', color: 'text.secondary' }} />
                                                                                                    </ListItemIcon>
                                                                                                    <ListItemText primary={locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                                                                          </MenuItem>
                                                                                          <MenuItem onClick={() => { toggleTheme(); setAnchorEl(null); }} sx={{ borderRadius: 1, mx: 1, py: 1.2 }}>
                                                                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                                                                              {themeMode === 'light' ? <DarkMode sx={{ fontSize: '1.3rem', color: 'text.secondary' }} /> : <LightMode sx={{ fontSize: '1.3rem', color: 'text.secondary' }} />}
                                                                                                    </ListItemIcon>
                                                                                                    <ListItemText primary={themeMode === 'light' ? (locale === 'ar' ? 'الوضع الداكن' : 'Dark Mode') : (locale === 'ar' ? 'الوضع الفاتح' : 'Light Mode')} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                                                                          </MenuItem>
                                                                                          <Divider sx={{ my: 0.5 }} />
                                                                                          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 1, mx: 1, py: 1.2 }}>
                                                                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                                                                              <Logout sx={{ fontSize: '1.3rem', color: 'error.main' }} />
                                                                                                    </ListItemIcon>
                                                                                                    <ListItemText primary={t('auth.logout')} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                                                                          </MenuItem>
                                                                                </Menu>
                                                                      </Box>
                                                            </>
                                                  )}
                                        </Box>
                              </Toolbar>
                    </AppBar>
          );
}
