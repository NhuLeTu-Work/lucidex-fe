import { apiClient } from '@/api/api';
import type {
  GetVerifiedLinksQueryParams,
  GetVerifiedLinksResponse,
} from '@/api/types/owner.types';

export const getVerifiedLinksApi = async (
  params?: GetVerifiedLinksQueryParams
): Promise<GetVerifiedLinksResponse> => {
  const query: Record<string, any> = {};

  if (params) {
    if (params.credential_id && String(params.credential_id).trim()) {
      query.credential_id = String(params.credential_id).trim();
    }
    if (params.page !== undefined && params.page !== null) {
      query.page = Number(params.page);
    }
    if (params.page_size !== undefined && params.page_size !== null) {
      query.page_size = Number(params.page_size);
    }
  }

  const config = Object.keys(query).length > 0 ? { params: query } : undefined;
  const response = await apiClient.get<GetVerifiedLinksResponse>(
    '/api/v1/owner/verified-links',
    config
  );
  return response.data;
};
