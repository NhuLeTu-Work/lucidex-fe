// src/api/endpoints/authentication/googleAuthApi.ts
import { apiClient } from '../../api';

export const googleAuthApi = async (credential: string) => {
  const response = await apiClient.post('/api/v1/owner/auth/google', { credential });
  return response.data;
};