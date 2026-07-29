import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api';
import { refreshTokenApi } from '../api/endpoints/authentication/refreshTokenApi';

// Biến cục bộ giữ hàng đợi (Queue) khi có nhiều API cùng lỗi 401 một lúc
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
const EXCLUDED_PATHS = ['/refresh', '/login'];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

export function useAxiosInterceptor(
  t: (key: string) => string,
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  logout: () => void
) {
  const navigate = useNavigate();
  // Dùng ref để đảm bảo interceptor luôn lấy được hàm navigate mới nhất mà không bị re-render loop
  const navigateRef = useRef(navigate);
  
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    // 1. REQUEST INTERCEPTOR (Gắn token vào mọi API)
    const reqInterceptor = apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    // 2. RESPONSE INTERCEPTOR (Xử lý 401 & Refresh Token)
    const resInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorCode = error.response?.data?.error_code;

  if (EXCLUDED_PATHS.some(path => originalRequest.url?.includes(path))) {
    return Promise.reject(error);
  }

  // Check này đặt TRƯỚC check _retry — vì lỗi này cần logout dù đã retry hay chưa
  if (status === 401 && errorCode === 'INVALID_ADMIN_ACCESS_TOKEN') {
    showToast('error', 'errorAdminSession');
    logout();
    return Promise.reject(error);
  }

  if (status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  if (originalRequest.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;
        // Nếu đang có 1 luồng refresh khác chạy rồi -> bắt các request khác chờ
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest)); // Retry request gốc
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token available');

          // Gọi API lấy token mới
          const response = await refreshTokenApi({ refresh_token: refreshToken });
          const newAccessToken = response.data.access_token;

          // Lưu token mới
          localStorage.setItem('access_token', newAccessToken);
          
          isRefreshing = false;
          onRefreshed(newAccessToken); // Giải phóng các request đang chờ

          // Chạy lại request gốc vừa bị failed
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
          
        } catch (refreshError: any) {
          // Kịch bản thất bại: Refresh Token hết hạn hoặc sai
          isRefreshing = false;
          refreshSubscribers = [];
          
          const hadSession = !!localStorage.getItem('refresh_token');
          if(hadSession == false) {
            logout()
          } else if (hadSession) {
            const status = refreshError.response?.status;
            const errorCode = refreshError.response?.data?.error_code || refreshError.response?.data.error_code;
            // Xử lý chung các case 401 (INVALID_REFRESH_TOKEN, EXPIRED_REFRESH_TOKEN, hoặc 401 Undocumented)
            if (status === 401 && (errorCode === 'INVALID_REFRESH_TOKEN' || errorCode === 'EXPIRED_REFRESH_TOKEN')) {
              showToast('error', 'errorSessionExpired');
              logout()
            } else if (status === 401 && (errorCode === 'INVALID_ADMIN_ACCESS_TOKEN')) {
              showToast('error', 'errorAdminSession');
              logout()
            } else if (status === 422) {
              showToast('error', 'errorValidationRefreshToken');
              logout()
            } else {
              // Fallback cho mọi trường hợp khác
              showToast('error', 'errorSessionExpired');  
            }
          }
          return Promise.reject(refreshError);
        }
      }
    );

    // CLEANUP: Gỡ bỏ interceptor khi component unmount
    return () => {
      apiClient.interceptors.request.eject(reqInterceptor);
      apiClient.interceptors.response.eject(resInterceptor);
    };
  }, [t, showToast]); 
}