import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';
type Locale = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface UIState {
    themeMode: ThemeMode;
    locale: Locale;
    direction: Direction;
    sidebarOpen: boolean;

    toggleTheme: () => void;
    setLocale: (locale: Locale) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    themeMode: (localStorage.getItem('themeMode') as ThemeMode) || 'light',
    locale: (localStorage.getItem('locale') as Locale) || 'ar',
    direction: (localStorage.getItem('locale') || 'ar') === 'ar' ? 'rtl' : 'ltr',
    sidebarOpen: true,

    toggleTheme: () =>
        set((state) => {
            const next = state.themeMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', next);
            return { themeMode: next };
        }),

    setLocale: (locale) => {
        localStorage.setItem('locale', locale);
        const direction = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = direction;
        document.documentElement.lang = locale;
        set({ locale, direction });
    },

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
