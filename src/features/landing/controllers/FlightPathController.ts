import { mountPlane3D } from './plane3d/mountPlane3D';
import type { Plane3DController } from './plane3d/mountPlane3D';
import { monotonicCatmullRomToBezier } from './geometry';
import type { PathSample, Point } from './geometry';

/**
 * Controller for scroll-driven flight path connecting Section 3 -> 4 -> 5 -> 6 (CTA)
 * Features:
 * - Plane strictly anchored to viewport horizontal center line (50% innerHeight)
 * - Binary search lookup table (~600 points) with no position lerp
 * - Monotonic Catmull-Rom spline
 * - Flying behind illustrations and text
 * - Digital credential transformation at Section 6 CTA card over 30vh scroll
 */
export class FlightPathController {
  private wrapper: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private basePath: SVGPathElement | null = null;
  private revealPath: SVGPathElement | null = null;
  private plane: HTMLElement | null = null;
  private flash: HTMLElement | null = null;
  private credential: HTMLElement | null = null;
  private checkPath: SVGPathElement | null = null;
  private plane3D: Plane3DController | null = null;
  private maskLinear: SVGLinearGradientElement | null = null;
  private maskHole: SVGCircleElement | null = null;
  private maskStop1: SVGStopElement | null = null;
  private maskStop2: SVGStopElement | null = null;

  private totalLength = 0;
  private lookupTable: PathSample[] = [];
  private currentHeadingDeg = 0;
  private hasInitializedHeading = false;
  private isRafScheduled = false;
  private prefersReducedMotion = false;
  private debouncedResizeRaf: number | null = null;

  // Plane-to-credential transformation state
  private targetT = 0;
  private displayT = 0;
  private lastPathPosition: { x: number; y: number; s: number } | null = null;
  private isAnimatingFallback = false;
  private cardObserver: IntersectionObserver | null = null;

  // Teardown bookkeeping. The standalone page never unmounted, so none of this
  // existed there; inside the SPA every one of these has to be releasable.
  private readonly root: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private fallbackRafId: number | null = null;
  private pendingLoadListeners: Array<() => void> = [];
  private isDestroyed = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.wrapper = root.querySelector<HTMLElement>('#roles-wrapper');
    this.overlay = root.querySelector<HTMLElement>('#flight-overlay');
    this.basePath = root.querySelector<SVGPathElement>('#flight-path-base');
    this.revealPath = root.querySelector<SVGPathElement>('#flight-path-reveal');
    this.plane = root.querySelector<HTMLElement>('#flight-plane');
    this.flash = root.querySelector<HTMLElement>('#credential-flash');
    this.credential = root.querySelector<HTMLElement>('#digital-credential');
    this.checkPath = root.querySelector<SVGPathElement>('#credential-check-path');
    this.maskLinear = root.querySelector<SVGLinearGradientElement>('#flight-mask-linear');
    this.maskHole = root.querySelector<SVGCircleElement>('#flight-mask-hole');
    this.maskStop1 = root.querySelector<SVGStopElement>('#flight-mask-stop-1');
    this.maskStop2 = root.querySelector<SVGStopElement>('#flight-mask-stop-2');

    if (this.checkPath) {
      this.checkPath.style.strokeDasharray = '45';
      this.checkPath.style.strokeDashoffset = '45';
    }

    if (!this.wrapper || !this.overlay || !this.basePath || !this.revealPath || !this.plane) return;

    this.plane3D = mountPlane3D(this.plane);

