import { apiClient } from '../../api';
import type { AdminAccountResponse } from '../../types/admin.types';

export const rejectTotpResetApi = async (id: string): Promise<AdminAccountResponse> => {
  const response = await apiClient.post<AdminAccountResponse>(`/api/v1/admin/accounts/${id}/reject-reset-totp`);
  return response.data;
};

export const rejectPasswordResetApi = async (id: string): Promise<AdminAccountResponse> => {
  const response = await apiClient.post<AdminAccountResponse>(`/api/v1/admin/accounts/${id}/reject-reset-password`);
  return response.data;
};