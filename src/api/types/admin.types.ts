export interface LoginAdminPayload {
  username: string;
  password: string;
}

export interface LoginAdminResponse {
  success: boolean;
  data: {
    requires_totp_setup: boolean; // true nếu chưa cài Google Auth
    requires_totp: boolean;       // true nếu đã cài, cần nhập mã
    setup_token?: string;         // Dùng khi setup
    challenge_token?: string;     // Dùng khi verify
    totp_uri?: string;
    manual_entry_key?: string;    // Mã thủ công (nếu không quét được QR)
    qr_code?: string;             // Ảnh QR Code dạng base64 hoặc URL
  };
  message: string;
  error_code: string;
}

export interface VerifyAdminTotpLoginPayload {
  challenge_token: string;
  otp_code: string;
}

export interface VerifyAdminTotpLoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
  };
  message: string;
  error_code: string;
}

export interface VerifyTotpSetupPayload {
  setup_token: string;
  otp_code: string;
}

export interface VerifyTotpSetupResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
  };
  message: string;
  error_code: string;
}

// src/api/types/adminOrg.ts

export type OrgTypeFilter = 'issuer' | 'verifier' | null;
export type OrgStatusFilter = 'pending_review' | 'approved' | 'rejected' | null;

export interface OrganizationDocument {
  name: string;
  url: string;
  type: string;
}

export interface OrganizationRecord {
  id: string;
  type: 'issuer' | 'verifier';
  status: 'pending_review' | 'approved' | 'rejected';
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  registrant_title?: string | null;
  documents: OrganizationDocument[];
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface GetOrganizationsResponse {
  success: boolean;
  data: OrganizationRecord[];
  message: string;
  error_code?: string;
}

// Params cho query string
export interface GetOrganizationsParams {
  type?: OrgTypeFilter;
  status?: OrgStatusFilter;
}

export interface ApproveOrganizationResponse {
  success: boolean;
  data: {
    organization_id: string;
    organization_status: string;
    invite_status: string;
    invite_expires_at: string;
    email_sent: boolean;
  };
  message: string;
}