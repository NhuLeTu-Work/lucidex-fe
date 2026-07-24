export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
  };
  message: string;
  error_code?: string;
}

import axios from 'axios';

export const refreshTokenApi = async (payload: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
  // KHÔNG dùng apiClient ở đây, dùng axios thuần
  const response = await axios.post<RefreshTokenResponse>(
    `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/refresh`,
    payload
  );
  
  return response.data;
};