    this.init();
  }

  private init(): void {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.updatePath();

    // On page load or refresh when the CTA is already in view (including anchor links),
    // show the final credential state immediately
    const sec6 = this.root.querySelector<HTMLElement>('#nationwide');
    if (sec6) {
      const top = sec6.getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (top <= 0.35 * vh || window.location.hash === '#nationwide') {
        this.targetT = 1;
        this.displayT = 1;
      }
    }

    if (this.prefersReducedMotion) {
      this.handleReducedMotion();
      return;
    }

    this.setupListeners();
    this.render();
  }

  private handleReducedMotion(): void {
    if (!this.revealPath || !this.plane || !this.basePath) return;

    // Hide plane and animated path reveal
    this.plane.style.display = 'none';
    this.revealPath.style.display = 'none';

    // Show full faint path
    this.basePath.style.opacity = '0.2';
    this.basePath.style.strokeDasharray = 'none';

    // Hide flash and mask hole
    if (this.flash) this.flash.style.display = 'none';
    if (this.maskHole) this.maskHole.setAttribute('r', '0');

    // Show final credential behind CTA statically
    if (this.credential) {
      this.credential.style.transform = 'translate(-50%, -50%) scale(1)';
      this.credential.style.opacity = '0.35';
      this.credential.style.filter = 'blur(1px)';
      this.credential.classList.remove('is-resting');
    }
    if (this.checkPath) {
      this.checkPath.style.strokeDashoffset = '0';
    }
  }

  private onLayoutChange = (): void => {
    if (this.debouncedResizeRaf !== null) {
      cancelAnimationFrame(this.debouncedResizeRaf);
    }
    this.debouncedResizeRaf = requestAnimationFrame(() => {
      this.debouncedResizeRaf = null;
      this.updatePath();
      if (this.prefersReducedMotion) {
        this.handleReducedMotion();
      } else {
        this.render();
      }
    });
  };

  private setupListeners(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onLayoutChange, { passive: true });
    window.addEventListener('orientationchange', this.onLayoutChange, { passive: true });

    // IntersectionObserver fallback on the CTA card (threshold 0.6):
    // if the card is at least 60% visible and displayT < 1, animate displayT to 1 over 400ms (easeOutCubic)
    this.setupIntersectionObserver();

    // ResizeObserver on wrapper, the landing root, and illustrations.
    // The standalone page observed document.body; inside the SPA the landing
    // root is the equivalent subtree and keeps us out of the rest of the app.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        this.onLayoutChange();
      });
      this.resizeObserver = ro;

      if (this.wrapper) ro.observe(this.wrapper);
      ro.observe(this.root);
      const illustrations = this.root.querySelectorAll('.role-illustration');
      illustrations.forEach((img) => ro.observe(img));
      const card = this.root.querySelector('.nationwide-card');
      if (card) ro.observe(card);
    }

    // Recalculate after images finish loading
    const illustrations = this.root.querySelectorAll('.role-illustration');
    illustrations.forEach((img) => {
      const imgEl = img as HTMLImageElement;
      if (!imgEl.complete) {
        imgEl.addEventListener('load', this.onLayoutChange, { once: true });
        this.pendingLoadListeners.push(() =>
          imgEl.removeEventListener('load', this.onLayoutChange)
        );
      }
    });

    // The standalone page waited for window 'load' here. On a client-side
    // navigation that event has already fired and never will again, which would
    // leave the path laid out against stale geometry, so measure on the next
    // frame instead.
    if (document.readyState === 'complete') {
      this.onLayoutChange();
    } else {
      window.addEventListener('load', this.onLayoutChange);
      this.pendingLoadListeners.push(() =>
        window.removeEventListener('load', this.onLayoutChange)
      );
    }

    // Recalculate after fonts finish loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        if (this.isDestroyed) return;
        this.onLayoutChange();
      });
    }

    // Recalculate when illustration entrance transitions end
    const wraps = this.root.querySelectorAll('.role-image-wrap');
    wraps.forEach((wrap) => {
      wrap.addEventListener('transitionend', this.onLayoutChange, { once: true });
      this.pendingLoadListeners.push(() =>
        wrap.removeEventListener('transitionend', this.onLayoutChange)
      );
    });
  }

  private setupIntersectionObserver(): void {
    const card = this.root.querySelector('.nationwide-card');
    if (!card) return;

    this.cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (this.displayT < 1 && !this.isAnimatingFallback) {
              this.startFallbackAnimation();
            }
          }
        });
      },
      { threshold: [0.6] }
    );
    this.cardObserver.observe(card);
  }

  private startFallbackAnimation(): void {
    if (this.displayT >= 1 || this.isAnimatingFallback) return;
    this.isAnimatingFallback = true;
    const startVal = this.displayT;
    const startTime = performance.now();
    const duration = 400;

    const step = (now: number) => {
      if (this.isDestroyed) return;
      // If user scrolled back up above trigger, cancel fallback animation
      if (this.targetT === 0) {
        this.isAnimatingFallback = false;
        this.fallbackRafId = null;
        this.requestRender();
        return;
      }

      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      // easeOutCubic: 1 - Math.pow(1 - p, 3)
      const ease = 1 - Math.pow(1 - p, 3);
      this.displayT = startVal + (1 - startVal) * ease;
      this.render();

      if (p < 1 && this.isAnimatingFallback) {
        this.fallbackRafId = requestAnimationFrame(step);
      } else {
        this.fallbackRafId = null;
        this.displayT = 1;
        this.isAnimatingFallback = false;
        this.render();
      }
    };
    this.fallbackRafId = requestAnimationFrame(step);
  }

  private requestRender(): void {
    if (this.prefersReducedMotion || this.isDestroyed) return;
    if (!this.isRafScheduled) {
      this.isRafScheduled = true;
      this.rafId = requestAnimationFrame(this.onRafFrame);
    }
  }

  private onScroll = (): void => {
    this.requestRender();
  };

  private onRafFrame = (): void => {
    this.isRafScheduled = false;
    this.rafId = null;
    if (this.isDestroyed) return;
    this.render();
    if (!this.prefersReducedMotion && (this.isAnimatingFallback || Math.abs(this.targetT - this.displayT) > 0.001)) {
      this.requestRender();
    }
  };

  /**
   * Build strictly monotonic downward flight path through illustration centers to CTA card
   */
  public updatePath(): void {
    if (!this.wrapper || !this.overlay || !this.basePath || !this.revealPath) return;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const w = wrapperRect.width;
    const h = wrapperRect.height;
    if (w <= 0 || h <= 0) return;

    const img1El = this.root.querySelector<HTMLElement>('#issuer .role-illustration');
    const img2El = this.root.querySelector<HTMLElement>('#owner .role-illustration');
    const img3El = this.root.querySelector<HTMLElement>('#verifier .role-illustration');
    const cardEl = this.root.querySelector<HTMLElement>('.nationwide-card');

    if (!img1El || !img2El || !img3El || !cardEl) return;

    const r1 = img1El.getBoundingClientRect();
    const r2 = img2El.getBoundingClientRect();
    const r3 = img3El.getBoundingClientRect();
    const rCard = cardEl.getBoundingClientRect();

    const sec1 = this.root.querySelector<HTMLElement>('#issuer');
    const sec2 = this.root.querySelector<HTMLElement>('#owner');
    const sec3 = this.root.querySelector<HTMLElement>('#verifier');

    const s1Rect = sec1 ? sec1.getBoundingClientRect() : wrapperRect;
    const s2Rect = sec2 ? sec2.getBoundingClientRect() : wrapperRect;
    const s3Rect = sec3 ? sec3.getBoundingClientRect() : wrapperRect;

    const clampX = (x: number) => Math.max(24, Math.min(w - 24, x));

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    // Helper: get un-transformed visual center
    const getCenter = (r: DOMRect, el: HTMLElement) => {
      const wrap = el.closest('.role-image-wrap');
      const offset = (wrap && !wrap.classList.contains('is-visible')) ? -24 : 0;
      return {
        x: clampX(r.left + r.width * 0.5 - wrapperRect.left),
        y: r.top + r.height * 0.5 - wrapperRect.top + offset
      };
    };

    const c1 = getCenter(r1, img1El);
    const c2 = getCenter(r2, img2El);
    const c3 = getCenter(r3, img3El);
    const cCard = {
      x: clampX(rCard.left + rCard.width * 0.5 - wrapperRect.left),
      y: rCard.top + rCard.height * 0.5 - wrapperRect.top
    };

    let waypoints: Point[] = [];

    if (isMobile) {
      // Mobile (<768px, stacked layout):
      // Start: top of Section 3, slightly offset from center
      const w0: Point = {
        x: clampX(w * 0.5 - w * 0.15),
        y: Math.max(0, s1Rect.top - wrapperRect.top)
      };

      // Cross behind Issuer illustration diagonally through its center
      const w1: Point = {
        x: c1.x,
        y: c1.y
      };

      // Gap between Section 3 and 4: small S-curve (15% left of center)
      const gap1Y = (s1Rect.bottom + s2Rect.top) * 0.5 - wrapperRect.top;
      const w2: Point = {
        x: clampX(w * 0.5 - w * 0.15),
        y: gap1Y
      };

      // Cross behind Owner illustration through center
      const w3: Point = {
        x: c2.x,
        y: c2.y
      };

      // Gap between Section 4 and 5: small S-curve (15% right of center)
      const gap2Y = (s2Rect.bottom + s3Rect.top) * 0.5 - wrapperRect.top;
      const w4: Point = {
        x: clampX(w * 0.5 + w * 0.15),
        y: gap2Y
      };

      // Cross behind Verifier illustration through center
      const w5: Point = {
        x: c3.x,
        y: c3.y
      };

      // End: horizontal and vertical center of CTA card in Section 6
      const w6: Point = {
        x: cCard.x,
        y: cCard.y
      };

      waypoints = [w0, w1, w2, w3, w4, w5, w6];
    } else {
      // Desktop (>= 1024px) & Tablet (768-1023px)
      // W0: top of Section 3 on text-column side
      const textCol1 = this.root.querySelector<HTMLElement>('#issuer .role-text-col');
      const t1Rect = textCol1 ? textCol1.getBoundingClientRect() : null;
      const startX = t1Rect ? (t1Rect.left + t1Rect.width * 0.5 - wrapperRect.left) : (w * 0.28);
      const w0: Point = {
        x: clampX(startX),
        y: Math.max(0, s1Rect.top - wrapperRect.top)
      };

      // W1: pass behind Issuer illustration, crossing diagonally through its center
      const w1: Point = {
        x: c1.x,
        y: c1.y
      };

      // W2: swing across the page in a wide gentle arc in gap between Sec 3 and 4
      const gap1Y = (s1Rect.bottom + s2Rect.top) * 0.5 - wrapperRect.top;
      // Arc width: desktop wide (~35% of w from left), tablet 60% width (~40% of w)
      const arc1X = isTablet ? (w * 0.40) : (w * 0.35);
      const w2: Point = {
        x: clampX(arc1X),
        y: gap1Y
      };

      // W3: pass behind Owner illustration, crossing through its center
      const w3: Point = {
        x: c2.x,
        y: c2.y
      };

      // W4: wide gentle arc again in gap between Sec 4 and 5
      const gap2Y = (s2Rect.bottom + s3Rect.top) * 0.5 - wrapperRect.top;
      const arc2X = isTablet ? (w * 0.60) : (w * 0.65);
      const w4: Point = {
        x: clampX(arc2X),
        y: gap2Y
      };

      // W5: pass behind Verifier illustration, crossing through its center
      const w5: Point = {
        x: c3.x,
        y: c3.y
      };

      // W6: horizontal and vertical center of CTA card in Section 6
      const w6: Point = {
        x: cCard.x,
        y: cCard.y
      };

      waypoints = [w0, w1, w2, w3, w4, w5, w6];
    }

    // Ensure strict monotonicity of Y coordinates
    for (let i = 1; i < waypoints.length; i++) {
      if (waypoints[i].y <= waypoints[i - 1].y) {
        waypoints[i].y = waypoints[i - 1].y + 10;
      }
    }

    const d = monotonicCatmullRomToBezier(waypoints, 0.5);
    this.basePath.setAttribute('d', d);
    this.revealPath.setAttribute('d', d);

    this.totalLength = this.revealPath.getTotalLength();
    this.revealPath.style.strokeDasharray = `${this.totalLength} ${this.totalLength}`;

    // Pre-sample the path into a lookup table of 600 points (length, x, y)
    this.lookupTable = [];
    const NUM_SAMPLES = 600;
    for (let i = 0; i < NUM_SAMPLES; i++) {
      const s = (i / (NUM_SAMPLES - 1)) * this.totalLength;
      const pt = this.revealPath.getPointAtLength(s);
      this.lookupTable.push({ s, x: pt.x, y: pt.y });
    }

    // Reset cached lastPathPosition on layout updates
    this.lastPathPosition = null;

    // Fade at both ends of the flight path:
    // Vertical linearGradient in user space (gradientUnits="userSpaceOnUse", y1 = startY, y2 = endY)
    const startY = waypoints[0].y;
    const endY = waypoints[waypoints.length - 1].y;
    const pathHeight = endY - startY;

    if (this.maskLinear && this.maskStop1 && this.maskStop2 && pathHeight > 0) {
      this.maskLinear.setAttribute('y1', startY.toFixed(1));
      this.maskLinear.setAttribute('y2', endY.toFixed(1));

      // Start: opacity 0 -> 1 over first 15vh of path (offset = min(0.15 * innerHeight / pathHeight, 0.3))
      const startFadeOffset = Math.min((0.15 * window.innerHeight) / pathHeight, 0.3);
      // End: fully opaque until TOP EDGE of CTA card, fading to 0 at path end (CTA card center)
      const ctaCardTop = rCard.top - wrapperRect.top;
      const endFadeOffset = Math.max(0.5, Math.min(0.98, (ctaCardTop - startY) / pathHeight));

      this.maskStop1.setAttribute('offset', `${(startFadeOffset * 100).toFixed(2)}%`);
      this.maskStop2.setAttribute('offset', `${(endFadeOffset * 100).toFixed(2)}%`);
    }

    // Position credential and flash initially centered in nationwide-card
    if (this.credential) {
      this.credential.style.transform = 'translate(-50%, -50%) scale(0.7)';
    }
    if (this.flash) {
      this.flash.style.transform = 'translate(-50%, -50%) scale(0.6)';
    }
  }

  /**
   * Helper: Binary search lookup table for targetY and interpolate x, y, s
   */
  private getPointAtY(targetY: number): { x: number; y: number; s: number } {
    const startPt = this.lookupTable[0];
    const endPt = this.lookupTable[this.lookupTable.length - 1];
    if (targetY <= startPt.y) return { x: startPt.x, y: startPt.y, s: startPt.s };
    if (targetY >= endPt.y) return { x: endPt.x, y: endPt.y, s: endPt.s };

    let low = 0;
    let high = this.lookupTable.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this.lookupTable[mid].y <= targetY) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const k = Math.max(0, Math.min(this.lookupTable.length - 2, high));
    const pA = this.lookupTable[k];
    const pB = this.lookupTable[k + 1];
    const tY = (targetY - pA.y) / Math.max(0.001, pB.y - pA.y);
    return {
      x: pA.x + tY * (pB.x - pA.x),
      y: targetY,
      s: pA.s + tY * (pB.s - pA.s)
    };
  }

  /**
   * Render frame: Anchor plane to viewport center line during Sections 3-5 (t = 0),
   * and execute early homing flight and plane-to-credential transformation (t > 0).
   */
  private render(): void {
    if (!this.wrapper || !this.revealPath || !this.plane || this.lookupTable.length < 2 || this.totalLength <= 0) return;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const wrapperTopInDoc = wrapperRect.top + window.scrollY;

    const startPt = this.lookupTable[0];
    const endPt = this.lookupTable[this.lookupTable.length - 1];

    // 1. New trigger window (based on Section 6 top edge relative to viewport)
    const sec6 = this.root.querySelector<HTMLElement>('#nationwide');
    if (!sec6) return;

    const sec6Rect = sec6.getBoundingClientRect();
    const top = sec6Rect.top;
    const vh = window.innerHeight;

    // t starts at 0 when CTA section top enters bottom 10% of viewport (top <= 0.9 * vh)
    // t reaches 1 when CTA section top is at 35% of viewport height (top <= 0.35 * vh)
    // Formula: t = clamp((0.9 * vh - top) / (0.9 * vh - 0.35 * vh), 0, 1)
    let tFromTop = 0;
    const denom = 0.9 * vh - 0.35 * vh; // 0.55 * vh
    if (denom > 0) {
      tFromTop = (0.9 * vh - top) / denom;
    }
    tFromTop = Math.max(0, Math.min(1, tFromTop));

    // Safety: if the page cannot scroll far enough for top to reach 0.35 * vh, force t = 1 at maxScroll.
    // Compute both and use whichever happens first.
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let tFromScroll = 0;
    const secTopInDoc = top + window.scrollY;
    const startScroll = secTopInDoc - 0.9 * vh;

    if (maxScroll > startScroll) {
      tFromScroll = (window.scrollY - startScroll) / (maxScroll - startScroll);
      tFromScroll = Math.max(0, Math.min(1, tFromScroll));
    } else if (window.scrollY >= maxScroll && maxScroll > 0) {
      tFromScroll = 1;
    }

    if (window.scrollY >= maxScroll - 2 && maxScroll > 0) {
      tFromScroll = 1;
    }

    this.targetT = Math.max(tFromTop, tFromScroll);
    this.targetT = Math.max(0, Math.min(1, this.targetT));

    // Fast-scroll smoothing: displayT += (t - displayT) * 0.25 per frame
    if (!this.isAnimatingFallback) {
      if (Math.abs(this.targetT - this.displayT) < 0.002) {
        this.displayT = this.targetT;
      } else {
        this.displayT += (this.targetT - this.displayT) * 0.25;
      }
    }

    // 2. Homing flight (replaces center-line anchoring during transformation)
    let planeX = startPt.x;
    let planeY = startPt.y;
    let planeLength = 0;

    if (this.displayT > 0) {
      // Homing to CTA card center (endPt)
      if (!this.lastPathPosition) {
        const triggerCenterY = (secTopInDoc - 0.4 * window.innerHeight) - wrapperTopInDoc;
        this.lastPathPosition = this.getPointAtY(triggerCenterY);
      }

      // position = lerp(lastPathPosition, cardCenter, easeOutCubic(min(t / 0.4, 1)))
      const normHomeT = Math.min(this.displayT / 0.40, 1);
      const homeProg = 1 - Math.pow(1 - normHomeT, 3);

      planeX = this.lastPathPosition.x + (endPt.x - this.lastPathPosition.x) * homeProg;
      planeY = this.lastPathPosition.y + (endPt.y - this.lastPathPosition.y) * homeProg;
      planeLength = this.lastPathPosition.s + (this.totalLength - this.lastPathPosition.s) * homeProg;

      // Reveal path completes to end point during the same interval (0.00 - 0.40)
      this.revealPath.style.strokeDashoffset = `${Math.max(0, this.totalLength - planeLength)}`;

      // Rotate toward card center while homing in
      const toDx = endPt.x - planeX;
      const toDy = endPt.y - planeY;
      if (Math.hypot(toDx, toDy) > 2) {
        const homingAngleDeg = Math.atan2(toDy, toDx) * (180 / Math.PI);
        let angleDiff = homingAngleDeg - this.currentHeadingDeg;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;
        this.currentHeadingDeg += angleDiff * 0.25;
      }
    } else {
      // While t = 0, plane follows existing center-line logic
      const targetY = window.scrollY + window.innerHeight * 0.5 - wrapperTopInDoc;
      const currentPt = this.getPointAtY(targetY);
      planeX = currentPt.x;
      planeY = currentPt.y;
      planeLength = currentPt.s;
      this.lastPathPosition = { x: planeX, y: planeY, s: planeLength };

      this.revealPath.style.strokeDashoffset = `${Math.max(0, this.totalLength - planeLength)}`;

      // Heading tangent computed from points 4px behind and 4px ahead
      const sampleDistBehind = Math.max(0, planeLength - 4);
      const sampleDistAhead = Math.min(this.totalLength, planeLength + 4);
      const ptB = this.revealPath.getPointAtLength(sampleDistBehind);
      const ptA = this.revealPath.getPointAtLength(sampleDistAhead);

      const dx = ptA.x - ptB.x;
      const dy = ptA.y - ptB.y;
      const targetHeadingDeg = Math.atan2(dy, dx) * (180 / Math.PI);

      if (!this.hasInitializedHeading) {
        this.currentHeadingDeg = targetHeadingDeg;
        this.hasInitializedHeading = true;
      } else {
        let angleDiff = targetHeadingDeg - this.currentHeadingDeg;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;
        this.currentHeadingDeg += angleDiff * 0.2;
      }
    }

    // Banking roll
    const headingDelta = 0;
    const bankDeg = Math.max(-20, Math.min(20, headingDelta * 1.5));

    // 3. Faster, front-loaded timeline
    // 0.00–0.40: plane homes to card center, turns to face camera, scales 1 → 0.6
    let planeScale = 1;
    if (this.displayT >= 0.40) {
      planeScale = 0.6;
    } else if (this.displayT > 0) {
      planeScale = 1 - 0.4 * (this.displayT / 0.40);
    }

    // 0.25–0.45: plane fades out
    let planeOpacity = 1;
    if (this.displayT >= 0.45) {
      planeOpacity = 0;
    } else if (this.displayT > 0.25) {
      planeOpacity = 1 - (this.displayT - 0.25) / (0.45 - 0.25);
    }

    this.plane.style.transform = `translate3d(${planeX.toFixed(1)}px, ${planeY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${planeScale.toFixed(3)})`;
    this.plane.style.opacity = planeOpacity.toFixed(3);

    // Moving fade at the plane: radial hole centered on plane position, radius 70px
    // Hide the hole (radius 0) once the plane has reached the end of the path
    if (this.maskHole) {
      if (this.displayT >= 1 || Math.hypot(endPt.x - planeX, endPt.y - planeY) < 5) {
        this.maskHole.setAttribute('r', '0');
      } else {
        this.maskHole.setAttribute('cx', planeX.toFixed(1));
        this.maskHole.setAttribute('cy', planeY.toFixed(1));
        this.maskHole.setAttribute('r', '70');
      }
    }

    if (this.plane3D && !this.plane3D.isFallback) {
      this.plane3D.updateOrientation(this.currentHeadingDeg, bankDeg, this.displayT, true);
    }

    // 0.30: radial flash at card center (peak 0.8 at t = 0.30, gone by 0.50)
    if (this.flash) {
      let flashOpacity = 0;
      let flashScale = 0.6;
      if (this.displayT >= 0.15 && this.displayT <= 0.30) {
        const riseProg = (this.displayT - 0.15) / 0.15;
        flashOpacity = 0.8 * riseProg;
        flashScale = 0.6 + 0.4 * riseProg;
      } else if (this.displayT > 0.30 && this.displayT <= 0.50) {
        const fadeProg = (this.displayT - 0.30) / 0.20;
        flashOpacity = 0.8 * (1 - fadeProg);
        flashScale = 1.0 + 0.3 * fadeProg;
      }
      this.flash.style.transform = `translate(-50%, -50%) scale(${flashScale.toFixed(3)})`;
      this.flash.style.opacity = flashOpacity.toFixed(3);
    }

    // 0.30–0.65: credential scales 0.7 → 1.0 and fades 0 → final opacity (0.35)
    let credScale = 0.7;
    let credOpacity = 0;
    if (this.displayT >= 0.65) {
      credScale = 1.0;
      credOpacity = 0.35;
    } else if (this.displayT >= 0.30) {
      const credProg = (this.displayT - 0.30) / 0.35;
      credScale = 0.7 + 0.3 * credProg;
      credOpacity = 0.35 * credProg;
    }

    // 0.45–0.75: checkmark draws itself (offset 45 -> 0)
    if (this.checkPath) {
      let checkProg = 0;
      if (this.displayT >= 0.75) {
        checkProg = 1;
      } else if (this.displayT >= 0.45) {
        checkProg = (this.displayT - 0.45) / 0.30;
      }
      const checkOffset = 45 * (1 - checkProg);
      this.checkPath.style.strokeDashoffset = `${checkOffset.toFixed(2)}`;
    }

    // 0.75–1.00: hold the final state (slow float starts)
    if (this.credential) {
      if (this.displayT >= 0.75) {
        this.credential.classList.add('is-resting');
        this.credential.style.transform = '';
        this.credential.style.opacity = '0.35';
        this.credential.style.filter = 'blur(1px)';
      } else {
        this.credential.classList.remove('is-resting');
        this.credential.style.transform = `translate(-50%, -50%) scale(${credScale.toFixed(3)})`;
        this.credential.style.opacity = credOpacity.toFixed(3);
        this.credential.style.filter = 'blur(1px)';
      }
    }
  }

  public destroy(): void {
    this.isDestroyed = true;

    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onLayoutChange);
    window.removeEventListener('orientationchange', this.onLayoutChange);
    this.pendingLoadListeners.forEach((off) => off());
    this.pendingLoadListeners = [];

    if (this.debouncedResizeRaf !== null) {
      cancelAnimationFrame(this.debouncedResizeRaf);
      this.debouncedResizeRaf = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.fallbackRafId !== null) {
      cancelAnimationFrame(this.fallbackRafId);
      this.fallbackRafId = null;
    }
    this.isRafScheduled = false;
    this.isAnimatingFallback = false;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.cardObserver?.disconnect();
    this.cardObserver = null;

    this.plane3D?.destroy();
    this.plane3D = null;

    this.lookupTable = [];
  }
}
