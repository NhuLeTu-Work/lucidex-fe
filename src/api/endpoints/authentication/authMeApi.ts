import { apiClient } from '../../api';
import type { AuthMeResponse } from '../../types/auth.types';

export const getAuthMeApi = async (): Promise<AuthMeResponse> => {
  const response = await apiClient.get<AuthMeResponse>('/api/v1/auth/me');
  return response.data;
};