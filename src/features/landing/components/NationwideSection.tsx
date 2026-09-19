import { Link } from 'react-router-dom';
import { LANDING_ROUTES } from '../links';

/**
 * SECTION 6 - Product Demo Video Section
 * Where the paper plane lands on the video screen area and triggers a WebGL ripple reveal.
 */
export function NationwideSection() {
  return (
    <section className="demo-section" id="nationwide">
      <div className="demo-section-container">
        <h2 className="demo-section-heading">
          Enter a code. <span className="demo-gradient-text">Get an answer.</span>
        </h2>

        {/* Browser-style frame */}
        <div className="demo-browser-frame" id="demo-browser-frame">
          {/* Top chrome bar */}
          <div className="demo-chrome-bar">
            <div className="demo-chrome-dots" aria-hidden="true">
              <span className="demo-dot" />
              <span className="demo-dot" />
              <span className="demo-dot" />
            </div>
          </div>

          {/* Screen area: aspect-ratio 16/9 */}
          <div className="demo-screen-area" id="demo-screen-area">
            {/* Fallback placeholder text of the opening scene */}
            <div className="demo-screen-placeholder" aria-hidden="true">
              <div className="demo-placeholder-text">THE NEW STANDARD FOR DIGITAL CREDENTIALS</div>
              <div className="demo-placeholder-sub">Secure. Instant. Auditable.</div>
            </div>

            {/* Video element: muted, loop, playsinline, preload="auto", NOT autoplay */}
            <video
              id="demo-verify-video"
              className="demo-video"
              src="/landing/demo-verify.mp4"
              muted
              loop
              playsInline
              preload="auto"
            />

            {/* WebGL Canvas stacked on top of video */}
            <canvas
              id="demo-ripple-canvas"
              className="demo-canvas"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Below the frame: existing "Get started" button */}
        <div className="demo-cta-wrap">
          <Link to={LANDING_ROUTES.register} className="btn btn-primary" id="final-get-started-btn">
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
