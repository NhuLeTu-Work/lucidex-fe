// src/api/endpoints/owner/verifyOwnerOtpApi.ts
import { apiClient } from '../../api'; // Trỏ đúng về file config Axios của bạn
import type { VerifyOwnerOtpPayload, VerifyOwnerOtpResponse } from '../../types/owner.types';

export const verifyOwnerOtpApi = async (payload: VerifyOwnerOtpPayload): Promise<VerifyOwnerOtpResponse> => {
  const response = await apiClient.post<VerifyOwnerOtpResponse>('/api/v1/owner/verify-otp', payload);
  return response.data;
};