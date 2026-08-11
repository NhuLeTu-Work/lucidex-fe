import { apiClient } from '@/api/api';
import type {
  CreateVerifiedLinkPayload,
  CreateVerifiedLinkResponse,
} from '@/api/types/owner.types';

export const createVerifiedLinkApi = async (
  payload: CreateVerifiedLinkPayload
): Promise<CreateVerifiedLinkResponse> => {
  const response = await apiClient.post<CreateVerifiedLinkResponse>(
    '/api/v1/owner/verified-links',
    payload
  );
  return response.data;
};
