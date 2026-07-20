import axios from 'axios';

// Lấy URL từ biến môi trường (Ví dụ cho Vite)
const baseURL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm Interceptor để tự động nhét Token vào mỗi request (nếu user đã đăng nhập)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);