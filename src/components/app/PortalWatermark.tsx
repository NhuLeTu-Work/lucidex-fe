import { ROLE_IDENTITY } from './roleIdentity';
import type { PortalRole } from './roleIdentity';

/** Decorative role icon washed into the bottom-right of the content area. */
export function PortalWatermark({ role }: { role: PortalRole }) {
  const { Icon } = ROLE_IDENTITY[role];

  return (
    <div className="portal-watermark" aria-hidden="true">
      <Icon strokeWidth={1.2} />
    </div>
  );
}
