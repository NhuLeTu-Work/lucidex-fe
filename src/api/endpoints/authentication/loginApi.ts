// src/api/endpoints/auth/loginApi.ts
import { apiClient } from '../../api'; // Đảm bảo đường dẫn này trỏ đúng file axios config của bạn
import type { AuthLoginPayload, AuthLoginResponse } from '../../types/auth.types';

export const authLoginApi = async (payload: AuthLoginPayload): Promise<AuthLoginResponse> => {
  const response = await apiClient.post<AuthLoginResponse>('/api/v1/auth/login', payload);
  return response.data;
};