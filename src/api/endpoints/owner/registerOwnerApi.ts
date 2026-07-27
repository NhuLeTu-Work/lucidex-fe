import { apiClient } from '../../api';
import type {
  RegisterOwnerPayload, RegisterOwnerResponse,
} from '../../types/owner.types';

export const registerOwnerApi = async (payload: RegisterOwnerPayload): Promise<RegisterOwnerResponse> => {
  // Post payload trực tiếp, không cần FormData
  const response = await apiClient.post<RegisterOwnerResponse>('/api/v1/owner/register', payload);
  return response.data;
};