import { apiClient } from '@/api/api';
import type { OwnerCredentialDetailApiResponse } from '@/api/types/owner.types';

export const getOwnerCredentialDetailApi = async (
  credentialId: string
): Promise<OwnerCredentialDetailApiResponse> => {
  const response = await apiClient.get<OwnerCredentialDetailApiResponse>(
    `/api/v1/owner/credentials/${credentialId}`
  );
  return response.data;
};
