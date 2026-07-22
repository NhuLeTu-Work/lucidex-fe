// src/api/endpoints/admin/approveOrganizationApi.ts
import { apiClient } from '../../api'; 
import type { ApproveOrganizationResponse } from '../../types/admin.types';

export const approveOrganizationApi = async (
  organizationId: string
): Promise<ApproveOrganizationResponse> => {
  const response = await apiClient.post<ApproveOrganizationResponse>(
    `/api/v1/admin/organizations/${organizationId}/approve`
  );
  
  return response.data;
};