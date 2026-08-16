import { apiClient } from '../../api';
import type { VerifyCodePayload, VerifyCodeResponse } from '../../types/verifier.types';

export const verifyCodeApi = async (payload: VerifyCodePayload): Promise<VerifyCodeResponse> => {
  const response = await apiClient.post<VerifyCodeResponse>(
    '/api/v1/verifier/verified-links/verify',
    payload
  );
  return response.data;
};
