import { apiClient } from "@/api/api";

export interface GetCredentialsQueryParams {
  page?: number;
  limit?: number;
  student_id?: string;
  class_id?: string;
  graduation_year?: number | string;
  status?: string;
  search?: string;
  sort?: string;
}

export interface CredentialListItem {
  id: string;
  student_id: string;
  class_id: string;
  full_name: string;
  graduation_year: number;
  status: 'claimed' | 'unclaimed';
  claimed_at: string | null;
  created_at: string;
}

export interface CredentialSummary {
  total_credentials: number;
  total_claimed: number;
  total_unclaimed: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface GetCredentialsResponseData {
  summary: CredentialSummary;
  items: CredentialListItem[];
  pagination: PaginationInfo;
}

export interface GetCredentialsApiResponse {
  success: boolean;
  data: GetCredentialsResponseData;
  message: string;
  error_code: string | null;
}

export const getCredentialsApi = async (
  params?: GetCredentialsQueryParams
): Promise<GetCredentialsApiResponse> => {
  const query: Record<string, any> = {};
  if (params?.page) query.page = params.page;
  if (params?.limit) query.limit = params.limit;
  if (params?.student_id) query.student_id = params.student_id;
  if (params?.class_id) query.class_id = params.class_id;
  if (params?.graduation_year) query.graduation_year = params.graduation_year;
  if (params?.status) query.status = params.status;
  if (params?.search) query.search = params.search;
  if (params?.sort) query.sort = params.sort;

  const response = await apiClient.get<GetCredentialsApiResponse>(
    '/api/v1/issuer/credentials',
    { params: query }
  );

  return response.data;
};
