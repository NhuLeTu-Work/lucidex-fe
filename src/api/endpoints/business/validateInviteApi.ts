import { apiClient } from '../../api';
import type { ValidateInviteResponse } from '@/api/types/business.types';

export const validateInviteTokenApi = async (token: string): Promise<ValidateInviteResponse> => {
  const response = await apiClient.get('/api/v1/institution-invites/validate', {
    params: { token }
  });
  return response.data;
};