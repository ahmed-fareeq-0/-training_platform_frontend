import React from 'react';
import { Box, Typography, Button, Stack, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TraineeHomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    // Defaulting to "en" equivalent translation for demonstration unless replaced by specific keys
    const { t } = useTranslation();

    return (
        <Box sx={{ minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', bgcolor: 'background.default', pt: { xs: 8, md: 0 } }}>
            <Box sx={{ width: '100%' }}>
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    spacing={isMobile ? 8 : 4}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    {/* Text Content */}
                    <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'start' }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight={800}
                            color="text.primary"
                            sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem', lg: '3.8rem' }, lineHeight: 1.2 }}
                        >
                            {t('home.heroTitle', { defaultValue: 'Investing in Knowledge and Your Future' })}
                        </Typography>

                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 4, fontWeight: "bold", fontSize: { xs: '1rem', md: '3.5rem', lg: '1.2rem' }, lineHeight: 1.6, maxWidth: 550, mx: isMobile ? 'auto' : 0, whiteSpace: 'pre-line' }}
                        >
                            {t('home.heroSubtitle', { defaultValue: "learn with us anytime and anywhere, let's hone your skills and be professional, with certified mentors and competitive prices" })}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowBackIcon />}
                            size="large"
                            onClick={() => navigate('/courses')}
                            sx={{
                                px: 6,
                                py: 1.5,
                                fontSize: '1.2rem',
                                fontWeight: "bold",
                                borderRadius: '12px',
                                textTransform: 'none',
                                // boxShadow: theme.shadows[4],
                                '&:hover': {
                                    boxShadow: theme.shadows[2],
                                }
                            }}
                        >
                            {t('common.getStarted', { defaultValue: 'Get Started' })}
                        </Button>
                    </Box>

                    {/* Right Hero Image */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end', position: 'relative' }}>
                        <Box
                            component="img"
                            src="/hero.png"
                            alt="Hero Image"
                            sx={{
                                width: '100%',
                                maxWidth: { xs: 400, md: 550 },
                                height: 'auto',
                                zIndex: 1,
                                filter: `drop-shadow(0 20px 40px ${theme.palette.primary.main}30)`,
                            }}
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};

export default TraineeHomePage;
