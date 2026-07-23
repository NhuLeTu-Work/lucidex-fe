import { apiClient } from '../../api'; // <-- Điều chỉnh lại đường dẫn import này cho đúng với dự án
import type { AdminAccountResponse } from '../../types/admin.types';

const BASE_URL = '/api/v1/admin/accounts';

export const adminAccountApi = {
  requestResetPassword: async (): Promise<AdminAccountResponse> => {
    try {
      const response = await apiClient.post<AdminAccountResponse>(`${BASE_URL}/request-reset-password`);
      return response.data;
    } catch (error: any) {
      // Axios tự động ném lỗi nếu status code không nằm trong khoảng 2xx
      // Trả về dạng key để handle i18n bên Hook
      throw new Error('errorServer'); 
    }
  },

  requestResetTotp: async (): Promise<AdminAccountResponse> => {
    try {
      const response = await apiClient.post<AdminAccountResponse>(`${BASE_URL}/request-reset-totp`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer');
    }
  }
};