// src/api/types/verifier.ts

// Dữ liệu truyền vào (giống y hệt issuer)
export interface RegisterVerifierPayload {
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  document: File;
}

// Dữ liệu trả về
export interface RegisterVerifierResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
  };
  message: string;
  error_code: string;
}