import { Link } from 'react-router-dom';
import { LANDING_ROUTES } from '../links';

/**
 * Hero: three stacked full-bleed media layers plus the content layer.
 * HeroVideoController handles playback, the fade between layers and the
 * autoplay/reduced-motion fallbacks.
 */
export function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      {/* Media layers (all full-bleed, covering 100% width and 100vh height, object-fit: cover) */}
      <div className="hero-media-container" aria-hidden="true">
        {/* 2. Background layer: lucidex-bg-blue.mp4 */}
        <video
          id="hero-bg-video"
          className="hero-media hero-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/landing/lucidex-bg-blue-poster.jpg"
        >
          <source src="/landing/lucidex-bg-blue.mp4" type="video/mp4" />
        </video>

        {/* 1. Giant background word: BETWEEN background layer and hero video layer */}
        <div className="hero-giant-word-container" aria-hidden="true">
          <svg
            id="hero-giant-word-svg"
            className="hero-giant-word-svg"
            aria-hidden="true"
          >
            <text
              id="hero-giant-word-text"
              className="hero-giant-word-text"
              dominantBaseline="alphabetic"
            >
              LUCIDEX
            </text>
          </svg>
          <div className="hero-giant-word hero-giant-word-fallback" aria-hidden="true">LUCIDEX</div>
        </div>

        {/* 3. Hero video layer: hero-video.mp4 (mix-blend-mode: screen) */}
        <div className="hero-credential-outer hero-media hero-main-video" aria-hidden="true">
          <div className="hero-credential-shadow" aria-hidden="true" />
          <div className="hero-credential-float">
            <video
              id="hero-main-video"
              className="hero-media hero-credential-video"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/landing/hero-video-poster.jpg"
            >
              <source src="/landing/hero-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      {/* 4. Content layer */}
      <div className="container hero-content-wrap">
        {/* Top-Left Block */}
        <div className="hero-top-left">
          <h1 className="hero-title">
            <span className="hero-title-top">Vietnamese credentials</span>
            <span className="sr-only"> Trusted worldwide</span>
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">
            Verify any Vietnamese degree directly from the institution that issued it.
          </p>
        </div>

        {/* Bottom-Right Block */}
        <div className="hero-bottom-right" aria-hidden="true">
          <div className="hero-title-bottom">
            <span className="gradient-trusted">Trusted</span> worldwide
          </div>
        </div>

        {/* Center Bottom CTAs */}
        <div className="hero-center-ctas">
          <div className="hero-cta-group">
            <Link to={LANDING_ROUTES.verify} className="btn btn-primary btn-pill-glow" id="hero-verify-cta">
              Verify a credential
            </Link>
            <a href="#issuer" className="hero-cta-secondary" id="hero-institutions-cta">
              <span className="cta-circle">
                <svg className="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
              <span className="cta-label">For institutions</span>
            </a>
          </div>
        </div>
      </div>

      {/* 7. Scroll indicator (bottom-left) */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <span className="scroll-text">SCROLL</span>
        <div className="scroll-track">
          <span className="scroll-dot"></span>
        </div>
      </div>
    </section>
  );
}
