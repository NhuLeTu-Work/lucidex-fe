import { apiClient } from '@/api/api';

export interface DefaultLinkSettingsData {
  default_consent_mode: 'access_count' | 'time_bound' | 'trusted_orgs' | 'custom' | null;
  default_max_access_count: number | null;
  default_expiry_hours: number | null;
  default_allowed_org_ids: string[];
}

export interface GetLinkSettingsResponse {
  success: boolean;
  data: DefaultLinkSettingsData;
  message: string;
  error_code: string | null;
}

export const getLinkSettingsApi = async (): Promise<GetLinkSettingsResponse> => {
  const response = await apiClient.get<GetLinkSettingsResponse>('/api/v1/owner/link-settings');
  return response.data;
};
