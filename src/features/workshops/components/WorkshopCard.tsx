import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar, IconButton, useTheme, alpha, Divider } from '@mui/material';
import { FavoriteBorder, Favorite, MoreVert, StarRounded, AccessTimeRounded, MenuBookRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { useToggleBookmark } from '../hooks/useWorkshops';
import { getImageUrl } from '../../../utils/imageUtils';

export interface WorkshopCardProps {
          workshop: any;
          isAdminOrManager?: boolean;
          onMenuClick?: (e: React.MouseEvent, workshopId: string) => void;
}

export default function WorkshopCard({ workshop, isAdminOrManager, onMenuClick }: WorkshopCardProps) {
          const theme = useTheme();
          const navigate = useNavigate();
          const { locale } = useUIStore();
          const { user } = useAuthStore();
          const toggleBookmark = useToggleBookmark();

          const getLocalizedField = (ar?: string, en?: string) => locale === 'ar' ? (ar || en || '') : (en || ar || '');

          const title = getLocalizedField(workshop.title_ar, workshop.title_en);
          const description = getLocalizedField(workshop.description_ar, workshop.description_en);
          const diffDays = dayjs(workshop.end_date).diff(dayjs(workshop.start_date), 'day');
          const durationWeeks = Math.max(1, Math.ceil(diffDays / 7));

          const handleBookmark = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!user) return navigate('/login');
                    toggleBookmark.mutate(workshop.id);
          };

          return (
                    <Card
                              sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: 'background.paper',
                                        '&:hover': {
                                                  transform: 'translateY(-8px)',
                                                  boxShadow: theme.palette.mode === 'dark'
                                                            ? `0 20px 40px ${alpha(theme.palette.common.black, 0.4)}`
                                                            : `0 20px 40px ${alpha(theme.palette.grey[400], 0.3)}`,
                                                  '& .MuiCardMedia-root': {
                                                            transform: 'scale(1.05)',
                                                  },
                                        },
                              }}
                              onClick={() => navigate(`/workshops/${workshop.id}`)}
                    >
                              <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                                        <CardMedia
                                                  component="div"
                                                  sx={{
                                                            height: 220,
                                                            background: workshop.cover_image
                                                                      ? `url(${getImageUrl(workshop.cover_image)}) center/cover`
                                                                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                                                            transition: 'transform 0.4s ease',
                                                  }}
                                        />
                                        {/* Actions overlay */}
                                        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2, display: 'flex', gap: 1 }}>
                                                  {isAdminOrManager && onMenuClick && (
                                                            <IconButton
                                                                      onClick={(e) => onMenuClick(e, workshop.id)}
                                                                      sx={{
                                                                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                                                                backdropFilter: 'blur(4px)',
                                                                                '&:hover': { bgcolor: theme.palette.background.paper },
                                                                      }}
                                                                      size="small"
                                                            >
                                                                      <MoreVert fontSize="small" />
                                                            </IconButton>
                                                  )}
                                        </Box>
                                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                                                  <IconButton
                                                            onClick={handleBookmark}
                                                            sx={{
                                                                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.6) : alpha(theme.palette.common.black, 0.8),
                                                                      backdropFilter: 'blur(4px)',
                                                                      borderRadius: '10px',
                                                                      '&:hover': { transform: 'scale(1.05)' },
                                                                      transition: 'all 0.2s',
                                                            }}
                                                            size="small"
                                                  >
                                                            {workshop.is_bookmarked ? (
                                                                      <Favorite sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                                            ) : (
                                                                      <FavoriteBorder sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                                            )}
                                                  </IconButton>
                                        </Box>
                              </Box>

                              <CardContent sx={{ flex: 1, p: 3, pt: 2, display: 'flex', flexDirection: 'column' }}>
                                        {/* Title */}
                                        <Typography
                                                  variant="h6"
                                                  fontWeight={800}
                                                  gutterBottom
                                                  sx={{
                                                            fontSize: '1.25rem',
                                                            lineHeight: 1.4,
                                                            mb: 1,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                  }}
                                        >
                                                  {title}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  sx={{
                                                            mb: 3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.6,
                                                  }}
                                        >
                                                  {description}
                                        </Typography>

                                        {/* Stats Row */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <StarRounded sx={{ color: '#E53935', fontSize: 24 }} />
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">
                                                                      {Number(workshop.average_rating || 0).toFixed(1)}
                                                            </Typography>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <AccessTimeRounded sx={{ color: '#E53935', fontSize: 24 }} />
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">
                                                                      {durationWeeks} {locale === 'ar' ? 'أسبوع' : 'week'}
                                                            </Typography>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <MenuBookRounded sx={{ color: '#E53935', fontSize: 24 }} />
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">
                                                                      {workshop.session_start_time ? `${workshop.session_start_time.substring(0, 5)} - ${workshop.session_end_time?.substring(0, 5)}` : (workshop.lessons_count || 0) + ' ' + (locale === 'ar' ? 'درس' : 'Lessons')}
                                                            </Typography>
                                                  </Box>
                                        </Box>

                              </CardContent>

                              <Divider sx={{ mx: 3 }} />

                              {/* Footer Area with Trainer Info and Price */}
                              <Box
                                        sx={{
                                                  px: 3,
                                                  py: 2,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                        }}
                              >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                  <Avatar
                                                            src={getImageUrl(workshop.trainer_avatar)}
                                                            alt={workshop.trainer_name}
                                                            sx={{ width: 32, height: 32 }}
                                                  />
                                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                                                      {workshop.trainer_name || (locale === 'ar' ? 'مدرب غير محدد' : 'Unknown Trainer')}
                                                            </Typography>
                                                            {workshop.trainer_experience_years > 0 && (
                                                                      <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                                                                                {workshop.trainer_experience_years}+ {locale === 'ar' ? 'سنوات خبرة' : 'Year Exp'}
                                                                      </Typography>
                                                            )}
                                                  </Box>
                                        </Box>

                                        <Typography variant="h6" fontWeight={800} color="text.primary">
                                                  {workshop.price} IQD
                                        </Typography>
                              </Box>
                    </Card>
          );
}
