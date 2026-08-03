import { apiClient } from '@/api/api';
import type {
  OwnerCredentialsQueryParams,
  OwnerCredentialsApiResponse,
} from '@/api/types/owner.types';

export const getOwnerCredentialsApi = async (
  params?: OwnerCredentialsQueryParams
): Promise<OwnerCredentialsApiResponse> => {
  const query: Record<string, any> = {};

  if (params) {
    if (params.page !== undefined && params.page !== null && Number(params.page) > 1) {
      query.page = Number(params.page);
    }
    if (params.limit !== undefined && params.limit !== null && Number(params.limit) !== 20) {
      query.limit = Number(params.limit);
    }
    if (params.student_id && String(params.student_id).trim()) {
      query.student_id = String(params.student_id).trim();
    }
    if (params.class_id && String(params.class_id).trim()) {
      query.class_id = String(params.class_id).trim();
    }
    if (params.graduation_year && !isNaN(Number(params.graduation_year))) {
      query.graduation_year = Number(params.graduation_year);
    }
    if (params.status && (params.status === 'claimed' || params.status === 'unclaimed')) {
      query.status = params.status;
    }
    if (params.search && String(params.search).trim()) {
      query.search = String(params.search).trim();
    }
    if (params.sort && String(params.sort).trim() && params.sort !== 'created_at:desc') {
      query.sort = String(params.sort).trim();
    }
  }

  const config = Object.keys(query).length > 0 ? { params: query } : undefined;
  const response = await apiClient.get<any>('/api/v1/owner/credentials', config);

  const raw = response.data;
  if (raw && raw.data && raw.summary === undefined) {
    return raw as OwnerCredentialsApiResponse;
  }
  if (raw && (raw.summary || raw.items)) {
    return {
      success: true,
      data: {
        summary: raw.summary || { total_credentials: 0, total_claimed: 0, total_unclaimed: 0 },
        items: raw.items || [],
        pagination: raw.pagination || { page: 1, limit: 20, total_items: 0, total_pages: 0 },
      },
      message: raw.message || 'Credentials retrieved successfully.',
      error_code: raw.error_code || null,
    };
  }

  return raw as OwnerCredentialsApiResponse;
};
