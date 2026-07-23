// src/api/endpoints/business/registerOrganizationApi.ts
import { apiClient } from '../../api'; // Đảm bảo đường dẫn này khớp với instance axios của bạn
import type { OrgType, RegisterOrgPayload, RegisterOrgResponse } from '../../types/business.types';

export const registerOrganizationApi = async (
  roleType: OrgType,
  payload: RegisterOrgPayload
): Promise<RegisterOrgResponse> => {
  const formData = new FormData();
  
  // Tự động append tất cả các trường vào FormData
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await apiClient.post<RegisterOrgResponse>(
    `/api/v1/${roleType}/register`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};