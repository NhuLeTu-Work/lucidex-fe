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