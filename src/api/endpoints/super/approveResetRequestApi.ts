import { apiClient } from '../../api'; // Đường dẫn trỏ tới file axios của bạn
import type { ResetPasswordResponse, ResetTotpResponse } from '../../types/super.types';

const BASE_URL = '/api/v1/admin/accounts';

export const superAdminRequestsApi = {
  approvePasswordReset: async (id: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(`${BASE_URL}/${id}/reset-password`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer'); 
    }
  },

  approveTotpReset: async (id: string): Promise<ResetTotpResponse> => {
    try {
      const response = await apiClient.post<ResetTotpResponse>(`${BASE_URL}/${id}/reset-2fa`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer'); 
    }
  },
};