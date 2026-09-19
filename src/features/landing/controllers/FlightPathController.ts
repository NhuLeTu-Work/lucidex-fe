import { mountPlane3D } from './plane3d/mountPlane3D';
import type { Plane3DController } from './plane3d/mountPlane3D';
import { monotonicCatmullRomToBezier } from './geometry';
import type { PathSample, Point } from './geometry';

const VS_SOURCE = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * 0.5 + 0.5, 1.0 - (position.y * 0.5 + 0.5));
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision highp float; varying vec2 uv; uniform sampler2D tex;
uniform vec2 center; uniform float time; uniform float aspect; uniform float amp; uniform float speed;
void main(){
  vec2 d=uv-center; d.x*=aspect; float r=length(d);
  float front=time*0.62; float ring=r-front;
  float wave=sin(ring*speed*2.4)*exp(-abs(ring)*11.0)*exp(-time*0.55);
  float fall=smoothstep(0.0,0.035,r);
  vec2 dir=r>0.0001?normalize(d):vec2(0.0);
  vec2 off=dir*wave*amp*0.06*fall;
  vec2 s=uv+vec2(off.x/aspect,off.y);
  vec3 col=texture2D(tex,clamp(s,0.001,0.999)).rgb;
  col+=vec3(0.35,0.65,1.0)*max(wave,0.0)*1.5;
  float reveal=smoothstep(front+0.012,front-0.012,r);
  gl_FragColor=vec4(col*reveal,reveal);
}
`;

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Shader compilation failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program linking failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Owns the WebGL ripple reveal effect for the product demo video section
 */
class VideoRippleReveal {
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private frame: HTMLElement | null;
  private screenArea: HTMLElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private buffer: WebGLBuffer | null = null;
  private centerLoc: WebGLUniformLocation | null = null;
  private timeLoc: WebGLUniformLocation | null = null;
  private aspectLoc: WebGLUniformLocation | null = null;
  private ampLoc: WebGLUniformLocation | null = null;
  private speedLoc: WebGLUniformLocation | null = null;
  private texLoc: WebGLUniformLocation | null = null;

  private startTime = 0;
  private rafId: number | null = null;
  private isRunning = false;
  private isCompleted = false;
  private isInView = true;
  private isDestroyed = false;

  constructor(screenArea: HTMLElement) {
    this.screenArea = screenArea;
    this.canvas = screenArea.querySelector<HTMLCanvasElement>('#demo-ripple-canvas')!;
    this.video = screenArea.querySelector<HTMLVideoElement>('#demo-verify-video')!;
    this.frame = screenArea.closest<HTMLElement>('#demo-browser-frame');

    if (!this.canvas || !this.video) return;

    this.initGL();
  }

  private initGL(): void {
    try {
      this.gl = (this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true }) ||
        this.canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: true })) as WebGLRenderingContext | null;
    } catch {
      this.gl = null;
    }

    if (!this.gl) return;

    const gl = this.gl;
    this.program = createProgram(gl, VS_SOURCE, FS_SOURCE);
    if (!this.program) {
      this.gl = null;
      return;
    }

    this.centerLoc = gl.getUniformLocation(this.program, 'center');
    this.timeLoc = gl.getUniformLocation(this.program, 'time');
    this.aspectLoc = gl.getUniformLocation(this.program, 'aspect');
    this.ampLoc = gl.getUniformLocation(this.program, 'amp');
    this.speedLoc = gl.getUniformLocation(this.program, 'speed');
    this.texLoc = gl.getUniformLocation(this.program, 'tex');

    // Full-screen triangle covering [-1, 1] clip space
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Texture for video frames
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }

  public setInView(inView: boolean): void {
    this.isInView = inView;
    if (inView && this.isRunning && !this.isCompleted && this.rafId === null) {
      this.loop();
    }
  }

  public start(): void {
    if (this.isDestroyed) return;

    // Fallback: No WebGL support
    if (!this.gl || !this.program) {
      this.isCompleted = true;
      this.canvas.style.display = 'none';
      this.video.style.transition = 'opacity 0.5s ease';
      this.video.style.opacity = '1';
      this.video.play().catch(() => {});
      this.frame?.classList.add('is-active');
      return;
    }

    this.isRunning = true;
    this.isCompleted = false;
    this.canvas.style.display = 'block';
    this.video.style.opacity = '0';
    this.video.style.transition = '';

    // Play video and light up frame border (0.8s transition)
    this.video.play().catch(() => {});
    this.frame?.classList.add('is-active');

    this.startTime = performance.now();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.loop();
  }

  private loop = (): void => {
    if (this.isDestroyed || !this.isRunning || !this.gl || !this.program) return;

    if (!this.isInView) {
      this.rafId = null;
      return;
    }

    const elapsed = (performance.now() - this.startTime) / 1000;

    // After 2.6s: hide canvas, show plain video at opacity 1, stop render loop
    if (elapsed >= 2.6) {
      this.isRunning = false;
      this.isCompleted = true;
      this.rafId = null;
      this.canvas.style.display = 'none';
      this.video.style.opacity = '1';
      return;
    }

    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(this.screenArea.clientWidth * dpr);
    const h = Math.round(this.screenArea.clientHeight * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Upload current video frame to texture
    if (this.video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
    }

    gl.useProgram(this.program);
    gl.uniform2f(this.centerLoc, 0.5, 0.46);
    gl.uniform1f(this.timeLoc, elapsed);
    gl.uniform1f(this.aspectLoc, this.canvas.width / Math.max(1, this.canvas.height));
    gl.uniform1f(this.ampLoc, 1.0);
    gl.uniform1f(this.speedLoc, 12.0);
    gl.uniform1i(this.texLoc, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.rafId = requestAnimationFrame(this.loop);
  };

  public reset(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
    this.isCompleted = false;

    this.canvas.style.display = 'none';
    this.video.pause();
    this.video.currentTime = 0;
    this.video.style.opacity = '0';
    this.video.style.transition = '';
    this.frame?.classList.remove('is-active');
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.reset();

    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.program) this.gl.deleteProgram(this.program);
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.gl = null;
    }
    this.program = null;
    this.texture = null;
    this.buffer = null;
  }
}

/**
 * Controller for scroll-driven flight path connecting Section 3 -> 4 -> 5 -> 6 (Demo Video)
 * Features:
 * - Plane strictly anchored to viewport horizontal center line during Sections 3-5
 * - Binary search lookup table (~600 points) with monotonic Catmull-Rom spline
 * - Flying behind illustrations and text in sections 3-5 (z-index 1)
 * - Self-contained landing animation triggered at 60% section visibility (threshold 0.6)
 * - Path revealed stroke stops at browser frame top minus 40px and fades out over last 120px
 * - Layering: SVG path layer goes BELOW the browser frame (frame z-index 5, path z-index 1)
 * - Plane layer stays ABOVE the frame (z-index 10) during landing
 * - Triggers WebGL water ripple reveal on arrival
 */
export class FlightPathController {
  private wrapper: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private basePath: SVGPathElement | null = null;
  private revealPath: SVGPathElement | null = null;
  private plane: HTMLElement | null = null;
  private plane3D: Plane3DController | null = null;
  private maskLinear: SVGLinearGradientElement | null = null;
  private maskHole: SVGCircleElement | null = null;
  private maskStop1: SVGStopElement | null = null;
  private maskStop2: SVGStopElement | null = null;

  private totalLength = 0;
  private maxStrokeLength = 0;
  private lookupTable: PathSample[] = [];
  private currentHeadingDeg = 0;
  private currentPlaneLength = 0;
  private hasInitializedHeading = false;
  private isRafScheduled = false;
  private prefersReducedMotion = false;
  private debouncedResizeRaf: number | null = null;

  // Landing & Ripple Reveal state
  private rippleReveal: VideoRippleReveal | null = null;
  private landingState: 'scroll_driven' | 'animating' | 'holding' | 'revealed' = 'scroll_driven';
  private hasTriggeredLanding = false;
  private landingAnimRafId: number | null = null;
  private tapTimer: number | null = null;
  private sectionObserver: IntersectionObserver | null = null;

  // Teardown bookkeeping
  private readonly root: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private pendingLoadListeners: Array<() => void> = [];
  private isDestroyed = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.wrapper = root.querySelector<HTMLElement>('#roles-wrapper');
    this.overlay = root.querySelector<HTMLElement>('#flight-overlay');
    this.basePath = root.querySelector<SVGPathElement>('#flight-path-base');
    this.revealPath = root.querySelector<SVGPathElement>('#flight-path-reveal');
    this.plane = root.querySelector<HTMLElement>('#flight-plane');
    this.maskLinear = root.querySelector<SVGLinearGradientElement>('#flight-mask-linear');
    this.maskHole = root.querySelector<SVGCircleElement>('#flight-mask-hole');
    this.maskStop1 = root.querySelector<SVGStopElement>('#flight-mask-stop-1');
    this.maskStop2 = root.querySelector<SVGStopElement>('#flight-mask-stop-2');

    const screenArea = root.querySelector<HTMLElement>('#demo-screen-area');
    if (screenArea) {
      this.rippleReveal = new VideoRippleReveal(screenArea);
    }

    if (!this.wrapper || !this.overlay || !this.basePath || !this.revealPath || !this.plane) return;

    this.plane3D = mountPlane3D(this.plane);

    this.init();
  }

  private init(): void {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.updatePath();

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

    if (this.maskHole) this.maskHole.setAttribute('r', '0');

    // Show video immediately paused with native controls
    const video = this.root.querySelector<HTMLVideoElement>('#demo-verify-video');
    if (video) {
      video.style.opacity = '1';
      video.controls = true;
      video.pause();
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

    // Observe section visibility for landing handoff (FIX 1) and WebGL loop optimization
    const sec6 = this.root.querySelector<HTMLElement>('#nationwide');
    if (sec6 && 'IntersectionObserver' in window) {
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const ratio = entry.intersectionRatio;
            const isVis = entry.isIntersecting;

            this.rippleReveal?.setInView(isVis);

            // FIX 1: When the demo section becomes 60% visible, start self-contained animation
            if (isVis && ratio >= 0.6) {
              if (!this.hasTriggeredLanding && this.landingState === 'scroll_driven') {
                this.startSelfContainedLanding();
              }
            } else if (ratio < 0.25) {
              // If user scrolls back up so section is less than 25% visible, cancel and reset
              if (this.hasTriggeredLanding || this.landingState !== 'scroll_driven') {
                this.cancelAndResetLanding();
              }
            }
          });
        },
        { threshold: [0, 0.25, 0.6] }
      );
      this.sectionObserver.observe(sec6);
    }

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        this.onLayoutChange();
      });
      this.resizeObserver = ro;

      if (this.wrapper) ro.observe(this.wrapper);
      ro.observe(this.root);
      const illustrations = this.root.querySelectorAll('.role-illustration');
      illustrations.forEach((img) => ro.observe(img));
      const screenArea = this.root.querySelector('#demo-screen-area');
      if (screenArea) ro.observe(screenArea);
      const frameEl = this.root.querySelector('#demo-browser-frame');
      if (frameEl) ro.observe(frameEl);
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

    if (document.readyState === 'complete') {
      this.onLayoutChange();
    } else {
      window.addEventListener('load', this.onLayoutChange);
      this.pendingLoadListeners.push(() =>
        window.removeEventListener('load', this.onLayoutChange)
      );
    }

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        if (this.isDestroyed) return;
        this.onLayoutChange();
      });
    }

    const wraps = this.root.querySelectorAll('.role-image-wrap');
    wraps.forEach((wrap) => {
      wrap.addEventListener('transitionend', this.onLayoutChange, { once: true });
      this.pendingLoadListeners.push(() =>
        wrap.removeEventListener('transitionend', this.onLayoutChange)
      );
    });
  }

  private requestRender(): void {
    if (this.prefersReducedMotion || this.isDestroyed) return;
    if (!this.isRafScheduled) {
      this.isRafScheduled = true;
      this.rafId = requestAnimationFrame(this.onRafFrame);
    }
  }

  private onScroll = (): void => {
    // While self-contained landing animation or reveal is running, scrolling does NOT move plane
    if (this.landingState === 'scroll_driven') {
      this.requestRender();
    }
  };

  private onRafFrame = (): void => {
    this.isRafScheduled = false;
    this.rafId = null;
    if (this.isDestroyed) return;
    this.render();
  };

  /**
   * Build strictly monotonic downward flight path through illustration centers to demo video screen area
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
    const screenEl = this.root.querySelector<HTMLElement>('#demo-screen-area') || this.root.querySelector<HTMLElement>('#nationwide .demo-browser-frame') || this.root.querySelector<HTMLElement>('#nationwide');
    const frameEl = this.root.querySelector<HTMLElement>('#demo-browser-frame') || screenEl;

    if (!img1El || !img2El || !img3El || !screenEl || !frameEl) return;

    const r1 = img1El.getBoundingClientRect();
    const r2 = img2El.getBoundingClientRect();
    const r3 = img3El.getBoundingClientRect();
    const rScreen = screenEl.getBoundingClientRect();
    const rFrame = frameEl.getBoundingClientRect();

    const sec1 = this.root.querySelector<HTMLElement>('#issuer');
    const sec2 = this.root.querySelector<HTMLElement>('#owner');
    const sec3 = this.root.querySelector<HTMLElement>('#verifier');

    const s1Rect = sec1 ? sec1.getBoundingClientRect() : wrapperRect;
    const s2Rect = sec2 ? sec2.getBoundingClientRect() : wrapperRect;
    const s3Rect = sec3 ? sec3.getBoundingClientRect() : wrapperRect;

    const clampX = (x: number) => Math.max(24, Math.min(w - 24, x));

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    const getCenter = (r: DOMRect, el: HTMLElement) => {
      const wrap = el.closest('.role-image-wrap');
      const offset = wrap && !wrap.classList.contains('is-visible') ? -24 : 0;
      return {
        x: clampX(r.left + r.width * 0.5 - wrapperRect.left),
        y: r.top + r.height * 0.5 - wrapperRect.top + offset,
      };
    };

    const c1 = getCenter(r1, img1El);
    const c2 = getCenter(r2, img2El);
    const c3 = getCenter(r3, img3El);

    // End point: center of video screen area, at 46% of its height
    const cScreen = {
      x: clampX(rScreen.left + rScreen.width * 0.5 - wrapperRect.left),
      y: rScreen.top + rScreen.height * 0.46 - wrapperRect.top,
    };

    let waypoints: Point[] = [];

    if (isMobile) {
      const w0: Point = {
        x: clampX(w * 0.5 - w * 0.15),
        y: Math.max(0, s1Rect.top - wrapperRect.top),
      };
      const w1: Point = { x: c1.x, y: c1.y };
      const gap1Y = (s1Rect.bottom + s2Rect.top) * 0.5 - wrapperRect.top;
      const w2: Point = { x: clampX(w * 0.5 - w * 0.15), y: gap1Y };
      const w3: Point = { x: c2.x, y: c2.y };
      const gap2Y = (s2Rect.bottom + s3Rect.top) * 0.5 - wrapperRect.top;
      const w4: Point = { x: clampX(w * 0.5 + w * 0.15), y: gap2Y };
      const w5: Point = { x: c3.x, y: c3.y };
      const w6: Point = { x: cScreen.x, y: cScreen.y };

      waypoints = [w0, w1, w2, w3, w4, w5, w6];
    } else {
      const textCol1 = this.root.querySelector<HTMLElement>('#issuer .role-text-col');
      const t1Rect = textCol1 ? textCol1.getBoundingClientRect() : null;
      const startX = t1Rect ? t1Rect.left + t1Rect.width * 0.5 - wrapperRect.left : w * 0.28;
      const w0: Point = {
        x: clampX(startX),
        y: Math.max(0, s1Rect.top - wrapperRect.top),
      };
      const w1: Point = { x: c1.x, y: c1.y };
      const gap1Y = (s1Rect.bottom + s2Rect.top) * 0.5 - wrapperRect.top;
      const arc1X = isTablet ? w * 0.4 : w * 0.35;
      const w2: Point = { x: clampX(arc1X), y: gap1Y };
      const w3: Point = { x: c2.x, y: c2.y };
      const gap2Y = (s2Rect.bottom + s3Rect.top) * 0.5 - wrapperRect.top;
      const arc2X = isTablet ? w * 0.6 : w * 0.65;
      const w4: Point = { x: clampX(arc2X), y: gap2Y };
      const w5: Point = { x: c3.x, y: c3.y };
      const w6: Point = { x: cScreen.x, y: cScreen.y };

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

    // Lookup table of 600 points for smooth navigation
    this.lookupTable = [];
    const NUM_SAMPLES = 600;
    for (let i = 0; i < NUM_SAMPLES; i++) {
      const s = (i / (NUM_SAMPLES - 1)) * this.totalLength;
      const pt = this.revealPath.getPointAtLength(s);
      this.lookupTable.push({ s, x: pt.x, y: pt.y });
    }

    // FIX 2: Path's visible stroke must stop at the top edge of the browser frame minus 40px
    const frameTopY = rFrame.top - wrapperRect.top;
    const lineCutoffY = frameTopY - 40;
    const cutoffSample = this.getPointAtY(lineCutoffY);
    this.maxStrokeLength = cutoffSample.s;

    // Fade out over the last 120px ending at lineCutoffY
    const startY = waypoints[0].y;
    const visiblePathHeight = lineCutoffY - startY;

    if (this.maskLinear && this.maskStop1 && this.maskStop2 && visiblePathHeight > 0) {
      this.maskLinear.setAttribute('y1', startY.toFixed(1));
      this.maskLinear.setAttribute('y2', lineCutoffY.toFixed(1));

      const startFadeOffset = Math.min((0.15 * window.innerHeight) / visiblePathHeight, 0.3);
      const endFadeStartOffset = Math.max(0.4, (visiblePathHeight - 120) / visiblePathHeight);

      this.maskStop1.setAttribute('offset', `${(startFadeOffset * 100).toFixed(2)}%`);
      this.maskStop2.setAttribute('offset', `${(endFadeStartOffset * 100).toFixed(2)}%`);
    }

    // Initial revealed stroke update
    this.updateRevealedStroke(this.currentPlaneLength);
  }

  /**
   * Updates revealed path stroke length, strictly capped at maxStrokeLength (frame top - 40px)
   */
  private updateRevealedStroke(planeLength: number): void {
    if (!this.revealPath || this.totalLength <= 0) return;
    const visibleLength = Math.min(planeLength, this.maxStrokeLength);
    this.revealPath.style.strokeDashoffset = `${Math.max(0, this.totalLength - visibleLength)}`;
  }

  /**
   * Helper: Binary search lookup table for targetY
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
      s: pA.s + tY * (pB.s - pA.s),
    };
  }

  /**
   * FIX 1: Self-contained landing animation triggered when demo section is 60% visible
   * Runs over 1100ms with easeInOutCubic independent of scrolling
   */
  private startSelfContainedLanding(): void {
    if (this.isDestroyed || this.landingState !== 'scroll_driven') return;

    this.hasTriggeredLanding = true;
    this.landingState = 'animating';

    // Record plane's current path length s0 and angle
    const s0 = this.currentPlaneLength;
    const sTarget = this.totalLength;
    const startTime = performance.now();
    const duration = 1100; // 1100ms

    if (this.landingAnimRafId !== null) {
      cancelAnimationFrame(this.landingAnimRafId);
      this.landingAnimRafId = null;
    }

    const step = (now: number) => {
      if (this.isDestroyed || this.landingState !== 'animating') return;

      const elapsed = now - startTime;
      const p = Math.min(1, Math.max(0, elapsed / duration));
      const easedP = easeInOutCubic(p);

      const currentS = s0 + (sTarget - s0) * easedP;
      this.currentPlaneLength = currentS;

      const pt = this.revealPath ? this.revealPath.getPointAtLength(currentS) : { x: 0, y: 0 };
      const remDist = Math.max(0, sTarget - currentS);

      // Tangent angle from path
      const sampleBehind = Math.max(0, currentS - 4);
      const sampleAhead = Math.min(this.totalLength, currentS + 4);
      const ptB = this.revealPath ? this.revealPath.getPointAtLength(sampleBehind) : pt;
      const ptA = this.revealPath ? this.revealPath.getPointAtLength(sampleAhead) : pt;
      const pathTangentDeg = Math.atan2(ptA.y - ptB.y, ptA.x - ptB.x) * (180 / Math.PI);

      // Over the last 160px of path length, ease rotation toward -8° so it comes in level
      let easeApproach = 0;
      let targetHeadingDeg = pathTangentDeg;
      if (remDist <= 160) {
        const approachProgress = Math.max(0, (160 - remDist) / 160);
        easeApproach = approachProgress * (2 - approachProgress);

        let diff = -8 - pathTangentDeg;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        targetHeadingDeg = pathTangentDeg + diff * easeApproach;
      }

      let angleDiff = targetHeadingDeg - this.currentHeadingDeg;
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;
      this.currentHeadingDeg += angleDiff * 0.3;

      const bankDeg =
        Math.max(-20, Math.min(20, (targetHeadingDeg - this.currentHeadingDeg) * 1.5)) *
        (1 - easeApproach);

      if (this.plane) {
        this.plane.classList.add('is-landing');
        this.plane.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }

      if (this.plane3D && !this.plane3D.isFallback) {
        this.plane3D.updateOrientation(this.currentHeadingDeg, bankDeg, easeApproach);
      }

      // Stroke reveals up to frameTop - 40px
      this.updateRevealedStroke(currentS);

      if (this.maskHole) {
        if (remDist < 5) {
          this.maskHole.setAttribute('r', '0');
        } else {
          this.maskHole.setAttribute('cx', pt.x.toFixed(1));
          this.maskHole.setAttribute('cy', pt.y.toFixed(1));
          this.maskHole.setAttribute('r', '70');
        }
      }

      if (p < 1) {
        this.landingAnimRafId = requestAnimationFrame(step);
      } else {
        // Arrival: hold 380ms, fade plane out, then start ripple
        this.landingAnimRafId = null;
        this.landingState = 'holding';
        if (this.plane3D && !this.plane3D.isFallback) {
          this.plane3D.updateOrientation(-8, 0, 1);
        }

        this.tapTimer = window.setTimeout(() => {
          this.tapTimer = null;
          if (this.landingState === 'holding') {
            this.landingState = 'revealed';
            if (this.plane) {
              this.plane.style.transition = 'opacity 0.25s ease';
              this.plane.style.opacity = '0';
            }
            this.rippleReveal?.start();
          }
        }, 380);
      }
    };

    this.landingAnimRafId = requestAnimationFrame(step);
  }

  /**
   * Cancels self-contained landing and resets plane to scroll-driven mode
   * Triggered when scrolling back up so section is less than 25% visible
   */
  private cancelAndResetLanding(): void {
    if (this.landingAnimRafId !== null) {
      cancelAnimationFrame(this.landingAnimRafId);
      this.landingAnimRafId = null;
    }
    if (this.tapTimer !== null) {
      window.clearTimeout(this.tapTimer);
      this.tapTimer = null;
    }

    this.landingState = 'scroll_driven';
    this.hasTriggeredLanding = false;

    if (this.plane) {
      this.plane.classList.remove('is-landing');
      this.plane.style.transition = '';
      this.plane.style.opacity = '1';
    }

    this.rippleReveal?.reset();
    this.requestRender();
  }

  /**
   * Scroll-driven render frame for Sections 3–5.
   * When self-contained landing animation runs, scroll does not move plane.
   */
  private render(): void {
    if (
      !this.wrapper ||
      !this.revealPath ||
      !this.plane ||
      this.lookupTable.length < 2 ||
      this.totalLength <= 0
    ) {
      return;
    }

    // While self-contained landing animation or reveal runs, scrolling must NOT move plane
    if (this.landingState !== 'scroll_driven') {
      return;
    }

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const wrapperTopInDoc = wrapperRect.top + window.scrollY;

    const targetY = window.scrollY + window.innerHeight * 0.5 - wrapperTopInDoc;
    const currentPt = this.getPointAtY(targetY);
    const planeX = currentPt.x;
    const planeY = currentPt.y;
    const planeLength = currentPt.s;
    this.currentPlaneLength = planeLength;

    // Tangent heading angle from path
    const sampleDistBehind = Math.max(0, planeLength - 4);
    const sampleDistAhead = Math.min(this.totalLength, planeLength + 4);
    const ptB = this.revealPath.getPointAtLength(sampleDistBehind);
    const ptA = this.revealPath.getPointAtLength(sampleDistAhead);

    const dx = ptA.x - ptB.x;
    const dy = ptA.y - ptB.y;
    const pathHeadingDeg = Math.atan2(dy, dx) * (180 / Math.PI);

    if (!this.hasInitializedHeading) {
      this.currentHeadingDeg = pathHeadingDeg;
      this.hasInitializedHeading = true;
    } else {
      let angleDiff = pathHeadingDeg - this.currentHeadingDeg;
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;
      this.currentHeadingDeg += angleDiff * 0.25;
    }

    const bankDeg = Math.max(
      -20,
      Math.min(20, (pathHeadingDeg - this.currentHeadingDeg) * 1.5)
    );

    // Plane is scroll-driven in sections 3-5
    this.plane.classList.remove('is-landing');
    this.plane.style.transform = `translate3d(${planeX.toFixed(1)}px, ${planeY.toFixed(1)}px, 0) translate(-50%, -50%)`;

    if (this.plane3D && !this.plane3D.isFallback) {
      this.plane3D.updateOrientation(this.currentHeadingDeg, bankDeg, 0);
    }

    // Update stroke reveal strictly stopping at frame top - 40px
    this.updateRevealedStroke(planeLength);

    // Radial hole in SVG mask
    if (this.maskHole) {
      this.maskHole.setAttribute('cx', planeX.toFixed(1));
      this.maskHole.setAttribute('cy', planeY.toFixed(1));
      this.maskHole.setAttribute('r', '70');
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
    if (this.landingAnimRafId !== null) {
      cancelAnimationFrame(this.landingAnimRafId);
      this.landingAnimRafId = null;
    }
    if (this.tapTimer !== null) {
      window.clearTimeout(this.tapTimer);
      this.tapTimer = null;
    }
    this.isRafScheduled = false;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;

    this.rippleReveal?.destroy();
    this.rippleReveal = null;

    this.plane3D?.destroy();
    this.plane3D = null;

    this.lookupTable = [];
  }
}
