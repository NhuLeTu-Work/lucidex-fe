import { IdCard, SearchCheck, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PortalRole = 'issuer' | 'owner' | 'verifier';

/**
 * Single source for the visual identity of the three portals.
 * `nameKey` / `descKey` are i18n keys — the strings themselves live in
 * src/i18n/en.ts and src/i18n/vi.ts.
 */
export const ROLE_IDENTITY: Record<
  PortalRole,
  { Icon: LucideIcon; nameKey: string; descKey: string }
> = {
  issuer: { Icon: Upload, nameKey: 'issuerPortal', descKey: 'roleDescIssuer' },
  owner: { Icon: IdCard, nameKey: 'ownerPortal', descKey: 'roleDescOwner' },
  verifier: { Icon: SearchCheck, nameKey: 'verifierPortal', descKey: 'roleDescVerifier' },
};
