import { Link } from 'react-router-dom';
import { LANDING_ROUTES } from '../links';

interface LandingHeaderProps {
  /** Show a single "Open app" link instead of Log in / Register. */
  isAuthenticated: boolean;
  /** Where "Open app" goes - the portal for the current role. */
  appHomePath: string;
}

/**
 * The floating glass pill header.
 *
 * Markup matches the standalone page, with one addition: the standalone had no
 * app to link into, so auth links are added to `.nav-actions` and to the mobile
 * dropdown. The in-page anchors stay plain <a> so the browser handles the hash
 * scroll exactly as before.
 */
export function LandingHeader({ isAuthenticated, appHomePath }: LandingHeaderProps) {
  const authLinks = isAuthenticated ? (
    <Link to={appHomePath} className="nav-auth-link">
      Open app
    </Link>
  ) : (
    <>
      <Link to={LANDING_ROUTES.login} className="nav-auth-link">
        Log in
      </Link>
      <Link to={LANDING_ROUTES.register} className="nav-auth-link nav-auth-link-secondary">
        Register
      </Link>
    </>
  );

  const mobileAuthLinks = isAuthenticated ? (
    <Link to={appHomePath} className="mobile-nav-link">
      Open app
    </Link>
  ) : (
    <>
      <Link to={LANDING_ROUTES.login} className="mobile-nav-link">
        Log in
      </Link>
      <Link to={LANDING_ROUTES.register} className="mobile-nav-link">
        Register
      </Link>
    </>
  );

  return (
    <header className="site-header" id="site-header">
      <nav className="nav-pill" aria-label="Main">
        <a href="#hero" className="nav-brand" aria-label="Lucidex Homepage">
          <img src="/landing/logo-icon-rev.png" alt="Lucidex Logo" className="brand-logo" width="28" height="28" />
          <span className="brand-text">Lucidex</span>
        </a>

        <ul className="nav-links">
          <li><a href="#problem" className="nav-link" id="nav-link-problem">Problem</a></li>
          <li><a href="#issuer" className="nav-link" id="nav-link-issuer">How it works</a></li>
          <li><a href="#national" className="nav-link" id="nav-link-national">Nationwide</a></li>
        </ul>

        <div className="nav-actions">
          {authLinks}
          <Link to={LANDING_ROUTES.verify} className="btn btn-primary btn-pill-glow header-cta" id="header-verify-cta">
            Verify a credential
          </Link>
        </div>

        {/* Mobile Menu Button (<820px) */}
        <button
          type="button"
          className="mobile-menu-btn"
          id="mobile-menu-btn"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mobile-menu-dropdown"
        >
          <svg className="icon-menu" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg className="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </nav>

      {/* Mobile Dropdown Panel under Pill */}
      <div className="mobile-menu-dropdown" id="mobile-menu-dropdown" aria-label="Mobile Navigation" hidden>
        <div className="mobile-dropdown-inner">
          <a href="#problem" className="mobile-nav-link">Problem</a>
          <a href="#issuer" className="mobile-nav-link">How it works</a>
          <a href="#national" className="mobile-nav-link">Nationwide</a>
          {mobileAuthLinks}
          <Link to={LANDING_ROUTES.verify} className="btn btn-primary btn-pill-glow mobile-dropdown-cta">
            Verify a credential
          </Link>
        </div>
      </div>
    </header>
  );
}
