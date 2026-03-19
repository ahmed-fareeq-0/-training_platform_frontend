import React from 'react';
import { Box, Typography, IconButton, Divider, Button, useTheme, alpha, Paper, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useUIStore } from '../../store/uiStore';

export default function Footer() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { locale, setLocale } = useUIStore();
    const [langAnchorEl, setLangAnchorEl] = React.useState<null | HTMLElement>(null);

    const isAr = locale === 'ar';

    const handleToggleLocale = (next: 'en' | 'ar') => {
        setLocale(next);
        i18n.changeLanguage(next);
        setLangAnchorEl(null);
    };

    const footerColumns = [
        {
            title: isAr ? 'الميزات' : 'Feature',
            links: [
                { label: isAr ? 'التعلم المكثف' : 'Intensive Learning', path: '/courses' },
                { label: isAr ? 'التحضير للاختبارات' : 'Test Preparations', path: '/courses' },
                { label: isAr ? 'قائمة المتصدرين' : 'Leaderboard', path: '#' },
                { label: isAr ? 'مركز المجتمع' : 'Community Hub', path: '#' },
            ]
        },
        {
            title: isAr ? 'الشركة' : 'Company',
            links: [
                { label: isAr ? 'معلومات عنا' : 'About Us', path: '#' },
                { label: isAr ? 'برنامج الشركاء' : 'Partner Program', path: '#' },
                { label: isAr ? 'قصتنا' : 'Our Story', path: '#' },
                { label: isAr ? 'دراسات الحالة' : 'Case Studies', path: '#' },
                { label: isAr ? 'دعم العملاء' : 'Customer Support', path: '#' },
            ]
        },
        {
            title: isAr ? 'الموارد' : 'Resources',
            links: [
                { label: isAr ? 'احصل على المساعدة' : 'Get Help', path: '#' },
                { label: isAr ? 'الأسئلة الشائعة' : 'FAQ', path: '#' },
                { label: isAr ? 'المدونة' : 'Blog Posts', path: '#' },
            ]
        },
        {
            title: isAr ? 'روابط مفيدة' : 'Helpful Links',
            links: [
                { label: isAr ? 'المركز القانوني' : 'Legal center', path: '#' },
                { label: isAr ? 'سياسة الخصوصية' : 'Privacy policy', path: '#' },
                { label: isAr ? 'الشروط والأحكام' : 'Terms & Conditions', path: '#' },
            ]
        }
    ];

    return (
        <Box sx={{ mt: 'auto', pt: 8, pb: 4 }}>
            {/* Inner Card representing the large dark area in the design */}
            <Paper 
                elevation={0}
                sx={{
                    borderRadius: '32px',
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    p: { xs: 4, md: 8 },
                    mb: 4
                }}
            >
                {/* Top Row: Logo & Socials */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 6, gap: 4 }}>
                    <Box 
                        sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <Box
                            component="img"
                            src="/logo.png"
                            alt={t('common.appName')}
                            sx={{ height: 40 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {[XIcon, FacebookIcon, InstagramIcon].map((Icon, idx) => (
                            <IconButton 
                                key={idx}
                                sx={{ 
                                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                                    color: 'text.secondary',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s',
                                    borderRadius: '12px'
                                }}
                            >
                                <Icon fontSize="small" />
                            </IconButton>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ mb: 6, borderColor: alpha(theme.palette.text.primary, 0.1) }} />

                {/* Bottom Row: 4 Columns of Links */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 4 }}>
                    {footerColumns.map((col, idx) => (
                        <Box key={idx}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'text.primary' }}>
                                {col.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {col.links.map((link, lIdx) => (
                                    <Typography 
                                        key={lIdx}
                                        component="a"
                                        href={link.path}
                                        onClick={(e) => {
                                            if (link.path.startsWith('/')) {
                                                e.preventDefault();
                                                navigate(link.path);
                                            }
                                        }}
                                        sx={{
                                            color: 'text.secondary',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            transition: 'color 0.2s',
                                            '&:hover': {
                                                color: 'primary.main',
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* Bottom Bar: Copyright & Language Selector */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, md: 4 }, gap: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    &copy; {new Date().getFullYear()} {t('common.appName', { defaultValue: 'Training Platform' })}. {isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved.'}
                </Typography>

                <Box>
                    <Button
                        variant="outlined"
                        onClick={(e) => setLangAnchorEl(e.currentTarget)}
                        startIcon={<LanguageIcon />}
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{
                            color: 'text.primary',
                            borderColor: theme.palette.divider,
                            borderRadius: '12px',
                            px: 2,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }
                        }}
                    >
                        {locale === 'en' ? 'English (US)' : 'عربي (العراق)'}
                    </Button>
                    <Menu
                        anchorEl={langAnchorEl}
                        open={Boolean(langAnchorEl)}
                        onClose={() => setLangAnchorEl(null)}
                        slotProps={{
                            paper: {
                                sx: {
                                    mt: 1,
                                    minWidth: 150,
                                    borderRadius: '12px',
                                    border: `1px solid ${theme.palette.divider}`,
                                    boxShadow: theme.shadows[4]
                                }
                            }
                        }}
                    >
                        <MenuItem onClick={() => handleToggleLocale('en')} selected={locale === 'en'}>
                            English (US)
                        </MenuItem>
                        <MenuItem onClick={() => handleToggleLocale('ar')} selected={locale === 'ar'}>
                            عربي (العراق)
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
        </Box>
    );
}
