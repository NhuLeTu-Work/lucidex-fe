// src/api/types/auth.ts

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  success: boolean;
  data: {
    otp_token: string;
    message: string;
  };
  message: string;
  error_code: string;
}

export interface VerifyAuthOtpPayload {
  otp_token: string;
  otp_code: string;
}

export interface VerifyAuthOtpResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    refresh_token: string;
    owner_id?: string;
    email: string;
  };
  message: string;
  error_code: string;
}