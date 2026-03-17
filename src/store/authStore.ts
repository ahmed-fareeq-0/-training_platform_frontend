import { create } from 'zustand';
import { User, UserRole } from '../types';
import { clearTokens, setTokens } from '../api/axios';

interface AuthState {
          user: User | null;
          isAuthenticated: boolean;
          isLoading: boolean;

          // Actions
          login: (user: User, accessToken: string, refreshToken: string) => void;
          logout: () => void;
          setUser: (user: User) => void;
          setLoading: (loading: boolean) => void;
          hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
          user: null,
          isAuthenticated: false,
          isLoading: true,

          login: (user, accessToken, refreshToken) => {
                    setTokens(accessToken, refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ user, isAuthenticated: true, isLoading: false });
          },

          logout: () => {
                    import('../app/Providers').then(({ queryClient }) => {
                              queryClient.clear();
                    });
                    clearTokens();
                    set({ user: null, isAuthenticated: false, isLoading: false });
          },

          setUser: (user) => {
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ user });
          },

          setLoading: (isLoading) => set({ isLoading }),

          hydrate: () => {
                    try {
                              const userStr = localStorage.getItem('user');
                              const accessToken = localStorage.getItem('accessToken');
                              if (userStr && accessToken) {
                                        const user = JSON.parse(userStr) as User;
                                        set({ user, isAuthenticated: true, isLoading: false });
                              } else {
                                        set({ isLoading: false });
                              }
                    } catch {
                              clearTokens();
                              set({ user: null, isAuthenticated: false, isLoading: false });
                    }
          },
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectRole = (state: AuthState) => state.user?.role as UserRole | undefined;
export const selectIsAuth = (state: AuthState) => state.isAuthenticated;
