import { apiClient } from '../../api'
import type { RejectOrganizationPayload, RejectOrganizationResponse } from '../../types/admin.types';

export const rejectOrganizationApi = async (
  organizationId: string,
  payload: RejectOrganizationPayload
): Promise<RejectOrganizationResponse> => {
  const response = await apiClient.post<RejectOrganizationResponse>(
    `/api/v1/admin/organizations/${organizationId}/reject`,
    payload
  );
  return response.data;
};