// src/api/endpoints/super/createAdminApi.ts
import { apiClient } from '../../api';
import type { CreateAdminResponse } from '../../types/super.types';

export const createAdminApi = async (): Promise<CreateAdminResponse> => {
  // Vì không có tham số (No parameters), ta gọi POST trực tiếp
  const response = await apiClient.post<CreateAdminResponse>('/api/v1/admin/accounts');
  return response.data;
};