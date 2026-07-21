// src/api/types/super.ts

export interface CreateAdminResponse {
  id: string;
  username: string;
  role: string;
  status: string;
  temporary_password: string;
}