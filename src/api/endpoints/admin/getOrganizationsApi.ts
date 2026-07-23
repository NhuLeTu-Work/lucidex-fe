// src/api/endpoints/admin/getOrganizationsApi.ts
import { apiClient } from '../../api'; // Đảm bảo đường dẫn này trỏ tới cấu hình Axios của bạn
import type { GetOrganizationsResponse, GetOrganizationsParams } from '../../types/admin.types';

export const getOrganizationsApi = async (
  params?: GetOrganizationsParams
): Promise<GetOrganizationsResponse> => {
  const response = await apiClient.get<GetOrganizationsResponse>('/api/v1/admin/organizations/list', {
    params: { 
      ...params, 
      _t: new Date().getTime() // Đảm bảo trình duyệt không bao giờ cache URL này
    }, 
  });
  
  return response.data;
};