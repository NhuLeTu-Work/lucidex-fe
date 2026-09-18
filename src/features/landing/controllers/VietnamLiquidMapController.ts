// ============================================================================
// Lucidex - Feature 1: Fixed Liquid Vietnam Outline Background Controller
// ============================================================================
// Ported from the standalone project's VietnamLiquidMap.ts. Behaviour is
// unchanged; lookups are scoped to the landing root, the reduced-motion
// MediaQueryList is kept so its listener can actually be removed, and destroy()
// now also clears the inline opacity it writes every frame.

export class VietnamLiquidMapController {
  private readonly W = 1257;
  private readonly H = 1503;

  private layer: HTMLElement | null = null;
  private frontWave: SVGPathElement | null = null;
  private backWave: SVGPathElement | null = null;
  private nationalSection: HTMLElement | null = null;

  private shownProgress = 0;
  private rafId: number | null = null;
  private prefersReducedMotion = false;
  private resizeObserver: ResizeObserver | null = null;
  private root: HTMLElement;
  private motionQuery: MediaQueryList | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.layer = root.querySelector<HTMLElement>('#mapLayer');
    this.frontWave = root.querySelector<SVGPathElement>('#waveFront');
    this.backWave = root.querySelector<SVGPathElement>('#waveBack');
    this.nationalSection = root.querySelector<HTMLElement>('#national');

    if (!this.layer || !this.frontWave || !this.backWave) {
      return;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  private init(): void {
    // Listen for reduced motion changes. The query object is kept so the
    // listener can be removed again; the standalone version created it inline,
    // which made removal impossible.
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);

    // Recompute on window resize
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Recompute when document height changes
    this.resizeObserver = new ResizeObserver(() => {
      // Height change handled smoothly via dynamic offsets in tick
    });
    this.resizeObserver.observe(this.root);

    // Start animation loop
    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  private onMotionPreferenceChange = (e: MediaQueryListEvent): void => {
    this.prefersReducedMotion = e.matches;
  };

  private handleResize = (): void => {
    // Dynamic recalculation happens inside tick
  };

  /**
   * Generates smooth quadratic Bezier wave path
   */
  private generateWavePath(level: number, amplitude: number, wavelength: number, phase: number): string {
    const pts: [number, number][] = [];
    const step = this.W / 40;

    for (let x = -step; x <= this.W + step; x += step) {
      const y = level + amplitude * Math.sin((x / wavelength) * Math.PI * 2 + phase);
      pts.push([x, y]);
    }

    let d = `M${pts[0][0]} ${this.H + 30} L${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      d += ` Q${x0} ${y0} ${cx} ${cy}`;
    }
    d += ` L${pts[pts.length - 1][0]} ${this.H + 30} Z`;
    return d;
  }

  /**
   * Computes scroll progress:
   * progress = clamp(scrollY / (nationalSection.offsetTop - 0.15 * innerHeight), 0, 1)
   */
  private computeProgress(): number {
    if (!this.nationalSection) {
      this.nationalSection = this.root.querySelector<HTMLElement>('#national');
    }
    const end = this.nationalSection
      ? this.nationalSection.offsetTop - window.innerHeight * 0.15
      : document.documentElement.scrollHeight - window.innerHeight;

    const denominator = Math.max(end, 1);
    return Math.min(Math.max(window.scrollY / denominator, 0), 1);
  }

  private readonly BASE_OPACITY = 0.432; // 0.54 * 0.8 (20% dimmer than before)
  private morphShown = 0;

  private tick(timestamp: number): void {
    const targetProgress = this.computeProgress();

    if (this.prefersReducedMotion) {
      this.shownProgress = targetProgress;
    } else {
      this.shownProgress += (targetProgress - this.shownProgress) * 0.08;
    }

    const p = this.shownProgress;
    // Overfill slightly when nearly 100% so the country outline looks completely filled
    const level = this.H * (1 - p) - (p > 0.995 ? 40 : 0);
    const amp = this.prefersReducedMotion ? 0 : 18 * (1 - 0.6 * p);
    const phase = this.prefersReducedMotion ? 0 : timestamp / 900;

    if (this.frontWave) {
      this.frontWave.setAttribute(
        'd',
        this.generateWavePath(level, amp, this.W * 0.55, phase)
      );
    }

    if (this.backWave) {
      this.backWave.setAttribute(
        'd',
        this.generateWavePath(level - 10, amp * 1.2, this.W * 0.4, -phase * 1.3 + 1)
      );
    }

    // Scroll-driven morph transition & hand-off fade:
    // Progress: with nationalTop = the National section's top relative to the viewport,
    // t = clamp((0.95*innerHeight - nationalTop) / (0.95*innerHeight - 0.35*innerHeight), 0, 1)
    // Smooth the displayed value: shown += (t - shown) * 0.12 per frame.
    // Flat map: opacity = max(1 - shown*2.2, 0) * BASE_OPACITY
    if (this.layer && this.nationalSection) {
      const rect = this.nationalSection.getBoundingClientRect();
      const ih = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const skipMorph = isMobile || this.prefersReducedMotion;

      if (skipMorph) {
        // Below 768px or prefers-reduced-motion: skip the morph.
        // Show the flat map at normal opacity until National section is reached (0.95 * ih), then hide directly.
        const opacity = rect.top <= ih * 0.95 ? 0 : this.BASE_OPACITY;
        this.layer.style.opacity = opacity.toFixed(3);
      } else {
        const t = Math.min(Math.max((0.95 * ih - rect.top) / (0.60 * ih), 0), 1);
        this.morphShown += (t - this.morphShown) * 0.12;

        // After the National section (it is the last section) the flat map stays hidden.
        // Scrolling back up reverses everything smoothly.
        const isPast = rect.bottom < 0;
        const opacity = isPast ? 0 : Math.max(1 - this.morphShown * 2.2, 0) * this.BASE_OPACITY;
        this.layer.style.opacity = opacity.toFixed(3);
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.motionQuery) {
      this.motionQuery.removeEventListener('change', this.onMotionPreferenceChange);
      this.motionQuery = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    // tick() writes this every frame; clear it so nothing is left on the node.
    if (this.layer) this.layer.style.opacity = '';
    this.layer = null;
    this.frontWave = null;
    this.backWave = null;
    this.nationalSection = null;
  }
}
