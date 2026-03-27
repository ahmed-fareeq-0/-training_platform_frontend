import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// ==========================================
// AXIOS INSTANCE
// ==========================================

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ==========================================
// TOKEN HELPERS (no circular dep with store)
// ==========================================

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

// ==========================================
// REQUEST INTERCEPTOR — attach Bearer token
// ==========================================

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR — auto refresh + errors
// ==========================================

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; errors?: Array<{ field: string; message: string }> }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // --- 401: Auto-refresh token ---
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const newAccess = data.data.accessToken;
                const newRefresh = data.data.refreshToken;
                setTokens(newAccess, newRefresh);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                processQueue(null, newAccess);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // --- Other error codes ---
        const message = error.response?.data?.message || error.message;

        if (error.response?.status === 403) {
            toast.error('Access denied / غير مسموح بالوصول', { id: 'err-403' });
        } else if (error.response?.status === 404) {
            // handled by caller
        } else if (error.response?.status === 409) {
            toast.error(message, { id: `err-409-${message}` });
        } else if (error.response?.status === 500) {
            toast.error('Server error. Please try again / خطأ في الخادم', { id: 'err-500' });
        } else if (!error.response) {
            toast.error('Network error. Check your connection / خطأ في الاتصال', { id: 'err-network' });
        }

        return Promise.reject(error);
    }
);

export { api, clearTokens, setTokens, getAccessToken };
export default api;
