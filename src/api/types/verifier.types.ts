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

// Request & Response types cho Verify Code API (/api/v1/verifier/verified-links/verify)
export interface VerifyCodePayload {
  code: string;
}

export interface VerifiedCredentialDetail {
  id: string;
  issuer_org_id: string;
  issuer_name: string;
  student_id: string;
  full_name: string;
  dob: string;
  pob: string;
  gender: string;
  national_id: string;
  degree_type: string;
  class_id: string;
  faculty: string;
  major: string;
  specialization: string;
  gpa: number;
  classification: string;
  mode_of_study: string;
  degree_number: string;
  registration_number: string;
  graduation_year: number;
  status: string;
}

export interface VerifyCodeSuccessData {
  credential: VerifiedCredentialDetail;
  verified_at: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  data: VerifyCodeSuccessData | null;
  message: string;
  error_code: string | null;
}

// Request & Response types cho Bulk Verify API (/api/v1/verifier/verified-links/bulk-verify)
export interface BulkVerifyResultItem {
  row_number: number;
  code: string;
  status: 'active' | 'expired' | 'revoked' | 'not_found';
  is_restricted: boolean;
  credential_id: string | null;
  owner_name: string | null;
  credential_type: string | null;
  issuer_name?: string | null;
  graduation_year?: number | null;
}

export interface BulkVerifySummary {
  active: number;
  expired: number;
  revoked: number;
  not_found: number;
}

export interface BulkVerifySuccessData {
  batch_id: string;
  total: number;
  summary: BulkVerifySummary;
  results: BulkVerifyResultItem[];
}

export interface BulkVerifyResponse {
  success: boolean;
  data: BulkVerifySuccessData | null;
  message: string;
  error_code: string | null;
}