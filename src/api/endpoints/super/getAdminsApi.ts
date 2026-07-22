// src/api/endpoints/super/getAdminsApi.ts
import { apiClient } from '../../api';
import type { AdminAccountResponse } from '../../types/super.types';

export const getAdminsApi = async (): Promise<AdminAccountResponse[]> => {
  const response = await apiClient.get<AdminAccountResponse[]>('/api/v1/admin/accounts');
  return response.data;
};