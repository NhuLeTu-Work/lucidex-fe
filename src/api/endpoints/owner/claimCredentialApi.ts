import { apiClient } from '@/api/api';
import type { ClaimCredentialApiResponse } from '@/api/types/owner.types';

export const claimCredentialApi = async (
  credentialId: string
): Promise<ClaimCredentialApiResponse> => {
  const cleanId = String(credentialId).trim();
  const response = await apiClient.post<ClaimCredentialApiResponse>(
    `/api/v1/owner/claim/credentials/${cleanId}`,
    {}
  );
  return response.data;
};
