import type { MongoId } from "./common.types";

export type OwnerStatus = "active" | "locked_migrated" | "soft_deleted";

export type ConsentType = "one_time" | "per_request" | "org_level" | "time_bound";

export interface ConsentSettings {
  default_type: ConsentType;
  default_org_id: MongoId | null;
  default_duration: number | null;
}

export interface Owner {
  _id: MongoId;
  email: string;
  password_hash: string | null; // null nếu đăng ký qua OAuth — KHÔNG nên trả về FE, cần BE strip ở serializer
  oauth_provider: string | null;
  oauth_subject_id: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  dob: string | null;
  status: OwnerStatus;
  consent_settings: ConsentSettings;
  deleted_at: string | null; // soft-delete, purge sau 30 ngày
  purge_after: string | null;
  restored_at: string | null;
}

// src/api/types/owner.ts

// Dữ liệu truyền vào (application/json)
export interface RegisterOwnerPayload {
  email: string;
  password: string;
  confirm_password: string;
}

// Dữ liệu trả về
export interface RegisterOwnerResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    status: string;
  };
  message: string;
  error_code: string;
}

export interface VerifyOwnerOtpPayload {
  email: string;
  otp_code: string;
}

// Dữ liệu trả về khi Verify OTP thành công
export interface VerifyOwnerOtpResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    status: string; // Sẽ chuyển từ 'pending' sang 'active'
  };
  message: string;
  error_code: string;
}

export interface ResendOwnerOtpPayload {
  email: string;
}

// Dữ liệu trả về khi gửi lại OTP thành công (data: null)
export interface ResendOwnerOtpResponse {
  success: boolean;
  data: null;
  message: string;
  error_code: string;
}

export interface RegisterOwnerPayload {
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterOwnerResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    status: string;
  };
  message: string;
  error_code: string;
}