// Shared course component utilities — used by both CourseDetailPage and CoursePlayerPage
// Eliminates duplication of CustomTabPanel, lessonIcons, formatDuration, levelLabels

import React from 'react';
import { Box, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';

// ==========================================
// CUSTOM TAB PANEL (used in both pages)
// ==========================================

interface TabPanelProps {
          children?: React.ReactNode;
          index: number;
          value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
          const { children, value, index, ...other } = props;
          return (
                    <div
                              role="tabpanel"
                              hidden={value !== index}
                              id={`course-tabpanel-${index}`}
                              aria-labelledby={`course-tab-${index}`}
                              {...other}
                    >
                              {value === index && (
                                        <Box sx={{ py: 3 }}>
                                                  {children}
                                        </Box>
                              )}
                    </div>
          );
}

// ==========================================
// LESSON TYPE ICONS
// ==========================================

export const lessonIcons: Record<string, React.ReactNode> = {
          video: <PlayCircleOutlineIcon color="primary" />,
          pdf: <PictureAsPdfIcon color="error" />,
          text: <ArticleIcon color="action" />,
};

// ==========================================
// FORMAT HELPERS
// ==========================================

/** Format seconds → m:ss */
export function formatDuration(seconds: number): string {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format total minutes → "Xh Ym" */
export function formatHoursMinutes(totalMinutes: number): string {
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          if (h > 0 && m > 0) return `${h}h ${m}m`;
          if (h > 0) return `${h}h`;
          return `${m}m`;
}

// ==========================================
// LEVEL LABELS
// ==========================================

export const levelLabels: Record<string, string> = {
          beginner: 'مبتدئ / Beginner',
          intermediate: 'متوسط / Intermediate',
          advanced: 'متقدم / Advanced',
};

// ==========================================
// SIDEBAR INFO ROW
// ==========================================

export function SidebarInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
          return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {icon}
                                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={700} color="text.primary">{value || '—'}</Typography>
                    </Box>
          );
}
