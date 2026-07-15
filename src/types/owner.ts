export type OwnerTab = 'dashboard' | 'credentials' | 'links' | 'audit' | 'consent' | 'claim';
export type ClaimStep = 'form' | 'otp' | 'success';

export interface VerifiedLink {
  id: string;
  credentialId: string;
  url: string;
  expiry: string;
  expiryLabel: string;
  consentType: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  revokedAt?: string;
}