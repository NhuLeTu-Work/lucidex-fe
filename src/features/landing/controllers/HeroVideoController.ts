// Ported from the standalone landing page's main.ts. Behaviour is unchanged;
// element lookups are scoped to the landing root and every listener is tracked
// so the controller can be torn down when the route unmounts.

export class HeroVideoController {
  private bgVideo: HTMLVideoElement | null = null;
  private heroVideo: HTMLVideoElement | null = null;
  private hasFadedIn = false;

  private readonly onError = (): void => this.showBackgroundImmediately();

  private readonly onTimeUpdate = (): void => {
    if (!this.heroVideo) return;
    if (this.heroVideo.currentTime >= 3.5 && !this.hasFadedIn) {
      this.hasFadedIn = true;
      this.bgVideo?.classList.add('fade-in');
    }
  };

  private readonly onEnded = (): void => {
    if (!this.heroVideo) return;
    this.heroVideo.pause();
    // Ensure background has faded in if ended
    if (!this.hasFadedIn && this.bgVideo) {
      this.hasFadedIn = true;
      this.bgVideo.classList.add('fade-in');
    }
  };

  constructor(root: HTMLElement) {
    this.bgVideo = root.querySelector<HTMLVideoElement>('#hero-bg-video');
    this.heroVideo = root.querySelector<HTMLVideoElement>('#hero-main-video');

    if (!this.bgVideo || !this.heroVideo) return;

    this.init();
  }

  private init(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.handleReducedMotion();
      return;
    }

    this.setupPlayback();
  }

  /**
   * Reduced motion: show last frame poster, background at full opacity without animation
   */
  private handleReducedMotion(): void {
    if (!this.bgVideo || !this.heroVideo) return;

    this.heroVideo.removeAttribute('autoplay');
    this.heroVideo.pause();
    this.heroVideo.poster = '/landing/hero-video-poster.jpg';
    this.heroVideo.currentTime = 4.99;

    this.bgVideo.removeAttribute('autoplay');
    this.bgVideo.pause();
    this.bgVideo.classList.add('immediate-visible');
  }

  /**
   * Setup standard dual-layer playback and timing
   */
  private setupPlayback(): void {
    if (!this.bgVideo || !this.heroVideo) return;

    // Start background video immediately (hidden at opacity 0)
    const bgPlayPromise = this.bgVideo.play();
    if (bgPlayPromise !== undefined) {
      bgPlayPromise.catch(() => {
        this.showBackgroundImmediately();
      });
    }

    // Start hero video
    const heroPlayPromise = this.heroVideo.play();
    if (heroPlayPromise !== undefined) {
      heroPlayPromise.catch(() => {
        this.showBackgroundImmediately();
      });
    }

    // Error fallbacks
    this.heroVideo.addEventListener('error', this.onError);
    this.bgVideo.addEventListener('error', this.onError);

    // When hero video reaches 3.5s, fade background from opacity 0 to 1 over 1.5s
    this.heroVideo.addEventListener('timeupdate', this.onTimeUpdate);

    // When hero video ends, keep it paused on its last frame
    this.heroVideo.addEventListener('ended', this.onEnded);
  }

  /**
   * Fallback for autoplay failure or errors: show background at full opacity immediately
   */
  private showBackgroundImmediately(): void {
    if (this.bgVideo) {
      this.bgVideo.classList.add('immediate-visible');
    }
  }

  public destroy(): void {
    this.heroVideo?.removeEventListener('error', this.onError);
    this.heroVideo?.removeEventListener('timeupdate', this.onTimeUpdate);
    this.heroVideo?.removeEventListener('ended', this.onEnded);
    this.bgVideo?.removeEventListener('error', this.onError);

    // React removes the elements right after this, but pausing first stops the
    // decoders immediately instead of leaving it to garbage collection.
    this.heroVideo?.pause();
    this.bgVideo?.pause();

    this.heroVideo = null;
    this.bgVideo = null;
  }
}
