import { apiClient } from '../../api';
import type { AdminAccountResponse } from '../../types/admin.types';

export const getAdminResetRequests = {
  getAdminRequests: async (): Promise<AdminAccountResponse[]> => {
    try {
      const response = await apiClient.get<AdminAccountResponse[]>('/api/v1/admin/accounts/requests');
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer');
    }
  }
};