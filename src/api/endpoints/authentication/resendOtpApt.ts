import { apiClient } from '../../api';
import type { ResendOtpPayload, ResendOtpResponse } from '../../types/auth.types';

// Dùng chung: Register (owner), Invite flow (issuer/verifier), Login (2FA)
export const resendOtpApi = async (payload: ResendOtpPayload): Promise<ResendOtpResponse> => {
  const response = await apiClient.post<ResendOtpResponse>('/api/v1/auth/resend-otp', payload);
  return response.data;
};