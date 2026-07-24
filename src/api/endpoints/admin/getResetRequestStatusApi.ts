import { apiClient } from '../../api';
import type { AdminResetRequestStatusResponse } from '../../types/admin.types';

export const getAdminRequestStatusApi = async (): Promise<AdminResetRequestStatusResponse> => {
  const response = await apiClient.get<AdminResetRequestStatusResponse>('/api/v1/admin/accounts/request-status');
  return response.data;
};