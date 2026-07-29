// interceptorSetup.ts — file riêng, import 1 lần duy nhất ở entry point (main.tsx / App.tsx, TRƯỚC khi render)
import { apiClient } from '@/api/api';
import { refreshTokenApi } from '@/api/endpoints/authentication/refreshTokenApi';
import { getIsLoggedOutGlobally } from '@/app/authFlag';
import axios from 'axios';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let logoutHandler: (() => void) | null = null;
let toastHandler: ((type: 'success' | 'error' | 'warning', msg: string) => void) | null = null;

export function registerAuthHandlers(
  logout: () => void,
  showToast: (type: 'success' | 'error' | 'warning', msg: string) => void
) {
  logoutHandler = logout;
  toastHandler = showToast;
}

apiClient.interceptors.request.use((config) => {
  if (getIsLoggedOutGlobally()) {
    return Promise.reject(new axios.Cancel('Logged out'));
  }
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error_code;

    if (status === 401 && errorCode === 'INVALID_ADMIN_ACCESS_TOKEN') {
      toastHandler?.('error', 'errorAdminSession');
      logoutHandler?.();
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }
    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      const response = await refreshTokenApi({ refresh_token: refreshToken });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      isRefreshing = false;
      refreshSubscribers.forEach(cb => cb(newAccessToken));
      refreshSubscribers = [];
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError: any) {
      isRefreshing = false;
      refreshSubscribers = [];
      const hadSession = !!localStorage.getItem('refresh_token');
      if (hadSession) {
        const rStatus = refreshError.response?.status;
        const rCode = refreshError.response?.data?.error_code;
        if (rStatus === 401 && (rCode === 'INVALID_REFRESH_TOKEN' || rCode === 'EXPIRED_REFRESH_TOKEN')) {
          toastHandler?.('error', 'errorSessionExpired');
          logoutHandler?.();
        } else if (rStatus === 401 && rCode === 'INVALID_ADMIN_ACCESS_TOKEN') {
          toastHandler?.('error', 'errorAdminSession');
          logoutHandler?.();
        } else if (rStatus === 422) {
          toastHandler?.('error', 'errorValidationRefreshToken');
          logoutHandler?.();
        } else {
          toastHandler?.('error', 'errorSessionExpired');
        }
      }
      return Promise.reject(refreshError);
    }
  }
);