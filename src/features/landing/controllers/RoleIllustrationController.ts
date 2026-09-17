// Ported from the standalone landing page's main.ts. Behaviour is unchanged;
// the observer is now kept so it can be disconnected on unmount.

/**
 * Controller for role section illustrations entrance animation & observer
 */
export class RoleIllustrationController {
  private observer: IntersectionObserver | null = null;

  constructor(root: HTMLElement) {
    this.init(root);
  }

  private init(root: HTMLElement): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const imageWraps = root.querySelectorAll<HTMLElement>('.role-image-wrap');

    if (prefersReducedMotion) {
      imageWraps.forEach(wrap => wrap.classList.add('is-visible'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      imageWraps.forEach(wrap => wrap.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // trigger once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    imageWraps.forEach(wrap => observer.observe(wrap));
    this.observer = observer;
  }

  public destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
