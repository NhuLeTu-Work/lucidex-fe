import { apiClient } from '../../api';

export interface ResendOtpPayload {
  email?: string;
  token?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  data: null;
  message: string;
  error_code: string;
}

// Dùng chung cho toàn bộ hệ thống (Login, Register, Owner, Issuer, Verifier)
export const resendOtpApi = async (payload: ResendOtpPayload): Promise<ResendOtpResponse> => {
  const response = await apiClient.post<ResendOtpResponse>('/api/v1/auth/resend-otp', payload);
  return response.data;
};