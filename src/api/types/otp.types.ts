import type { MongoId } from "./common.types";

export type OtpSubjectType =
  | "owner"
  | "institution_account"
  | "verified_link"
  | "pending_registration";

export type OtpPurpose =
  | "2fa_login"
  | "register"
  | "claim_email"
  | "password_reset"
  | "link_access";

export type OtpChannel = "email" | "sms";

export interface OtpCode {
  _id: MongoId;
  subject_type: OtpSubjectType;
  subject_id: MongoId;
  purpose: OtpPurpose;
  code_hash: string; // đã hash, KHÔNG trả raw code về FE
  channel: OtpChannel;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  used: boolean;
}