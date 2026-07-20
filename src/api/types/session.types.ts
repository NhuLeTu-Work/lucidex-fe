import type { MongoId } from "./common.types";

export type ActorType = "owner" | "institution_account" | "platform_admin";

export type SessionStatus = "active" | "revoked";

export interface DeviceInfo {
  user_agent: string;
  ip: string;
}

export interface Session {
  _id: MongoId;
  actor_type: ActorType;
  actor_id: MongoId;
  org_id: MongoId | null; // FK tới Organization
  refresh_token_hash: string; // KHÔNG nên trả về FE, cần BE strip ở serializer
  device_info: DeviceInfo;
  status: SessionStatus;
  twofa_verified: boolean;
  issued_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
}