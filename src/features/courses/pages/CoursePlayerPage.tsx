import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
          Box, Typography, CircularProgress, List, ListItemButton,
          ListItemText, Chip, Stack, Button,
          LinearProgress, alpha, Container, Grid, Card, CardContent,
          Tabs, Tab, Avatar, Accordion, AccordionSummary, AccordionDetails,
          Divider, ListItem,
} from '@mui/material';

import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import DescriptionIcon from '@mui/icons-material/Description';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthStore } from '../../../store/authStore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// @ts-ignore
import Plyr from 'plyr';
import 'plyr-react/plyr.css';
import { useCourseContent, useCourseById } from '../hooks/useCourses';
import { useCourseProgress, useMarkLessonComplete, useUpdateLessonPosition } from '../hooks/useCourses';
import { CourseSection, CourseLesson } from '../../../types';
import { useTheme as useMuiTheme } from '@mui/material';
import { useUIStore } from '../../../store/uiStore';

// ─── TabPanel ───
interface TabPanelProps {
          children?: React.ReactNode;
          index: number;
          value: number;
}
function CustomTabPanel(props: TabPanelProps) {
          const { children, value, index, ...other } = props;
          return (
                    <div role="tabpanel" hidden={value !== index} {...other}>
                              {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
                    </div>
          );
}

// ─── Stable Video Player Component ───
interface StableVideoPlayerProps {
          src: string;
          lessonId: string;
          savedPosition?: number;
          onEnded?: () => void;
          onPause?: (currentTime: number) => void;
          primaryColor?: string;
}

const StableVideoPlayer: React.FC<StableVideoPlayerProps> = ({
          src, lessonId, savedPosition, onEnded, onPause, primaryColor,
}) => {
          const containerRef = useRef<HTMLDivElement>(null);
          const plyrInstanceRef = useRef<Plyr | null>(null);
          const callbacksRef = useRef({ onEnded, onPause });
          callbacksRef.current = { onEnded, onPause };

          useEffect(() => {
                    const container = containerRef.current;
                    if (!container) return;

                    container.innerHTML = '';
                    const video = document.createElement('video');
                    video.setAttribute('playsinline', '');
                    video.setAttribute('controls', '');
                    const source = document.createElement('source');
                    source.src = src;
                    source.type = 'video/mp4';
                    video.appendChild(source);
                    container.appendChild(video);

                    const player = new Plyr(video, {
                              autoplay: true,
                              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
                    });
                    plyrInstanceRef.current = player;

                    if (savedPosition && savedPosition > 5) {
                              player.on('loadeddata', () => { player.currentTime = savedPosition; });
                    }

                    player.on('ended', () => { callbacksRef.current.onEnded?.(); });
                    player.on('pause', () => {
                              const time = Math.floor(player.currentTime || 0);
                              callbacksRef.current.onPause?.(time);
                    });

                    return () => {
                              try { player.destroy(); } catch (_) { }
                              if (container) container.innerHTML = '';
                    };
                    // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [lessonId, src]);

          return (
                    <div
                              ref={containerRef}
                              style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        // @ts-ignore
                                        '--plyr-color-main': primaryColor || '#1976d2',
                              }}
                    />
          );
};

// ─── Lesson Icons ───
const lessonIcons: Record<string, React.ReactNode> = {
          video: <PlayCircleOutlineIcon color="primary" />,
          document: <DescriptionIcon color="info" />,
          pdf: <PictureAsPdfIcon color="error" />,
          text: <ArticleIcon color="action" />,
};

const levelLabels: Record<string, string> = {
          beginner: 'مبتدئ / Beginner',
          intermediate: 'متوسط / Intermediate',
          advanced: 'متقدم / Advanced',
};

// ─── Main Page Component ───
const CoursePlayerPage: React.FC = () => {
          const { id } = useParams<{ id: string }>();
          const courseId = id!;
          const navigate = useNavigate();
          const theme = useMuiTheme();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const isRTL = locale === 'ar';

          const { data: course, isLoading: isCourseLoading, isError } = useCourseContent(courseId);
          const { data: courseDetail } = useCourseById(courseId); // For trainer info, descriptions
          const { data: progressData } = useCourseProgress(courseId);
          const markComplete = useMarkLessonComplete();
          const updatePosition = useUpdateLessonPosition();

          const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
          const [activeTab, setActiveTab] = useState(0);
          const [isTransitioning, setIsTransitioning] = useState(false);
          const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
          const pendingCompletionsRef = useRef<Set<string>>(new Set());

          // Build a flat lesson list for navigation
          const allLessons = useMemo(() => {
                    if (!course?.sections) return [];
                    const flat: CourseLesson[] = [];
                    course.sections.forEach((s: CourseSection) => {
                              s.lessons?.forEach((l: CourseLesson) => flat.push(l));
                    });
                    return flat;
          }, [course]);

          // Build a set of completed lesson IDs
          const completedLessonIds = useMemo(() => {
                    const set = new Set<string>();
                    progressData?.lessons?.forEach((lp: any) => {
                              if (lp.is_completed) set.add(lp.lesson_id);
                    });
                    return set;
          }, [progressData]);

          // Map lesson_id → last_position_seconds for resume
          const lessonPositions = useMemo(() => {
                    const map = new Map<string, number>();
                    progressData?.lessons?.forEach((lp: any) => {
                              if (lp.last_position_seconds > 0) map.set(lp.lesson_id, lp.last_position_seconds);
                    });
                    return map;
          }, [progressData]);

          // Refs for latest values
          const activeLessonRef = useRef(activeLesson);
          activeLessonRef.current = activeLesson;
          const allLessonsRef = useRef(allLessons);
          allLessonsRef.current = allLessons;
          const completedRef = useRef(completedLessonIds);
          completedRef.current = completedLessonIds;

          // Select first lesson by default
          useEffect(() => {
                    if (course?.sections && course.sections.length > 0 && !activeLesson) {
                              const firstSection = course.sections[0];
                              if (firstSection.lessons && firstSection.lessons.length > 0) {
                                        setActiveLesson(firstSection.lessons[0]);
                              }
                    }
          }, [course, activeLesson]);

          // Navigate to next lesson
          const goToNextLesson = useCallback(() => {
                    const current = activeLessonRef.current;
                    const lessons = allLessonsRef.current;
                    if (!current) return;
                    const currentIdx = lessons.findIndex(l => l.id === current.id);
                    if (currentIdx >= 0 && currentIdx < lessons.length - 1) {
                              setActiveLesson(lessons[currentIdx + 1]);
                    }
          }, []);

          // Mark a lesson as complete
          const autoMarkComplete = useCallback((lessonId: string) => {
                    if (completedRef.current.has(lessonId)) return;
                    if (pendingCompletionsRef.current.has(lessonId)) return;
                    pendingCompletionsRef.current.add(lessonId);
                    markComplete.mutate({ courseId, lessonId }, {
                              onSettled: () => { pendingCompletionsRef.current.delete(lessonId); },
                    });
          }, [courseId, markComplete]);

          // Video ended → mark complete + auto-advance
          const handleVideoEnded = useCallback(() => {
                    const lesson = activeLessonRef.current;
                    if (lesson) autoMarkComplete(lesson.id);
                    setIsTransitioning(true);
                    setTimeout(() => goToNextLesson(), 2000);
          }, [autoMarkComplete, goToNextLesson]);

          // Video paused → save position
          const handleVideoPause = useCallback((currentTime: number) => {
                    const lesson = activeLessonRef.current;
                    if (lesson && currentTime > 5) {
                              updatePosition.mutate({ courseId, lessonId: lesson.id, positionSeconds: currentTime });
                    }
          }, [courseId, updatePosition]);

          // Periodic position save
          useEffect(() => {
                    if (activeLesson?.lesson_type === 'video') {
                              saveTimerRef.current = setInterval(() => { }, 15000);
                    }
                    return () => {
                              if (saveTimerRef.current) { clearInterval(saveTimerRef.current); saveTimerRef.current = null; }
                    };
          }, [activeLesson]);

          // Auto-complete PDF and text lessons
          useEffect(() => {
                    if (!activeLesson) return;
                    if (activeLesson.lesson_type === 'video') return;
                    if (completedLessonIds.has(activeLesson.id)) return;
                    const timer = setTimeout(() => { autoMarkComplete(activeLesson.id); }, 3000);
                    return () => clearTimeout(timer);
          }, [activeLesson, completedLessonIds, autoMarkComplete]);

          // Hide transition loader when lesson changes
          useEffect(() => {
                    setIsTransitioning(false);
          }, [activeLesson]);

          // ─── Helpers ───
          const formatDuration = (seconds: number) => {
                    const m = Math.floor(seconds / 60);
                    const s = seconds % 60;
                    return `${m}:${s.toString().padStart(2, '0')}`;
          };

          const formatHoursMinutes = (totalMinutes: number) => {
                    const h = Math.floor(totalMinutes / 60);
                    const m = totalMinutes % 60;
                    if (h > 0 && m > 0) return `${h}h ${m}m`;
                    if (h > 0) return `${h}h`;
                    return `${m}m`;
          };

          const totalLessons = course?.sections?.reduce(
                    (acc: number, sec: CourseSection) => acc + (sec.lessons?.length || 0), 0
          ) || 0;

          // ─── Loading / Error ───
          if (isCourseLoading) {
                    return (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (isError || !course) {
                    return (
                              <Box sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="h5" color="error">
                                                  {isRTL ? 'يجب التسجيل في الدورة للوصول إلى المحتوى' : 'You must be enrolled to access content'}
                                        </Typography>
                                        <Button onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
                                                  {isRTL ? 'العودة للدورات' : 'Back to Courses'}
                                        </Button>
                              </Box>
                    );
          }

          const detail = courseDetail || course;
          const title = isRTL ? (detail.title_ar || detail.title_en) : (detail.title_en || detail.title_ar);
          const description = isRTL ? (detail.description_ar || detail.description_en) : (detail.description_en || detail.description_ar);
          const progress = progressData || { completed: 0, total: allLessons.length, percentage: 0 };
          const isCurrentLessonCompleted = activeLesson ? completedLessonIds.has(activeLesson.id) : false;


          // ─── Video / PDF / Text Content Renderer ───
          const renderContent = () => {
                    if (!activeLesson) {
                              return (
                                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                  <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.2)' }}>
                                                            <OndemandVideoIcon sx={{ fontSize: 40, color: 'white' }} />
                                                  </Box>
                                        </Box>
                              );
                    }

                    if (activeLesson.lesson_type === 'video' && activeLesson.media_url) {
                              return (
                                        <Box sx={{
                                                  width: '100%', aspectRatio: '16/9', bgcolor: '#000', borderRadius: 2, overflow: 'hidden',
                                                  position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                                  '& .plyr': { height: '100%', width: '100%' }
                                        }}>
                                                  <StableVideoPlayer
                                                            src={activeLesson.media_url}
                                                            lessonId={activeLesson.id}
                                                            savedPosition={lessonPositions.get(activeLesson.id)}
                                                            onEnded={handleVideoEnded}
                                                            onPause={handleVideoPause}
                                                            primaryColor={theme.palette.primary.main}
                                                  />
                                                  {isTransitioning && (
                                                            <Box sx={{
                                                                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                      bgcolor: 'rgba(0,0,0,0.4)', zIndex: 10,
                                                                      backdropFilter: 'blur(2px)'
                                                            }}>
                                                                      <CircularProgress size={80} thickness={4} sx={{ color: theme.palette.primary.main }} />
                                                            </Box>
                                                  )}
                                        </Box>
                              );
                    }

                    if (activeLesson.lesson_type === 'pdf' && activeLesson.media_url) {
                              return (
                                        <Box sx={{ width: '100%', height: 600, borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                                                  <iframe src={activeLesson.media_url} style={{ width: '100%', height: '100%', border: 'none' }} title={activeLesson.title_en} />
                                        </Box>
                              );
                    }

                    return (
                              <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', minHeight: 200 }}>
                                        <Typography variant="h6" gutterBottom>{activeLesson.title_ar}</Typography>
                                        <Typography variant="body1" color="text.secondary">
                                                  {activeLesson.title_en || (isRTL ? 'محتوى نصي' : 'Text content')}
                                        </Typography>
                              </Box>
                    );
          };

          // SidebarInfo helper
          const SidebarInfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {icon}
                                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={700} color="text.primary">{value || '—'}</Typography>
                    </Box>
          );

          return (
                    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
                              <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
                                        {/* ── MAIN CONTENT ── */}
                                        <Grid size={{ xs: 12, md: 8 }}>
                                                  {/* Video Player */}
                                                  {renderContent()}

                                                  {/* Now Playing Label */}
                                                  {activeLesson && (
                                                            <Box sx={{ mt: 1, mb: 1, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                <PlayCircleOutlineIcon sx={{ fontSize: 18 }} />
                                                                                {isRTL ? 'يتم تشغيل:' : 'Now playing:'} <strong>{isRTL ? activeLesson.title_ar : (activeLesson.title_en || activeLesson.title_ar)}</strong>
                                                                      </Typography>
                                                                      <Stack direction="row" spacing={1} alignItems="center">
                                                                                {isCurrentLessonCompleted && (
                                                                                          <Chip icon={<CheckCircleIcon />} label={isRTL ? 'مكتمل' : 'Completed'} color="success" size="small" />
                                                                                )}
                                                                      </Stack>
                                                            </Box>
                                                  )}

                                                  {/* Course Title */}
                                                  <Box sx={{ mb: 3 }}>
                                                            <Typography variant="h4" fontWeight={800} gutterBottom>{title}</Typography>
                                                            {detail.description_en && isRTL && (
                                                                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                                                {detail.title_en}
                                                                      </Typography>
                                                            )}
                                                  </Box>

                                                  {/* Tabs Navigation */}
                                                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                            <Tabs
                                                                      value={activeTab}
                                                                      onChange={(_e, v) => setActiveTab(v)}
                                                                      variant="scrollable"
                                                                      scrollButtons="auto"
                                                                      sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '1.05rem', minWidth: 100 } }}
                                                            >
                                                                      <Tab iconPosition="start" icon={<DescriptionIcon sx={{ mr: 1 }} />} label={isRTL ? 'الوصف' : 'Description'} />
                                                                      <Tab iconPosition="start" icon={<FormatListBulletedIcon sx={{ mr: 1 }} />} label={isRTL ? 'الأقسام' : 'Curriculum'} />
                                                                      <Tab iconPosition="start" icon={<SchoolIcon sx={{ mr: 1 }} />} label={isRTL ? 'المدرّب' : 'Instructor'} />
                                                            </Tabs>
                                                  </Box>

                                                  {/* ── TAB 0: Description ── */}
                                                  <CustomTabPanel value={activeTab} index={0}>
                                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                      {isRTL ? 'عن هذه الدورة' : 'About this course'}
                                                            </Typography>
                                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem' }}>
                                                                      {description || (isRTL ? 'لا يوجد وصف متوفر في الوقت الحالي.' : 'No description available at this time.')}
                                                            </Typography>
                                                  </CustomTabPanel>

                                                  {/* ── TAB 1: Curriculum ── */}
                                                  <CustomTabPanel value={activeTab} index={1}>
                                                            <Box sx={{ mb: 3, display: 'flex', gap: 3, color: 'text.secondary', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                                                                      <Typography variant="body2" fontWeight={600}>
                                                                                {course.sections?.length || 0} {isRTL ? 'أقسام' : 'Sections'}
                                                                      </Typography>
                                                                      <Typography variant="body2" fontWeight={600}>•</Typography>
                                                                      <Typography variant="body2" fontWeight={600}>
                                                                                {totalLessons} {isRTL ? 'درس' : 'Lessons'}
                                                                      </Typography>
                                                                      <Typography variant="body2" fontWeight={600}>•</Typography>
                                                                      <Typography variant="body2" fontWeight={600}>
                                                                                {formatHoursMinutes(detail.total_duration_minutes || 0)} {isRTL ? 'إجمالي المدة' : 'Total duration'}
                                                                      </Typography>
                                                            </Box>

                                                            {course.sections && course.sections.length > 0 ? (
                                                                      course.sections.map((section: CourseSection, idx: number) => {
                                                                                const sectionLessons = section.lessons || [];
                                                                                const sectionCompleted = sectionLessons.filter(l => completedLessonIds.has(l.id)).length;
                                                                                return (
                                                                                          <Accordion
                                                                                                    key={section.id}
                                                                                                    defaultExpanded={idx === 0}
                                                                                                    disableGutters
                                                                                                    elevation={0}
                                                                                                    sx={{ mb: 2, borderRadius: '16px !important', border: `1px solid ${theme.palette.divider}`, '&:before': { display: 'none' }, overflow: 'hidden' }}
                                                                                          >
                                                                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), borderBottom: `1px solid ${theme.palette.divider}`, px: 3, py: 1 }}>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                                                                                                        <Box sx={{ flexGrow: 1 }}>
                                                                                                                                  <Typography fontWeight={700} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                                                                                                                                            {isRTL ? (section.title_ar || section.title_en) : (section.title_en || section.title_ar)}
                                                                                                                                  </Typography>
                                                                                                                                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                                                                                                            {sectionCompleted}/{sectionLessons.length} {isRTL ? 'مكتمل' : 'completed'}
                                                                                                                                  </Typography>
                                                                                                                        </Box>
                                                                                                                        {sectionCompleted === sectionLessons.length && sectionLessons.length > 0 && (
                                                                                                                                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, ml: 1 }} />
                                                                                                                        )}
                                                                                                              </Box>
                                                                                                    </AccordionSummary>
                                                                                                    <AccordionDetails sx={{ p: 0 }}>
                                                                                                              <List disablePadding>
                                                                                                                        {sectionLessons.map((lesson: CourseLesson, lIdx: number) => {
                                                                                                                                  const isCompleted = completedLessonIds.has(lesson.id);
                                                                                                                                  const isActive = activeLesson?.id === lesson.id;
                                                                                                                                  return (
                                                                                                                                            <React.Fragment key={lesson.id}>
                                                                                                                                                      {lIdx > 0 && <Divider component="li" />}
                                                                                                                                                      <ListItem disablePadding>
                                                                                                                                                                <ListItemButton
                                                                                                                                                                          onClick={() => { setActiveLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                                                                                                                          selected={isActive}
                                                                                                                                                                          sx={{ px: 3, py: 2, bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent' }}
                                                                                                                                                                >
                                                                                                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                                                                                                                                                                                    {isCompleted ? (
                                                                                                                                                                                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22 }} />
                                                                                                                                                                                    ) : (
                                                                                                                                                                                              <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
                                                                                                                                                                                    )}
                                                                                                                                                                                    {lesson.duration_seconds > 0 && (
                                                                                                                                                                                              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ minWidth: 40 }}>
                                                                                                                                                                                                        {formatDuration(lesson.duration_seconds)}
                                                                                                                                                                                              </Typography>
                                                                                                                                                                                    )}
                                                                                                                                                                          </Box>
                                                                                                                                                                          <ListItemText
                                                                                                                                                                                    primary={
                                                                                                                                                                                              <Typography variant="body1" fontWeight={isActive ? 700 : 500}
                                                                                                                                                                                                        sx={{ color: isCompleted ? 'text.secondary' : 'text.primary' }}
                                                                                                                                                                                              >
                                                                                                                                                                                                        {isRTL ? (lesson.title_ar || lesson.title_en) : (lesson.title_en || lesson.title_ar)}
                                                                                                                                                                                              </Typography>
                                                                                                                                                                                    }
                                                                                                                                                                          />
                                                                                                                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                                                                                                                                                                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{idx + 1}.{lIdx + 1}</Typography>
                                                                                                                                                                                    <Box sx={{ color: 'primary.main', display: 'flex' }}>{lessonIcons[lesson.lesson_type] || lessonIcons.text}</Box>
                                                                                                                                                                          </Box>
                                                                                                                                                                </ListItemButton>
                                                                                                                                                      </ListItem>
                                                                                                                                            </React.Fragment>
                                                                                                                                  );
                                                                                                                        })}
                                                                                                              </List>
                                                                                                    </AccordionDetails>
                                                                                          </Accordion>
                                                                                );
                                                                      })
                                                            ) : (
                                                                      <Typography color="text.secondary">{isRTL ? 'لم يتم إضافة محتوى بعد' : 'No content added yet'}</Typography>
                                                            )}
                                                  </CustomTabPanel>

                                                  {/* ── TAB 2: Instructor ── */}
                                                  <CustomTabPanel value={activeTab} index={2}>
                                                            {detail.trainer_name ? (() => {
                                                                      const isAr = isRTL;
                                                                      const bio = isAr ? detail.trainer_bio_ar : (detail.trainer_bio_en || detail.trainer_bio_ar);
                                                                      const isUniversityProf = detail.trainer_type === 'university_professor';
                                                                      return (
                                                                                <Stack spacing={3}>
                                                                                          <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                                                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                                                                                                        <Avatar
                                                                                                                                  src={detail.trainer_avatar}
                                                                                                                                  sx={{
                                                                                                                                            width: 96, height: 96, bgcolor: theme.palette.primary.main,
                                                                                                                                            fontSize: '2.5rem', fontWeight: 700,
                                                                                                                                            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                                                                                                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                                                                                                                  }}
                                                                                                                        >
                                                                                                                                  {detail.trainer_name.charAt(0)}
                                                                                                                        </Avatar>
                                                                                                                        <Box sx={{ flex: 1 }}>
                                                                                                                                  <Typography variant="h5" fontWeight={700}>{detail.trainer_name}</Typography>
                                                                                                                                  <Box sx={{
                                                                                                                                            display: 'inline-flex', alignItems: 'center', gap: 0.8, mt: 1, px: 2, py: 0.6,
                                                                                                                                            borderRadius: '12px',
                                                                                                                                            bgcolor: isUniversityProf ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.primary.main, 0.08),
                                                                                                                                            color: isUniversityProf ? theme.palette.secondary.main : theme.palette.primary.main,
                                                                                                                                  }}>
                                                                                                                                            <Typography variant="body2" fontWeight={600}>
                                                                                                                                                      {isUniversityProf
                                                                                                                                                                ? (isAr ? 'أستاذ جامعي' : 'University Professor')
                                                                                                                                                                : (detail.job_title || (isAr ? 'مدرب احترافي' : 'Professional Trainer'))}
                                                                                                                                            </Typography>
                                                                                                                                  </Box>
                                                                                                                        </Box>
                                                                                                              </Box>
                                                                                                    </CardContent>
                                                                                          </Card>
                                                                                          {bio && (
                                                                                                    <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                                                              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                                                                                                        <Typography variant="h6" fontWeight={700} gutterBottom>{isAr ? 'نبذة تعريفية' : 'Biography'}</Typography>
                                                                                                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>{bio}</Typography>
                                                                                                              </CardContent>
                                                                                                    </Card>
                                                                                          )}
                                                                                </Stack>
                                                                      );
                                                            })() : (
                                                                      <Typography color="text.secondary">{isRTL ? 'معلومات المدرب غير متوفرة' : 'Instructor information not available'}</Typography>
                                                            )}
                                                  </CustomTabPanel>
                                        </Grid>

                                        {/* ── SIDE PANEL ── */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                                  <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
                                                            {/* Progress Card */}
                                                            <Card sx={{
                                                                      borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none',
                                                            }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ textAlign: 'center' }}>
                                                                                          {isRTL ? 'تقدمك في الدورة' : 'Your Progress'}
                                                                                </Typography>

                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                                                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                                                                                    <CircularProgress
                                                                                                              variant="determinate"
                                                                                                              value={progress.percentage}
                                                                                                              size={90}
                                                                                                              thickness={5}
                                                                                                              sx={{
                                                                                                                        color: progress.percentage === 100 ? 'success.main' : 'primary.main',
                                                                                                                        '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                                                                                                              }}
                                                                                                    />
                                                                                                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                              <Typography variant="h5" fontWeight={800} color={progress.percentage === 100 ? 'success.main' : 'primary.main'}>
                                                                                                                        {progress.percentage}%
                                                                                                              </Typography>
                                                                                                    </Box>
                                                                                          </Box>
                                                                                </Box>

                                                                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                                                                                          {progress.completed} / {progress.total} {isRTL ? 'درس مكتمل' : 'lessons completed'}
                                                                                </Typography>

                                                                                {progress.percentage === 100 && (
                                                                                          <Typography variant="body2" color="success.main" fontWeight={700} sx={{ textAlign: 'center', mb: 1 }}>
                                                                                                    {isRTL ? '🎉 أكملت الدورة بنجاح!' : '🎉 Course completed!'}
                                                                                          </Typography>
                                                                                )}

                                                                                <LinearProgress
                                                                                          variant="determinate"
                                                                                          value={progress.percentage}
                                                                                          sx={{
                                                                                                    height: 8, borderRadius: 4,
                                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                                    '& .MuiLinearProgress-bar': {
                                                                                                              borderRadius: 4,
                                                                                                              background: progress.percentage === 100
                                                                                                                        ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                                                                                                                        : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                                                                    },
                                                                                          }}
                                                                                />
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Course Details Card */}
                                                            <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                      <CardContent sx={{ p: 3 }}>
                                                                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                                                                                          {isRTL ? 'تفاصيل الدورة' : 'Course Details'}
                                                                                </Typography>
                                                                                <Stack spacing={2}>
                                                                                          {detail.specialization_name_ar && (
                                                                                                    <SidebarInfoRow icon={<SchoolIcon fontSize="small" />} label={isRTL ? 'الفئة' : 'Category'} value={isRTL ? detail.specialization_name_ar : (detail.specialization_name_en || detail.specialization_name_ar)} />
                                                                                          )}
                                                                                          <SidebarInfoRow icon={<WorkspacePremiumIcon fontSize="small" />} label={isRTL ? 'المستوى' : 'Level'} value={levelLabels[detail.level] || detail.level} />
                                                                                          <SidebarInfoRow icon={<FormatListBulletedIcon fontSize="small" />} label={isRTL ? 'عدد الأقسام' : 'Sections'} value={(course.sections?.length || 0).toString()} />
                                                                                          <SidebarInfoRow icon={<PlayLessonRoundedIcon fontSize="small" />} label={isRTL ? 'عدد الدروس' : 'Lessons'} value={totalLessons.toString()} />
                                                                                          <SidebarInfoRow icon={<AccessTimeIcon fontSize="small" />} label={isRTL ? 'المدة الكلية' : 'Total Duration'} value={formatHoursMinutes(detail.total_duration_minutes || 0)} />
                                                                                </Stack>
                                                                      </CardContent>
                                                            </Card>

                                                            {/* Support Card */}
                                                            <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                                                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                                                                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                                                          {isRTL ? 'تحتاج مساعدة؟' : 'Need Help?'}
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                                                          {isRTL
                                                                                                    ? 'تواصل مع فريق الدعم الفني عبر الواتساب لحل أي مشكلة تواجهك.'
                                                                                                    : 'Contact our support team via WhatsApp for any assistance.'}
                                                                                </Typography>
                                                                                <Button
                                                                                          variant="contained"
                                                                                          fullWidth
                                                                                          startIcon={<WhatsAppIcon />}
                                                                                          onClick={() => {
                                                                                                    const supportNumber = '+9647715503646'; // Replace with actual number
                                                                                                    const messageText = isRTL
                                                                                                              ? `مرحباً، أحتاج إلى مساعدة بخصوص الدورة.\n\nاسم الدورة: ${title}\nاسم الحساب: ${user?.full_name || ''}\nالبريد الإلكتروني: ${user?.email || ''}`
                                                                                                              : `Hello, I need assistance with a course.\n\nCourse Name: ${title}\nAccount Name: ${user?.full_name || ''}\nEmail: ${user?.email || ''}`;
                                                                                                    window.open(`https://wa.me/${supportNumber}?text=${encodeURIComponent(messageText)}`, '_blank');
                                                                                          }}
                                                                                          sx={{
                                                                                                    bgcolor: '#25D366',
                                                                                                    color: '#fff',
                                                                                                    borderRadius: '16px',
                                                                                                    py: 1.5,
                                                                                                    fontWeight: 700,
                                                                                                    textTransform: 'none',
                                                                                                    '&:hover': { bgcolor: '#1DA851' }
                                                                                          }}
                                                                                >
                                                                                          {isRTL ? 'تواصل عبر الواتساب' : 'Contact Support'}
                                                                                </Button>
                                                                      </CardContent>
                                                            </Card>
                                                  </Stack>
                                        </Grid>
                              </Grid>
                    </Container>
          );
};

export default CoursePlayerPage;
