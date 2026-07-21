// src/api/endpoints/admin.ts
import { apiClient } from '../../api';
import type { LoginAdminPayload, LoginAdminResponse } from '../../types/admin.types';

export const loginAdminApi = async (payload: LoginAdminPayload): Promise<LoginAdminResponse> => {
  const response = await apiClient.post<LoginAdminResponse>('/api/v1/admin/auth/login', payload);
  return response.data;
};