import type { MongoId } from "./common.types";

export type OrganizationType = "issuer" | "verifier";

export type OrganizationStatus =
  | "pending_review"
  | "approved"
  | "rejected";

export type AccountStatus = "active" | "locked";

export interface OrganizationDocument {
  name: string;
  url: string;
  type: string; // business license, authorization letter, etc.
}

/** ⚠ PLACEHOLDER — cấu trúc tối thiểu theo US 3.6/3.7, chưa chốt AC, cần review khi AC hoàn thiện */
export interface VerifierPlan {
  tier: string;
  monthly_quota: number;
  quota_used: number;
  reset_at: string; // ISO date string
}

export interface VerifierProfile {
  plan: VerifierPlan;
}

export interface Organization {
  _id: MongoId;
  type: OrganizationType;
  status: OrganizationStatus;
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  registrant_title: string | null; // bắt buộc khi type = "verifier"
  documents: OrganizationDocument[];
  rejection_reason: string | null;
  reviewed_by: MongoId | null;
  reviewed_at: string | null;
  invite_token: string | null;
  invite_token_used: boolean;
  account_status: AccountStatus;
  lock_reason: string | null;
  locked_by: MongoId | null;
  locked_at: string | null;
  verifier_profile: VerifierProfile | null; // chỉ tồn tại khi type = "verifier"
}
