import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
          Box, Typography, Container, CircularProgress, List, ListItemButton,
          ListItemIcon, ListItemText, Chip, IconButton, Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import { useCourseContent } from '../hooks/useCourses';
import { CourseSection, CourseLesson } from '../../../types';
import { useTheme as useMuiTheme } from '@mui/material';

const lessonIcons: Record<string, React.ReactNode> = {
          video: <PlayCircleOutlineIcon color="primary" />,
          pdf: <PictureAsPdfIcon color="error" />,
          text: <ArticleIcon color="action" />,
};

const CoursePlayerPage: React.FC = () => {
          const { id } = useParams<{ id: string }>();
          const navigate = useNavigate();
          const theme = useMuiTheme();
          const { data: course, isLoading, isError } = useCourseContent(id!);
          const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

          // Select first lesson by default
          React.useEffect(() => {
                    if (course?.sections && course.sections.length > 0) {
                              const firstSection = course.sections[0];
                              if (firstSection.lessons && firstSection.lessons.length > 0) {
                                        setActiveLesson(firstSection.lessons[0]);
                              }
                    }
          }, [course]);

          if (isLoading) {
                    return (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress />
                              </Box>
                    );
          }

          if (isError || !course) {
                    return (
                              <Container sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="h5" color="error">
                                                  يجب التسجيل في الدورة للوصول إلى المحتوى / You must be enrolled to access content
                                        </Typography>
                                        <IconButton onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                                                  <ArrowBackIcon /> العودة
                                        </IconButton>
                              </Container>
                    );
          }

          const renderContent = () => {
                    if (!activeLesson) {
                              return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#000', color: '#fff', borderRadius: 3 }}>
                                                  <Typography>اختر درساً من القائمة / Select a lesson</Typography>
                                        </Box>
                              );
                    }

                    const videoSource = React.useMemo(() => {
                              return activeLesson?.media_url ? { type: 'video' as const, sources: [{ src: activeLesson.media_url, provider: 'html5' as const }] } : undefined;
                    }, [activeLesson?.media_url]);

                    const videoOptions = React.useMemo(() => {
                              return { autoplay: true, controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'] };
                    }, []);

                    if (activeLesson.lesson_type === 'video' && activeLesson.media_url) {
                              return (
                                        <Box sx={{
                                                  position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#000', borderRadius: 3, overflow: 'hidden',
                                                  '& .plyr': { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', '--plyr-color-main': theme.palette.primary.main }
                                        }}>
                                                  {videoSource && (
                                                            <Plyr
                                                                      key={activeLesson.id}
                                                                      source={videoSource}
                                                                      options={videoOptions}
                                                            />
                                                  )}
                                        </Box>
                              );
                    }

                    if (activeLesson.lesson_type === 'pdf' && activeLesson.media_url) {
                              return (
                                        <Box sx={{ width: '100%', height: 600, borderRadius: 3, overflow: 'hidden' }}>
                                                  <iframe
                                                            src={activeLesson.media_url}
                                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                                            title={activeLesson.title_en}
                                                  />
                                        </Box>
                              );
                    }

                    return (
                              <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" gutterBottom>{activeLesson.title_ar}</Typography>
                                        <Typography variant="body1" color="text.secondary">
                                                  {activeLesson.title_en || 'محتوى نصي / Text content'}
                                        </Typography>
                              </Box>
                    );
          };

          return (
                    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                              {/* Sidebar */}
                              <Box sx={{
                                        width: 340, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
                                        overflowY: 'auto', bgcolor: 'background.paper',
                              }}>
                                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                  <Stack direction="row" alignItems="center" spacing={1}>
                                                            <IconButton size="small" onClick={() => navigate(`/courses/${id}`)}>
                                                                      <ArrowBackIcon />
                                                            </IconButton>
                                                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                                                      {course.title_ar}
                                                            </Typography>
                                                  </Stack>
                                        </Box>

                                        {course.sections?.map((section: CourseSection, sIdx: number) => (
                                                  <Box key={section.id}>
                                                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
                                                                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                                                القسم {sIdx + 1}: {section.title_ar}
                                                                      </Typography>
                                                            </Box>
                                                            <List dense disablePadding>
                                                                      {section.lessons?.map((lesson: CourseLesson, lIdx: number) => (
                                                                                <ListItemButton
                                                                                          key={lesson.id}
                                                                                          selected={activeLesson?.id === lesson.id}
                                                                                          onClick={() => setActiveLesson(lesson)}
                                                                                          sx={{ px: 2 }}
                                                                                >
                                                                                          <ListItemIcon sx={{ minWidth: 32 }}>
                                                                                                    {activeLesson?.id === lesson.id ? (
                                                                                                              <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />
                                                                                                    ) : (
                                                                                                              lessonIcons[lesson.lesson_type]
                                                                                                    )}
                                                                                          </ListItemIcon>
                                                                                          <ListItemText
                                                                                                    primary={
                                                                                                              <Typography variant="body2" noWrap>
                                                                                                                        {lIdx + 1}. {lesson.title_ar}
                                                                                                              </Typography>
                                                                                                    }
                                                                                                    secondary={
                                                                                                              lesson.duration_seconds > 0
                                                                                                                        ? `${Math.floor(lesson.duration_seconds / 60)}:${(lesson.duration_seconds % 60).toString().padStart(2, '0')}`
                                                                                                                        : undefined
                                                                                                    }
                                                                                          />
                                                                                          {lesson.lesson_type === 'video' && (
                                                                                                    <Chip label="فيديو" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                                                                          )}
                                                                                </ListItemButton>
                                                                      ))}
                                                            </List>
                                                  </Box>
                                        ))}
                              </Box>

                              {/* Main Content */}
                              <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                                        {activeLesson && (
                                                  <Box sx={{ mb: 2 }}>
                                                            <Typography variant="h5" fontWeight={700}>
                                                                      {activeLesson.title_ar}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                      {activeLesson.title_en}
                                                            </Typography>
                                                  </Box>
                                        )}
                                        {renderContent()}
                              </Box>
                    </Box>
          );
};

export default CoursePlayerPage;
