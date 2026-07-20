// src/api/endpoints/owner.ts
import { apiClient } from '../../api';
import type {
  RegisterOwnerPayload, RegisterOwnerResponse,
  VerifyOwnerOtpPayload, VerifyOwnerOtpResponse,
  ResendOwnerOtpPayload, ResendOwnerOtpResponse
} from '../../types/owner.types';

export const registerOwnerApi = async (payload: RegisterOwnerPayload): Promise<RegisterOwnerResponse> => {
  // Post payload trực tiếp, không cần FormData
  const response = await apiClient.post<RegisterOwnerResponse>('/api/v1/owner/register', payload);
  return response.data;
};

export const verifyOwnerOtpApi = async (payload: VerifyOwnerOtpPayload): Promise<VerifyOwnerOtpResponse> => {
  const response = await apiClient.post<VerifyOwnerOtpResponse>('/api/v1/owner/verify-otp', payload);
  return response.data;
};

export const resendOwnerOtpApi = async (payload: ResendOwnerOtpPayload): Promise<ResendOwnerOtpResponse> => {
  const response = await apiClient.post<ResendOwnerOtpResponse>('/api/v1/owner/resend-otp', payload);
  return response.data;
};