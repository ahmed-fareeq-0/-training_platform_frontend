import { createTheme, type Direction } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark', direction: Direction) =>
          createTheme({
                    direction,
                    palette: {
                              mode,
                              primary: {
                                        main: '#0965e5',      // Primary Brand Blue
                                        light: '#2392EB',     // Accent/Highlight Blue
                                        dark: '#025589',      // Deep Brand Blue
                                        contrastText: '#FFFFFF',
                              },
                              secondary: {
                                        main: '#1E293B',      // Slate Dark
                                        light: '#475569',
                                        dark: '#0F172A',
                                        contrastText: '#FFFFFF',
                              },
                              success: {
                                        main: '#10B981',
                                        light: '#34D399',
                                        dark: '#059669',
                              },
                              warning: {
                                        main: '#F59E0B',
                                        light: '#FBBF24',
                                        dark: '#D97706',
                              },
                              error: {
                                        main: '#EF4444',
                                        light: '#F87171',
                                        dark: '#DC2626',
                              },
                              info: {
                                        main: '#3B82F6',
                                        light: '#60A5FA',
                                        dark: '#2563EB',
                              },
                              background: {
                                        // default: mode === 'dark' ? '#0F172A' : '#F4F6F8', // Lighter off-white/gray background
                                        // paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                                        default: mode === 'dark' ? '#121625' : '#F4F6F8', // Lighter off-white/gray background
                                        paper: mode === 'dark' ? '#181c2f' : '#FFFFFF',
                              },
                              text: {
                                        primary: mode === 'dark' ? '#F1F5F9' : '#111827', // Darker text for extreme legibility
                                        secondary: mode === 'dark' ? '#94A3B8' : '#6B7280',
                              },
                              divider: mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.06)',
                    },
                    typography: {
                              fontFamily: '"Baloo Bhaijaan 2", "Cairo", "Plus Jakarta Sans", "Roboto", sans-serif',
                              h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
                              h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
                              h3: { fontWeight: 700, fontSize: '1.5rem' },
                              h4: { fontWeight: 600, fontSize: '1.25rem' },
                              h5: { fontWeight: 600, fontSize: '1.1rem' },
                              h6: { fontWeight: 600, fontSize: '1rem' },
                              button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
                              body1: { fontSize: '1rem', lineHeight: 1.6 },
                              body2: { fontSize: '0.875rem', lineHeight: 1.57 },
                    },
                    shape: { borderRadius: 12 },
                    components: {
                              MuiButton: {
                                        styleOverrides: {
                                                  root: {
                                                            borderRadius: 50, // Pill shaped buttons globally
                                                            padding: '8px 24px',
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                      boxShadow: mode === 'dark' ? '0 8px 24px rgba(28, 117, 188, 0.25)' : '0 8px 24px rgba(28, 117, 188, 0.3)',
                                                                      transform: 'translateY(-1px)',
                                                            },
                                                            transition: 'all 0.2s ease-in-out',
                                                  },
                                        },
                              },
                              MuiCard: {
                                        styleOverrides: {
                                                  root: {
                                                            borderRadius: 16, // Modern rounded cards
                                                            boxShadow: mode === 'dark'
                                                                      ? '0 4px 24px rgba(0,0,0,0.4)'
                                                                      : '0 12px 32px rgba(0,0,0,0.04)', // Softer, deeper diffused shadow
                                                            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.02)',
                                                  },
                                        },
                              },
                              MuiTextField: {
                                        defaultProps: { variant: 'outlined', fullWidth: true, size: 'medium' },
                                        styleOverrides: {
                                                  root: {
                                                            '& .MuiOutlinedInput-root': {
                                                                      borderRadius: 12,
                                                                      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                                                                      transition: 'all 0.2s ease',
                                                                      '& fieldset': {
                                                                                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                                                borderWidth: 1,
                                                                      },
                                                                      '&:hover fieldset': {
                                                                                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                                                                      },
                                                                      '&.Mui-focused': {
                                                                                backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF',
                                                                                boxShadow: mode === 'dark' ? '0 0 0 2px rgba(28, 117, 188, 0.2)' : '0 0 0 4px rgba(28, 117, 188, 0.1)',
                                                                      },
                                                                      '&.Mui-focused fieldset': {
                                                                                borderWidth: 1,
                                                                                borderColor: '#1C75BC', // Primary
                                                                      }
                                                            }
                                                  },
                                        },
                              },
                              MuiInputLabel: {
                                        styleOverrides: {
                                                  root: {
                                                            fontWeight: 500,
                                                            fontSize: '0.95rem',
                                                  },
                                        },
                              },
                              MuiFormHelperText: {
                                        styleOverrides: {
                                                  root: {
                                                            fontWeight: 500,
                                                            marginLeft: 0,
                                                            marginTop: 6,
                                                  },
                                        },
                              },
                              MuiPaper: {
                                        styleOverrides: {
                                                  root: { backgroundImage: 'none' },
                                        },
                              },
                              MuiChip: {
                                        styleOverrides: {
                                                  root: { fontWeight: 600, borderRadius: 8 },
                                        },
                              },
                              MuiDrawer: {
                                        styleOverrides: {
                                                  paper: {
                                                            borderRight: 'none',
                                                            borderLeft: 'none',
                                                  },
                                        },
                              },
                              MuiTableContainer: {
                                        styleOverrides: {
                                                  root: {
                                                            borderRadius: 16,
                                                            boxShadow: mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.03)',
                                                            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
                                                            backgroundColor: mode === 'dark' ? '#181c2f' : '#FFFFFF',
                                                  }
                                        }
                              },
                              MuiToolbar: {
                                        styleOverrides: {
                                                  root: {
                                                            minHeight: '100px !important',
                                                  }
                                        }
                              },
                              MuiTableCell: {
                                        styleOverrides: {
                                                  root: {
                                                            padding: '16px 24px',
                                                            borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
                                                  },
                                                  head: {
                                                            fontWeight: 700,
                                                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                                            color: mode === 'dark' ? '#F1F5F9' : '#4B5563',
                                                  }
                                        }
                              },
                    },
          });
