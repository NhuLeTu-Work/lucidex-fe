// Ported from the standalone landing page's main.ts. Behaviour is unchanged;
// lookups are scoped to the landing root and initListeners() now has a matching
// teardown, because this controller scrolls the whole window and must not stay
// alive on other routes.

/**
 * Controller for Section 6 (CTA) JavaScript scroll snapping
 */
export class CtaScrollSnapController {
  private ctaSection: HTMLElement | null = null;
  private ctaCard: HTMLElement | null = null;
  private nationalSection: HTMLElement | null = null;

  private lastScrollY = 0;
  private scrollDirection: 'down' | 'up' = 'down';
  private isSnapping = false;
  private isSnappingDisabled = false;
  private scrollEndTimer: number | null = null;
  private snapResetTimer: number | null = null;
  private prefersReducedMotion = false;
  private isDestroyed = false;

  constructor(root: HTMLElement) {
    this.ctaSection = root.querySelector<HTMLElement>('#nationwide');
    this.ctaCard = root.querySelector<HTMLElement>('.nationwide-card');
    this.nationalSection = root.querySelector<HTMLElement>('#national');

    if (!this.ctaSection || !this.ctaCard) return;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lastScrollY = window.scrollY;

    this.checkSizing();
    this.initListeners();
  }

  private checkSizing(): void {
    if (!this.ctaSection || !this.ctaCard) return;
    this.ctaSection.style.height = '';
    const vh = window.innerHeight;

    // If the CTA card content is taller than viewport (with vertical padding),
    // disable snapping and let section grow to its content height
    if (this.ctaCard.scrollHeight + 32 > vh) {
      this.ctaSection.style.height = 'auto';
      this.isSnappingDisabled = true;
    } else {
      this.ctaSection.style.height = '';
      this.isSnappingDisabled = false;
    }
  }

  private initListeners(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', this.onScrollEnd, { passive: true });
    }
  }

  private onResize = (): void => {
    this.checkSizing();
  };

  private onScroll = (): void => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > this.lastScrollY) {
      this.scrollDirection = 'down';
    } else if (currentScrollY < this.lastScrollY) {
      this.scrollDirection = 'up';
    }
    this.lastScrollY = currentScrollY;

    if (this.isSnapping) return;

    // Run settle() after 140ms without scroll events when scrollend is not supported or as backup
    if (this.scrollEndTimer !== null) {
      window.clearTimeout(this.scrollEndTimer);
    }
    this.scrollEndTimer = window.setTimeout(() => {
      this.settle();
    }, 140);
  };

  private onScrollEnd = (): void => {
    if (this.isSnapping) {
      this.isSnapping = false;
      if (this.snapResetTimer !== null) {
        window.clearTimeout(this.snapResetTimer);
        this.snapResetTimer = null;
      }
      return;
    }
    if (this.scrollEndTimer !== null) {
      window.clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = null;
    }
    this.settle();
  };

  public settle = (): void => {
    if (this.isDestroyed) return;
    if (this.isSnapping || this.isSnappingDisabled || !this.ctaSection) return;

    const ctaTopInDoc = this.ctaSection.getBoundingClientRect().top + window.scrollY;
    const innerHeight = window.innerHeight;
    const offset = window.scrollY - ctaTopInDoc;

    // Do nothing if |offset| < 2 or |offset| >= innerHeight
    if (Math.abs(offset) < 2 || Math.abs(offset) >= innerHeight) {
      return;
    }

    const shown = 1 - Math.abs(offset) / innerHeight;
    const IN = 0.25;
    const OUT = 0.25;

    let targetY: number | null = null;

    if (offset < 0) {
      // CTA partly visible at the bottom
      if (this.scrollDirection === 'down') {
        if (shown >= IN) {
          targetY = ctaTopInDoc;
        } else {
          targetY = ctaTopInDoc - innerHeight;
        }
      } else {
        // scrolling up
        if (shown >= 1 - OUT) {
          targetY = ctaTopInDoc;
        } else {
          targetY = ctaTopInDoc - innerHeight;
        }
      }
    } else {
      // CTA partly visible at the top (offset > 0)
      const nationalTop = this.nationalSection
        ? this.nationalSection.getBoundingClientRect().top + window.scrollY
        : ctaTopInDoc + innerHeight;

      if (this.scrollDirection === 'down') {
        if (shown >= 1 - OUT) {
          targetY = ctaTopInDoc;
        } else {
          targetY = nationalTop;
        }
      } else {
        // scrolling up
        if (shown >= IN) {
          targetY = ctaTopInDoc;
        } else {
          targetY = nationalTop;
        }
      }
    }

    if (targetY !== null) {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      if (Math.abs(window.scrollY - targetY) >= 2) {
        this.isSnapping = true;
        const behavior = this.prefersReducedMotion ? 'auto' : 'smooth';
        window.scrollTo({ top: targetY, behavior });

        if (this.snapResetTimer !== null) {
          window.clearTimeout(this.snapResetTimer);
        }
        this.snapResetTimer = window.setTimeout(() => {
          this.isSnapping = false;
        }, this.prefersReducedMotion ? 50 : 600);
      }
    }
  };

  public destroy(): void {
    this.isDestroyed = true;

    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scrollend', this.onScrollEnd);

    if (this.scrollEndTimer !== null) {
      window.clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = null;
    }
    if (this.snapResetTimer !== null) {
      window.clearTimeout(this.snapResetTimer);
      this.snapResetTimer = null;
    }

    // checkSizing() writes an inline height onto the section; drop it so nothing
    // is left behind on the element React is about to remove.
    if (this.ctaSection) this.ctaSection.style.height = '';

    this.ctaSection = null;
    this.ctaCard = null;
    this.nationalSection = null;
  }
}
