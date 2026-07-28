import { apiClient } from '../../api';
import type { UpdateAdminStatusPayload } from '@/api/types/super.types';

export const updateAdminStatusApi = async (id: string, payload: UpdateAdminStatusPayload) => {
  const response = await apiClient.put(`/api/v1/admin/accounts/${id}`, payload);
  return response.data;
};