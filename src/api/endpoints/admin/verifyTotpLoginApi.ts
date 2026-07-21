import { apiClient } from '../../api';
import type { VerifyAdminTotpLoginPayload, VerifyAdminTotpLoginResponse } from '../../types/admin.types';

export const verifyAdminTotpLoginApi = async (payload: VerifyAdminTotpLoginPayload): Promise<VerifyAdminTotpLoginResponse> => {
  const response = await apiClient.post<VerifyAdminTotpLoginResponse>('/api/v1/admin/auth/totp/login/verify', payload);
  return response.data;
};