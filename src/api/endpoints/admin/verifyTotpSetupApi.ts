import { apiClient } from '../../api'
import type { VerifyTotpSetupResponse, VerifyTotpSetupPayload } from '@/api/types/admin.types';

export const verifyTotpSetupApi = async (
  payload: VerifyTotpSetupPayload
): Promise<VerifyTotpSetupResponse> => {
  // Thay thế axiosClient bằng apiClient
  const response = await apiClient.post('/api/v1/admin/auth/totp/setup/verify', payload);
  return response.data;
};

