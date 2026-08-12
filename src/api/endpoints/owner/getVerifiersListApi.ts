import { apiClient } from '@/api/api';
import type { GetVerifiersListResponse } from '@/api/types/owner.types';

export const getVerifiersListApi = async (): Promise<GetVerifiersListResponse> => {
  const response = await apiClient.get<GetVerifiersListResponse>(
    '/api/v1/owner/verifiers-list'
  );
  return response.data;
};
