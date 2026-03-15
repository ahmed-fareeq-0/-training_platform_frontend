import { useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { getTheme } from '../theme';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import '../i18n';

// React Query client
const queryClient = new QueryClient({
          defaultOptions: {
                    queries: {
                              retry: 1,
                              staleTime: 5 * 60 * 1000,
                              refetchOnWindowFocus: false,
                    },
          },
});

// RTL cache
const rtlCache = createCache({
          key: 'muirtl',
          stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
          key: 'muiltr',
          stylisPlugins: [prefixer],
});

export default function Providers({ children }: { children: React.ReactNode }) {
          const { themeMode, direction, locale } = useUIStore();
          const { hydrate } = useAuthStore();

          // Hydrate auth on mount
          useEffect(() => {
                    hydrate();
          }, [hydrate]);

          // Set document direction + lang
          useEffect(() => {
                    document.documentElement.dir = direction;
                    document.documentElement.lang = locale;
          }, [direction, locale]);

          const theme = useMemo(() => getTheme(themeMode, direction), [themeMode, direction]);
          const cache = direction === 'rtl' ? rtlCache : ltrCache;

          return (
                    <CacheProvider value={cache}>
                              <ThemeProvider theme={theme}>
                                        <CssBaseline />
                                        <QueryClientProvider client={queryClient}>
                                                  {children}
                                                  <ReactQueryDevtools initialIsOpen={false} />
                                        </QueryClientProvider>
                                        <Toaster
                                                  position={direction === 'rtl' ? 'top-left' : 'top-right'}
                                                  toastOptions={{
                                                            duration: 4000,
                                                            style: {
                                                                      borderRadius: 12,
                                                                      background: theme.palette.background.paper,
                                                                      color: theme.palette.text.primary,
                                                                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                                      fontFamily: theme.typography.fontFamily,
                                                            },
                                                  }}
                                        />
                              </ThemeProvider>
                    </CacheProvider>
          );
}
