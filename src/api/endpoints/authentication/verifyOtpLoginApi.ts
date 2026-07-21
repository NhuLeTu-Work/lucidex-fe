// src/api/endpoints/auth/verifyOtpApi.ts
import { apiClient } from '../../api';
import type { VerifyAuthOtpPayload, VerifyAuthOtpResponse } from '../../types/auth.types';

export const verifyOtpLoginApi = async (payload: VerifyAuthOtpPayload): Promise<VerifyAuthOtpResponse> => {
  const response = await apiClient.post<VerifyAuthOtpResponse>('/api/v1/auth/login/verify-otp', payload);
  return response.data;
};