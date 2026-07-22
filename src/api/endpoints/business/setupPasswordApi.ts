// src/api/endpoints/business/setupPasswordApi.ts
import { apiClient } from '../../api'; // Trỏ đến cấu hình axios của bạn
import type { OrgType, SetupPasswordPayload, SetupPasswordResponse } from '../../types/business.types';

export const setupPasswordAndRequestOtp = async (
  type: OrgType,
  payload: SetupPasswordPayload
): Promise<SetupPasswordResponse> => {
  // API này nhận JSON thuần nên không cần FormData như API Đăng ký
  const response = await apiClient.post<SetupPasswordResponse>(
    `/api/v1/${type}/invites/password`,
    payload
  );
  
  return response.data;
};