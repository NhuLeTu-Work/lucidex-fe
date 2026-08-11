export type EkycStatus = 'verified' | 'not_verified';

export interface OwnerEkycStatusData {
  status: EkycStatus;
  verification_id: string | null;
  provider: string | null;
  verified_at: string | null;
}

export interface OwnerEkycStatusApiResponse {
  success: boolean;
  data: OwnerEkycStatusData;
  message: string;
  error_code: string | null;
}

export interface RegisterOwnerPayload {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterOwnerResponseData {
  email?: string;
  status?: string;
}

export interface RegisterOwnerResponse {
  success: boolean;
  data?: RegisterOwnerResponseData;
  message: string;
  error_code?: string | null;
}

export interface VerifyOwnerOtpPayload {
  email: string;
  otp_code: string;
}

export interface VerifyOwnerOtpResponseData {
  access_token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user?: any;
}

export interface VerifyOwnerOtpResponse {
  success: boolean;
  data?: VerifyOwnerOtpResponseData;
  message: string;
  error_code?: string | null;
}

export interface OwnerCredentialItem {
  id: string;
  student_id: string;
  class_id?: string;
  full_name: string;
  graduation_year: number;
  status: 'claimed' | 'unclaimed';
  can_claim?: boolean;
  claimed_at: string | null;
  created_at?: string;
}

export interface OwnerCredentialSummary {
  total_credentials: number;
  total_claimed: number;
  total_unclaimed: number;
}

export interface OwnerPaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface OwnerCredentialsResponseData {
  summary: OwnerCredentialSummary;
  items: OwnerCredentialItem[];
  pagination: OwnerPaginationInfo;
}

export interface OwnerCredentialsQueryParams {
  page?: number;
  limit?: number;
  student_id?: string;
  class_id?: string;
  graduation_year?: number;
  status?: 'claimed' | 'unclaimed';
  search?: string;
  sort?: string;
}

export interface OwnerCredentialsApiResponse {
  success: boolean;
  data: OwnerCredentialsResponseData;
  message: string;
  error_code: string | null;
}

export interface OwnerCredentialIssuerInfo {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
}

export interface OwnerCredentialDetailData {
  id: string;
  issuer_org_id: string;
  issuer: OwnerCredentialIssuerInfo;
  student_id: string;
  class_id: string;
  full_name: string;
  dob: string;
  major_vi: string;
  major_en: string;
  degree_type: string;
  graduation_year: number;
  graduation_classification_vi: string;
  graduation_classification_en: string;
  mode_of_study_vi: string;
  mode_of_study_en: string;
  university_email: string;
  phone: string | null;
  status: 'claimed' | 'unclaimed';
  claim_method: string | null;
  claimed_at: string | null;
  unclaimed_at: string | null;
  revoked_reason: string | null;
  revoked_at: string | null;
  created_at: string;
  restored_at: string | null;
}

export interface OwnerCredentialDetailApiResponse {
  success: boolean;
  data: OwnerCredentialDetailData;
  message: string;
  error_code: string | null;
}

export interface ClaimedCredentialResult {
  id: string;
  status: 'claimed' | 'unclaimed';
  claim_method: string;
  claimed_at: string;
}

export interface ClaimCredentialData {
  credential: ClaimedCredentialResult;
  already_claimed?: boolean;
}

export interface ClaimCredentialApiResponse {
  success: boolean;
  data: ClaimCredentialData;
  message: string;
  error_code: string | null;
}

export interface CreateVerifiedLinkPayload {
  credential_id: string;
  expires_at?: string | null;
  allowed_org_ids?: string[];
  max_access_count?: number | null;
}

export interface VerifiedLinkData {
  id: string;
  code: string;
  credential_id: string;
  consent_mode: 'access_count' | 'time_bound' | 'trusted_orgs' | 'custom' | null;
  expires_at: string | null;
  allowed_org_ids: string[];
  max_access_count: number | null;
  remaining_access_count: number | null;
  display_status: string;
  created_at: string;
  revoked_at: string | null;
}

export interface CreateVerifiedLinkResponse {
  success: boolean;
  data: VerifiedLinkData;
  message: string;
  error_code: string | null;
}