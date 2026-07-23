// src/api/endpoints/business/registerOrganizationApi.ts
import { apiClient } from '../../api'; 
import type { OrgType, RegisterOrgResponse } from '../../types/business.types';

// Bạn có thể giữ RegisterOrgPayload nếu thích, 
// nhưng chuẩn nhất là khai báo payload có kiểu là FormData
export const registerOrganizationApi = async (
  roleType: OrgType,
  payload: FormData // <-- Đổi kiểu dữ liệu nhận vào thành FormData
): Promise<RegisterOrgResponse> => {
  
  // KHÔNG CẦN Object.entries() nữa vì payload truyền vào đã là FormData hoàn chỉnh rồi
  
  const response = await apiClient.post<RegisterOrgResponse>(
    `/api/v1/${roleType}/register`,
    payload, // <-- Ném thẳng payload vào đây
    {
      headers: {
        // Ghi đè thành undefined để Axios tự động xử lý multipart/form-data và boundary
        'Content-Type': undefined,
      },
    }
  );
  
  return response.data;
};