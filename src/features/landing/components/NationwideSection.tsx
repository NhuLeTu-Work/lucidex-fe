import { Link } from 'react-router-dom';
import { LANDING_ROUTES } from '../links';

/**
 * SECTION 6 - where the paper plane lands and becomes a digital credential.
 * FlightPathController drives #credential-flash, #digital-credential and
 * #credential-check-path; CtaScrollSnapController owns the snapping.
 */
export function NationwideSection() {
  return (
    <section className="nationwide-section" id="nationwide">
      <div className="container">
        <div className="nationwide-card">
          {/* Brief light flash (radial glow) at t = 0.3 */}
          <div id="credential-flash" className="credential-flash" aria-hidden="true"></div>

          {/* Digital Credential: Flat glass card with glowing border, circuit pattern, and checkmark circle */}
          <div id="digital-credential" className="digital-credential" aria-hidden="true">
            <div className="credential-card-inner">
              <svg className="credential-circuit" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Subtle circuit pattern lines & nodes */}
                <path d="M 20 60 H 90 L 120 90 H 220 L 250 60 H 280" stroke="url(#cred-glow)" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
                <path d="M 40 140 H 100 L 130 110 H 180" stroke="url(#cred-glow)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
                <path d="M 20 340 H 110 L 150 300 H 210 L 240 330 H 280" stroke="url(#cred-glow)" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
                <path d="M 30 200 H 70 L 90 220 V 260 H 130" stroke="url(#cred-glow)" strokeWidth="1" opacity="0.3" />
                <path d="M 270 200 H 230 L 210 220 V 260 H 170" stroke="url(#cred-glow)" strokeWidth="1" opacity="0.3" />
                <circle cx="90" cy="60" r="2.5" fill="#38BDF8" opacity="0.7" />
                <circle cx="220" cy="90" r="2.5" fill="#6366F1" opacity="0.7" />
                <circle cx="110" cy="340" r="2.5" fill="#38BDF8" opacity="0.7" />
                <circle cx="240" cy="330" r="2.5" fill="#6366F1" opacity="0.7" />
                <circle cx="70" cy="200" r="2" fill="#38BDF8" opacity="0.5" />
                <circle cx="230" cy="200" r="2" fill="#6366F1" opacity="0.5" />
                <defs>
                  <linearGradient id="cred-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Large checkmark inside circle at center */}
              <div className="credential-badge">
                <svg className="credential-check-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="34" stroke="url(#cred-circle-grad)" strokeWidth="2.5" fill="rgba(56, 189, 248, 0.08)" />
                  <circle cx="40" cy="40" r="30" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="3 5" />
                  <path id="credential-check-path" d="M26 40.5 L35 49.5 L54 30.5" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="cred-circle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="nationwide-content">
            <h2 className="nationwide-title">Built in Can Tho. Ready for Vietnam.</h2>
            <div className="nationwide-points">
              <div className="nationwide-point">
                <p className="nationwide-point-text">Lucidex starts in Can Tho.</p>
              </div>
              <div className="nationwide-point">
                <p className="nationwide-point-text">The same model works for any institution in Vietnam that issues credentials.</p>
              </div>
              <div className="nationwide-point">
                <p className="nationwide-point-text">Every institution that joins makes more credentials verifiable for every employer.</p>
              </div>
            </div>
            <div className="nationwide-cta-wrap">
              <Link to={LANDING_ROUTES.register} className="btn btn-primary" id="final-get-started-btn">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
