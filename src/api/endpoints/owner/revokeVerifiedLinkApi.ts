import { apiClient } from '@/api/api';

export interface RevokeVerifiedLinkData {
  id: string;
  status: string;
  revoked_at: string;
}

export interface RevokeVerifiedLinkResponse {
  success: boolean;
  data: RevokeVerifiedLinkData;
  message: string;
  error_code: string | null;
}

export const revokeVerifiedLinkApi = async (
  linkId: string
): Promise<RevokeVerifiedLinkResponse> => {
  const response = await apiClient.delete<RevokeVerifiedLinkResponse>(
    `/api/v1/owner/verified-links/${linkId}/revoke`
  );
  return response.data;
};
