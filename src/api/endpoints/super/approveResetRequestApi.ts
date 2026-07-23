import { apiClient } from '../../api'; // Đường dẫn trỏ tới file axios của bạn
import type { ResetPasswordResponse, ResetTotpResponse } from '../../types/super.types';

const BASE_URL = '/api/v1/admin/accounts';

export const superAdminRequestsApi = {
  approvePasswordReset: async (id: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(`${BASE_URL}/${id}/reset-password`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer'); // Key cho i18n
    }
  },

  approveTotpReset: async (id: string): Promise<ResetTotpResponse> => {
    try {
      const response = await apiClient.post<ResetTotpResponse>(`${BASE_URL}/${id}/reset-2fa`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer'); // Key cho i18n
    }
  },

  // Mock API từ chối (Bạn cập nhật lại URL thực tế)
  rejectRequest: async (_id: string, _type: 'password' | 'totp'): Promise<void> => {
    try {
      // await apiClient.post(`${BASE_URL}/${id}/reject-reset`, { type });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      throw new Error('errorServer');
    }
  }
};