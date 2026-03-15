import React from 'react';
import { Box, Typography, Button, SvgIconProps } from '@mui/material';
import { useUIStore } from '../../store/uiStore';

interface EmptyStateProps {
          icon?: React.ReactElement<SvgIconProps>;
          title_ar: string;
          title_en: string;
          description_ar?: string;
          description_en?: string;
          actionButton?: {
                    label_ar: string;
                    label_en: string;
                    onClick: () => void;
          };
}

export default function EmptyState({
          icon,
          title_ar,
          title_en,
          description_ar,
          description_en,
          actionButton,
}: EmptyStateProps) {
          const { locale } = useUIStore();

          return (
                    <Box
                              sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        padding: 6,
                                        backgroundColor: 'background.paper',
                                        borderRadius: 1,
                                        minHeight: 300,
                                        // boxShadow: 1,
                                        mt: 3,
                              }}
                    >
                              {icon && (
                                        <Box
                                                  sx={{
                                                            mb: 2,
                                                            color: 'text.secondary',
                                                            '& svg': {
                                                                      fontSize: 64,
                                                                      opacity: 0.5,
                                                            },
                                                  }}
                                        >
                                                  {icon}
                                        </Box>
                              )}

                              <Typography variant="h5" color="text.primary" gutterBottom fontWeight="bold">
                                        {locale === 'ar' ? title_ar : title_en}
                              </Typography>

                              {(description_ar || description_en) && (
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                                                  {locale === 'ar' ? description_ar : description_en}
                                        </Typography>
                              )}

                              {actionButton && (
                                        <Button variant="contained" color="primary" onClick={actionButton.onClick}>
                                                  {locale === 'ar' ? actionButton.label_ar : actionButton.label_en}
                                        </Button>
                              )}
                    </Box>
          );
}
