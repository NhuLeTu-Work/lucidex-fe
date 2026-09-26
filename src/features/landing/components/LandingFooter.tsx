import { useEffect, useRef } from 'react';
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
  const footerRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVeilHeight = () => {
      if (!footerRef.current || !wordmarkRef.current || !veilRef.current) return;
      const footerRect = footerRef.current.getBoundingClientRect();
      const wordmarkRect = wordmarkRef.current.getBoundingClientRect();
      const veilHeight = (wordmarkRect.top - footerRect.top) + wordmarkRect.height * 0.90;
      veilRef.current.style.height = `${veilHeight}px`;
    };

    updateVeilHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && footerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateVeilHeight();
      });
      resizeObserver.observe(footerRef.current);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateVeilHeight();
      });
    }

    window.addEventListener('resize', updateVeilHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateVeilHeight);
    };
  }, []);

  return (
    <footer className="site-footer" id="site-footer" ref={footerRef}>
      <div className="footer-veil" ref={veilRef} aria-hidden="true" />
      <nav className="footer-container" aria-label="Footer">
        <div className="footer-grid">
          {/* Col 1: Brand & Tagline */}
          <div className="footer-col footer-col-brand">
            <a href="#hero" className="footer-brand-link" aria-label="Lucidex Homepage">
              <img src="/landing/logo-icon-rev.png" alt="Lucidex Logo" className="brand-logo" width="28" height="28" />
              <span className="brand-text">Lucidex</span>
            </a>
            <p className="footer-tagline">Verify Vietnamese credentials at the source</p>
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

        {/* Giant Wordmark & Glow Layer */}
        <div className="footer-wordmark-wrap" ref={wordmarkRef} aria-hidden="true">
          <div className="footer-wordmark-glow" aria-hidden="true">LUCIDEX</div>
          <div className="footer-wordmark">LUCIDEX</div>
        </div>

        {/* Legal Row */}
        <div className="footer-legal">
          <span className="legal-copy">© 2026 Lucidex</span>
        </div>
      </nav>
    </footer>
  );
}
