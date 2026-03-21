import React, { useRef } from 'react';
import { Box, Typography, Button, Stack, useTheme, useMediaQuery, Container, Card, alpha, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../../store/uiStore';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { locale } = useUIStore();

    const scrollRef = useRef<HTMLDivElement>(null);

    const isAr = locale === 'ar';

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            // Scroll by exactly one item width + gap, or full container width
            const scrollAmount = current.clientWidth;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <Box sx={{ pb: 10 }}>
            {/* Hero Section */}
            <Box sx={{ minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', pt: { xs: 8, md: 0 }, pb: { xs: 8, md: 0 } }}>
                <Container maxWidth="xl">
                    <Stack
                        direction={isMobile ? 'column' : 'row'}
                        spacing={isMobile ? 8 : 4}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        {/* Text Content */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: isAr ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            sx={{ flex: 1, textAlign: isMobile ? 'center' : 'start' }}
                        >
                            <Typography
                                variant="h2"
                                component="h1"
                                fontWeight={800}
                                color="text.primary"
                                sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem', lg: '3.8rem' }, lineHeight: 1.2 }}
                            >
                                {isAr ? 'اكتشف مستقبلك مع مسافة' : 'Investing in Knowledge and Your Future'}
                            </Typography>

                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mb: 4, fontWeight: "bold", fontSize: { xs: '1rem', md: '1.2rem', lg: '1.2rem' }, lineHeight: 1.6, maxWidth: 550, mx: isMobile ? 'auto' : 0, whiteSpace: 'pre-line' }}
                            >
                                {isAr
                                    ? 'منصة التعليم التي تفتح لك أبواب المعرفة، تبني مهاراتك، وتوصلك لأعلى المستويات. تعلّم اليوم، وابدأ رحلة النجاح غدًا!'
                                    : "Learn with us anytime and anywhere. Let's hone your skills and be professional, with certified mentors and competitive prices."}
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={isAr ? <ArrowBackIcon /> : <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                size="large"
                                onClick={() => navigate('/courses')}
                                sx={{
                                    px: 6,
                                    py: 1.5,
                                    fontSize: '1.2rem',
                                    fontWeight: "bold",
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        boxShadow: theme.shadows[6],
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t('common.getStarted', { defaultValue: isAr ? 'ابدأ الآن' : 'Get Started' })}
                            </Button>
                        </Box>

                        {/* Right Hero Image */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            sx={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
                        >
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
                </Container>
            </Box>

            {/* About/Mission Section (Redesigned) */}
            <Box sx={{ py: 12, position: 'relative' }}>
                <Container maxWidth="xl">
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        sx={{
                            position: 'relative',
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.primary.main, 0.03),
                            borderRadius: '32px',
                            p: { xs: 4, md: 8, lg: 10 },
                            textAlign: 'center',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                    >



                        <Typography variant="h4" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 2, display: 'block' }}>
                            {isAr ? 'مهمتنا' : 'OUR MISSION'}
                        </Typography>

                        <Typography variant="h3" fontWeight={800} sx={{ mb: 4, lineHeight: 1.3 }}>
                            {isAr ? 'سد الفجوة بين التعلم الأكاديمي والخبرة المهنية' : 'Bridging the Gap Between Academic Learning and Professional Expertise'}
                        </Typography>

                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.8, maxWidth: isMobile ? 700 : '100%', mx: isMobile ? 'auto' : 0 }}>
                            {isAr
                                ? 'نعتقد أن التعليم النظري يجب أن يترافق مع التطبيق العملي. توفر منصتنا رحلة متكاملة للطلاب والمهنيين لاكتساب المهارات الواقعية المطلوبة في سوق العمل من خلال ورش العمل التفاعلية والدورات الشاملة.'
                                : 'We believe that theoretical education must be paired with practical application. Our platform provides a seamless journey for students and professionals to acquire the real-world skills demanded by the job market through interactive workshops and comprehensive courses.'}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Academic Experts Carousel (New Phase 3) */}
            <Box sx={{ py: 10, overflow: 'hidden' }}>
                <Container maxWidth="xl" sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
                        <Box>
                            <Typography variant="h4" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 1, display: 'block' }}>
                                {isAr ? 'خبراؤنا الأكاديميون' : 'OUR ACADEMIC EXPERTS'}
                            </Typography>
                            <Typography variant="h3" fontWeight={800}>
                                {isAr ? 'تعلم من نخبة الأساتذة والمدربين' : 'Learn from Top Professors and Trainers'}
                            </Typography>
                        </Box>

                        {/* Navigation Arrows for Desktop */}
                        {!isMobile && (
                            <Stack direction={isAr ? 'row-reverse' : 'row'} spacing={2}>
                                <IconButton
                                    onClick={() => handleScroll(isAr ? 'right' : 'left')}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
                                    }}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleScroll(isAr ? 'left' : 'right')}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
                                    }}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        )}
                    </Box>

                    {/* Horizontal Scrolling Container */}
                    <Box
                        ref={scrollRef}
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            gap: 3,
                            pb: 4,
                            px: 1,
                            mx: -1, // Compensate for padding to avoid clipping shadows 
                            scrollSnapType: 'x mandatory',
                            '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for clean look with arrows
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {[
                            { name: isAr ? 'د. ليلى حسن' : 'Dr. Ahmed Hassan', title: isAr ? 'أستاذ هندسة البرمجيات' : 'Professor of Software Engineering', specialty: 'Computer Science', img: '/t1.png' },
                            { name: isAr ? 'م. سارة علي' : 'Eng. Sarah Ali', title: isAr ? 'مستشار أمن سيبراني' : 'Cybersecurity Consultant', specialty: 'Security', img: '/t2.png' },
                            { name: isAr ? 'أ.د. محمد كريم' : 'Prof. Mohammed Karim', title: isAr ? 'خبير الذكاء الاصطناعي' : 'AI & Machine Learning Expert', specialty: 'Data Science', img: '/e4.png' },
                            { name: isAr ? 'د. طارق عمر' : 'Dr. Layla Omar', title: isAr ? 'أستاذة إدارة الأعمال' : 'Professor of Business Management', specialty: 'Management', img: '/e4.png' },
                            { name: isAr ? 'م. سارة فاروق' : 'Eng. Tariq Farooq', title: isAr ? 'كبير مهندسي السحابة' : 'Senior Cloud Architect', specialty: 'Cloud Computing', img: '/t2.png' },
                            { name: isAr ? 'أ. ياسمين خالد' : 'Inst. Yasmin Khalid', title: isAr ? 'مدربة تطوير الواجهات' : 'Frontend Development Trainer', specialty: 'Web Dev', img: '/t1.png' },
                        ].map((expert, index) => (
                            <Card key={index} sx={{
                                // Exactly 3 items visible on desktop (calc 100% minus 2 gaps of 24px each divided by 3)
                                width: { xs: '85vw', sm: 'calc((100% - 24px) / 2)', md: 'calc((100% - 48px) / 3)' },
                                minWidth: { xs: '85vw', sm: 'calc((100% - 24px) / 2)', md: 'calc((100% - 48px) / 3)' },
                                aspectRatio: '3/4', // Tall portrait aspect ratio
                                borderRadius: '24px',
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                backgroundImage: `url(${expert.img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                // '&:hover': {
                                //     transform: 'translateY(-12px)',
                                //     boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.3)}`,
                                //     '& .overlay': {
                                //         background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)`,
                                //     }
                                // }
                            }}>
                                {/* Fallback for missing images (mock pattern) */}
                                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                    <Typography variant="h1" fontWeight={900}>{expert.name.charAt(0)}</Typography>
                                </Box>

                                {/* Dark Gradient Overlay */}
                                {/* <Box className="overlay" sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 1,
                                    background: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%, transparent 100%)`,
                                    transition: 'background 0.3s ease',
                                }} /> */}

                                {/* Content Container (Bottom Aligned) */}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 4,
                                    zIndex: 2,
                                    color: '#fff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {expert.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        {expert.title}
                                    </Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Target Audience Section (Redesigned) */}
            <Box sx={{ py: 12 }}>
                <Box>
                    <Typography
                        component={motion.h3}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        variant="h3" fontWeight={800} textAlign="center" sx={{ mb: 2 }}
                    >
                        {isAr ? 'من نخدم؟' : 'Who We Serve'}
                    </Typography>
                    <Typography
                        component={motion.p}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        variant="h6" color="text.secondary" textAlign="center" fontWeight="normal" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
                    >
                        {isAr ? 'تم تصميم منصتنا لتلبية الاحتياجات المتنوعة للمتعلمين والخبراء على حد سواء.' : 'Our platform is designed to meet the diverse needs of learners and experts alike.'}
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', md: isAr ? 'row-reverse' : 'row' }}
                        spacing={4}
                        sx={{ alignItems: 'stretch', width: '100%' }}
                    >
                        {[
                            {
                                icon: <SchoolIcon sx={{ fontSize: 60, color: '#fff', mb: 2 }} />,
                                title: isAr ? 'طلاب الجامعات' : 'Undergraduates',
                                desc: isAr ? 'تأسيس قوي ومهارات عملية لتسهيل الانتقال من الحياة الأكاديمية إلى سوق العمل بفضل ورش العمل التطبيقية والموجهة.' : 'Build a strong foundation and practical skills to ease the transition from academic life to the professional world.',
                                bgColor: theme.palette.primary.main,
                                shadowColor: theme.palette.primary.main
                            },
                            {
                                icon: <WorkspacePremiumIcon sx={{ fontSize: 60, color: '#fff', mb: 2 }} />,
                                title: isAr ? 'طلاب الدراسات العليا' : 'Postgraduates',
                                desc: isAr ? 'دورات متقدمة وورش عمل متخصصة لتعزيز الخبرات ومواكبة أحدث التطورات العلمية والعملية في مجالاتهم.' : 'Advanced courses and specialized workshops to enhance expertise and stay updated with the latest industry trends.',
                                bgColor: theme.palette.secondary.main,
                                shadowColor: theme.palette.secondary.main
                            },
                            {
                                icon: <BusinessCenterIcon sx={{ fontSize: 60, color: '#fff', mb: 2 }} />,
                                title: isAr ? 'المدربون المحترفون' : 'Professional Trainers',
                                desc: isAr ? 'منصة مخصصة لمشاركة الخبرات، إدارة الورش والدورات بسلاسة، والوصول إلى جمهور واسع من المتعلمين الشغوفين.' : 'A dedicated platform to share expertise, manage workshops seamlessly, and reach a wide audience of eager learners.',
                                bgColor: theme.palette.success.main,
                                shadowColor: theme.palette.success.main
                            }
                        ].map((audience, index) => (
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                                key={index}
                                sx={{ flex: 1, display: 'flex' }}
                            >
                                <Card sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '32px',
                                    p: 4,
                                    border: 'none',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: audience.bgColor,
                                    color: '#fff',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    '&:hover': {
                                        transform: 'translateY(-12px)',
                                        boxShadow: `0 24px 48px ${alpha(audience.shadowColor, 0.4)}`,
                                    }
                                }}>
                                    {/* Abstract background shape for depth */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: -50,
                                        right: -50,
                                        width: 200,
                                        height: 200,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        zIndex: 0
                                    }} />

                                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                                        {audience.icon}
                                        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>{audience.title}</Typography>
                                        <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.9 }}>{audience.desc}</Typography>
                                    </Box>
                                </Card>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>


        </Box>
    );
};

export default HomePage;
