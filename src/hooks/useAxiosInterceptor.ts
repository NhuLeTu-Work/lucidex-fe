import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../api/api';
import { refreshTokenApi } from '../api/endpoints/authentication/refreshTokenApi';

// Biến cục bộ giữ hàng đợi (Queue) khi có nhiều API cùng lỗi 401 một lúc
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

export function useAxiosInterceptor(t: (key: string) => string) {
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

        // Nếu không phải 401, hoặc request này đã được retry 1 lần rồi -> báo lỗi luôn
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // Loại trừ vòng lặp vô hạn nếu chính API refresh cũng trả về 401
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
          
        } catch (refreshError) {
          // Kịch bản thất bại: Refresh Token hết hạn hoặc sai
          isRefreshing = false;
          refreshSubscribers = [];
          
          const hadSession = !!localStorage.getItem('refresh_token');
          
          // Xóa rác
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');

          // Chỉ show Toast báo "Phiên hết hạn" NẾU trước đó user đã từng đăng nhập
          if (hadSession) {
            // Sử dụng Key i18n để render ngôn ngữ tương ứng
            toast.error(t('errorSessionExpired') || 'Phiên của bạn đã hết. Vui lòng đăng nhập lại.');
          }

          // Đá về trang login
          navigateRef.current('/login');
          
          return Promise.reject(refreshError);
        }
      }
    );

    // CLEANUP: Gỡ bỏ interceptor khi component unmount
    return () => {
      apiClient.interceptors.request.eject(reqInterceptor);
      apiClient.interceptors.response.eject(resInterceptor);
    };
  }, [t]); 
}