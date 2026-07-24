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
    role: string;
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

export interface UserProfile {
  actor_type: string;
  actor_id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  status: string;
  org_id?: string;
  organization_name?: string;
  twofa_enabled: boolean;
  totp_reset_requested?: boolean;
  totp_reset_requested_at?: string | null;
  password_reset_requested?: boolean;
  password_reset_requested_at?: string | null;
  details?: Record<string, any>;
}

export interface AuthMeResponse {
  success: boolean;
  data: UserProfile;
  message: string;
  error_code?: string;
}