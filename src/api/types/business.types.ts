// src/api/types/business.ts

export type OrgType = 'issuer' | 'verifier';

export interface RegisterOrgPayload {
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  document: File;
}

export interface RegisterOrgResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
  };
  message: string;
  error_code?: string;
}

export interface SetupPasswordPayload {
  invite_token: string;
  password: string;
  confirm_password: string;
}

export interface SetupPasswordResponse {
  success: boolean;
  data: string; // Theo schema API, data trả về là string (thường là message báo thành công hoặc token tạm)
  message: string;
  error_code?: string;
}