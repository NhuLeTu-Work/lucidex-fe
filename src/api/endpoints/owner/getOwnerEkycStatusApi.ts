import { apiClient } from '@/api/api';
import type { OwnerEkycStatusApiResponse } from '@/api/types/owner.types';

export const getOwnerEkycStatusApi = async (): Promise<OwnerEkycStatusApiResponse> => {
  const response = await apiClient.get<OwnerEkycStatusApiResponse>(
    '/api/v1/owner/ekyc/status'
  );
  return response.data;
};
