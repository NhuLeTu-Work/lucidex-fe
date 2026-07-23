// src/api/types/super.ts

export interface CreateAdminResponse {
  id: string;
  username: string;
  role: string;
  status: string;
  temporary_password: string;
}

export interface AdminAccountResponse {
  id: string;
  username: string;
  role: string;
  status: string;
  twofa_enabled: boolean;
}

export interface ResetPasswordResponse {
  username: string;
  temporary_password: string;
}

export interface ResetTotpResponse {
  id: string;
  username: string;
  role: string;
  status: string;
  twofa_enabled: boolean;
  totp_reset_requested: boolean;
  totp_reset_requested_at: string;
  password_reset_requested: boolean;
  password_reset_requested_at: string;
}