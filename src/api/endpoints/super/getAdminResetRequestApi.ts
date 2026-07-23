import { apiClient } from '../../api';
import type { AdminAccountResponse } from '../../types/admin.types';

const BASE_URL = '/api/v1/admin/accounts';

export const getAdminResetRequests = {
  getAdminRequests: async (): Promise<AdminAccountResponse[]> => {
    try {
      const response = await apiClient.get<AdminAccountResponse[]>(`${BASE_URL}/requests`);
      return response.data;
    } catch (error: any) {
      throw new Error('errorServer');
    }
  }
};