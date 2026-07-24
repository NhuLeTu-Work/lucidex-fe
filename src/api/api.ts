import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 1. REQUEST INTERCEPTOR
// Chức năng: Tự động đính kèm Access Token vào mọi request gửi đi
// ==========================================
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

// ==========================================
// 2. RESPONSE INTERCEPTOR
// Chức năng: Đón lõng lỗi 401, bỏ qua các luồng Đăng nhập/OTP, 
// và xử lý logic Refresh Token nếu cần
// ==========================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu có lỗi trả về là 401 và request này chưa từng được retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {

      // BỎ QUA NẾU ĐÂY LÀ API ĐĂNG NHẬP / XÁC THỰC OTP
      // (Bảo toàn nguyên vẹn lỗi 401 để component bên ngoài như LoginForm, OTPForm tự xử lý)
      if (
        originalRequest.url.includes('/login') || 
        originalRequest.url.includes('/totp') || 
        originalRequest.url.includes('/2fa')
      ) {
        return Promise.reject(error); 
      }
      
      // Đánh dấu là đã thử retry để tránh vòng lặp vô hạn
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Nếu không có refresh token, trả về lỗi 401 gốc
      if (!refreshToken) {
        return Promise.reject(error); 
      }
      
      // TODO: Đặt logic gọi API lấy Access Token mới (dùng refresh token) ở đây
      // try {
      //   const res = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken });
      //   localStorage.setItem('access_token', res.data.access_token);
      //   originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
      //   return apiClient(originalRequest); // Gọi lại request ban đầu với token mới
      // } catch (refreshError) {
      //   // Xử lý khi refresh token cũng hết hạn (ví dụ: logout user)
      //   return Promise.reject(refreshError);
      // }
    }
    
    // Trả về bất kỳ lỗi nào khác (400, 403, 404, 500, lỗi mạng...)
    return Promise.reject(error);
  }
);