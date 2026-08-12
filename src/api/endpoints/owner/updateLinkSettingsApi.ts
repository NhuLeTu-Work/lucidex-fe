import { apiClient } from '@/api/api';
import type { DefaultLinkSettingsData } from './getLinkSettingsApi';

export interface UpdateLinkSettingsPayload {
  default_consent_mode?: 'access_count' | 'time_bound' | 'trusted_orgs' | 'custom' | null;
  default_max_access_count?: number | null;
  default_expiry_hours?: number | null;
  default_allowed_org_ids?: string[] | null;
}

export interface UpdateLinkSettingsResponse {
  success: boolean;
  data: DefaultLinkSettingsData;
  message: string;
  error_code: string | null;
}

export const updateLinkSettingsApi = async (
  payload: UpdateLinkSettingsPayload
): Promise<UpdateLinkSettingsResponse> => {
  const response = await apiClient.patch<UpdateLinkSettingsResponse>(
    '/api/v1/owner/link-settings',
    payload
  );
  return response.data;
};
