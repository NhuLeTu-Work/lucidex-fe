import { NationwideSection } from './NationwideSection';
import { RoleSection } from './RoleSection';

/**
 * Sections 3-6 share one positioning context so the flight path SVG can span
 * them. FlightPathController measures this wrapper and moves #flight-plane
 * along the generated path.
 */
export function RolesWrapper() {
  return (
    <div className="roles-wrapper" id="roles-wrapper">
      {/* SVG Flight Path Overlay & Plane (spans from top of Sec 3 to bottom of Sec 5) */}
      <div className="flight-overlay" id="flight-overlay" aria-hidden="true">
        <svg className="flight-svg" id="flight-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="flight-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <filter id="flight-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="flight-mask-linear" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
              <stop id="flight-mask-stop-0" offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop id="flight-mask-stop-1" offset="10%" stopColor="#fff" stopOpacity="1" />
              <stop id="flight-mask-stop-2" offset="85%" stopColor="#fff" stopOpacity="1" />
              <stop id="flight-mask-stop-3" offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="flight-hole-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="1" />
              <stop offset="35%" stopColor="#000" stopOpacity="1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <mask id="flight-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect id="flight-mask-rect" width="100%" height="100%" fill="url(#flight-mask-linear)" />
              <circle id="flight-mask-hole" cx="-200" cy="-200" r="70" fill="url(#flight-hole-grad)" />
            </mask>
          </defs>
          {/* Faint dashed guide path (opacity 0.15, dashed 4 8) */}
          <path id="flight-path-base" className="flight-path-base" mask="url(#flight-mask)" />
          {/* Solid bright path revealed progressively with scroll */}
          <path id="flight-path-reveal" className="flight-path-reveal" mask="url(#flight-mask)" />
        </svg>
        {/* 3D Paper Plane Canvas Container (centered on path point) */}
        <div id="flight-plane" className="flight-plane" aria-hidden="true"></div>
      </div>

      {/* SECTION 3 - For institutions (Issuer) */}
      <RoleSection
        id="issuer"
        label="Issuer"
        title="Upload once. Stay the source of truth"
        points={[
          'Institutions upload graduate records once.',
          'Every record comes directly from the issuing institution.',
        ]}
        image={{ src: '/landing/images/issuer.webp', alt: 'Institution uploading graduate records' }}
      />

      {/* SECTION 4 - For graduates (Owner) */}
      <RoleSection
        id="owner"
        label="Owner"
        title="Claim your credentials. Control who sees them"
        points={[
          'Graduates confirm their identity and claim their credentials.',
          'Graduates decide who can see each credential.',
          'Share codes follow NIST security standards.',
        ]}
        image={{ src: '/landing/images/owner.webp', alt: 'Graduate controlling who can see their credential' }}
        reverse
      />

      {/* SECTION 5 - For employers (Verifier) */}
      <RoleSection
        id="verifier"
        label="Verifier"
        title="Enter a code. Know it is real"
        points={[
          'Employers use a share code to confirm authenticity in seconds.',
          'Every verification is recorded with who checked it and when.',
        ]}
        image={{ src: '/landing/images/verifier.webp', alt: 'Employer verifying a credential' }}
      />

      {/* SECTION 6 - Nationwide */}
      <NationwideSection />
    </div>
  );
}
