import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { LANDING_PENDING_LINKS, LANDING_ROUTES } from '../links';

type PendingKey = keyof typeof LANDING_PENDING_LINKS;

/**
 * Renders Contact / Privacy / Terms. The standalone page marked these
 * `data-pending` and had a controller swallow the click; here the same thing
 * falls out of the config in links.ts, with no listener to clean up.
 */
function PendingLink({ pendingKey, label }: { pendingKey: PendingKey; label: string }) {
  const href = LANDING_PENDING_LINKS[pendingKey];

  if (href) {
    return (
      <Link to={href} className="footer-link">
        {label}
      </Link>
    );
  }

  return (
    <a
      href="#"
      className="footer-link"
      data-pending={pendingKey}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => e.preventDefault()}
    >
      {label}
    </a>
  );
}

/** Site Footer: Edge Minimal with Giant Wordmark */
export function LandingFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <nav className="footer-container" aria-label="Footer">
        <div className="footer-grid">
          {/* Col 1: Brand & Tagline */}
          <div className="footer-col footer-col-brand">
            <a href="#hero" className="footer-brand-link" aria-label="Lucidex Homepage">
              <img src="/landing/logo-icon-rev.png" alt="Lucidex Logo" className="brand-logo" width="28" height="28" />
              <span className="brand-text">Lucidex</span>
            </a>
            <p className="footer-tagline">Verify Vietnamese credentials at the source.</p>
          </div>

          {/* Col 2: Product */}
          <div className="footer-col">
            <h3 className="footer-heading">Product</h3>
            <ul className="footer-links">
              <li><Link to={LANDING_ROUTES.verify} className="footer-link">Verify a credential</Link></li>
              <li><a href="#issuer" className="footer-link">How it works</a></li>
              <li><a href="#national" className="footer-link">Nationwide</a></li>
            </ul>
          </div>

          {/* Col 3: For */}
          <div className="footer-col">
            <h3 className="footer-heading">For</h3>
            <ul className="footer-links">
              <li><a href="#issuer" className="footer-link">Institutions</a></li>
              <li><a href="#owner" className="footer-link">Graduates</a></li>
              <li><a href="#verifier" className="footer-link">Employers</a></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="footer-col">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li><PendingLink pendingKey="contact" label="Contact" /></li>
              <li><PendingLink pendingKey="privacy" label="Privacy" /></li>
              <li><PendingLink pendingKey="terms" label="Terms" /></li>
            </ul>
          </div>
        </div>

        {/* Giant Wordmark */}
        <div className="footer-wordmark" aria-hidden="true">LUCIDEX</div>

        {/* Legal Row */}
        <div className="footer-legal">
          <span className="legal-copy">© 2026 Lucidex</span>
          <span className="legal-origin">Built in Can Tho, Vietnam</span>
        </div>
      </nav>
    </footer>
  );
}
