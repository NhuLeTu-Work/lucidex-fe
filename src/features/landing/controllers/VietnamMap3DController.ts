// ============================================================================
// Lucidex - Feature 2: Interactive 3D Vietnam Relief Map (National Section)
// ============================================================================
// Ported from the standalone project's VietnamMap3D.ts. The rendering, camera,
// lighting and interaction are unchanged. What differs: lookups are scoped to
// the landing root, the pointer/keyboard handlers are named so they can be
// removed, and destroy() now also releases the reduced-motion listener, the
// loaded GLTF scene and the WebGL context - without that, every visit to the
// route leaked a context and the browser caps those at ~16.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VIETNAM_MAP_ANCHORS } from '../data/vietnamMapAnchors';

export class VietnamMap3DController {
  private stage: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private nationalSection: HTMLElement | null = null;
  private resetBtn: HTMLElement | null = null;
  private hintText: HTMLElement | null = null;

  private pins: {
    ct: HTMLElement | null;
    hs: HTMLElement | null;
    ts: HTMLElement | null;
  } = { ct: null, hs: null, ts: null };

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private pivot: THREE.Group | null = null;
  private tiltGroup: THREE.Group | null = null;
  private glowMesh: THREE.Mesh | null = null;
  private glowTexture: THREE.CanvasTexture | null = null;

  private anchorObjects: Record<string, THREE.Object3D> = {};
  private tempVec = new THREE.Vector3();

  // Rotation and interaction state
  private readonly DEF_YAW = -7;
  private readonly DEF_TILT = 30;

  private yaw = this.DEF_YAW;
  private tilt = this.DEF_TILT;
  private yawShown = this.DEF_YAW;
  private tiltShown = 0; // Starts face-on top-down (0°) and tilts to 30°
  private userTiltDelta = 0;
  private shown = 0;

  private vy = 0;
  private vt = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private mx = 0;
  private my = 0;

  private isSectionNear = false;
  private needsRender = false;
  private isModelLoaded = false;
  private isModelLoading = false;
  private rafId: number | null = null;
  private prefersReducedMotion = false;

  private motionQuery: MediaQueryList | null = null;
  private modelScene: THREE.Group | null = null;
  private visibilityObserver: IntersectionObserver | null = null;
  private loadObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(root: HTMLElement) {
    this.stage = root.querySelector<HTMLElement>('#stage');
    this.nationalSection = root.querySelector<HTMLElement>('#national');
    this.resetBtn = root.querySelector<HTMLElement>('#national-reset-btn');
    this.hintText = root.querySelector<HTMLElement>('#national-hint-text');

    this.pins.ct = root.querySelector<HTMLElement>('#pinCT');
    this.pins.hs = root.querySelector<HTMLElement>('#pinHS');
    this.pins.ts = root.querySelector<HTMLElement>('#pinTS');

    if (!this.stage || !this.nationalSection) {
      return;
    }

    // The canvas is created here rather than rendered by React on purpose.
    // destroy() calls forceContextLoss() to hand the WebGL context back, and a
    // canvas that has had its context force-lost can never get another one - so
    // reusing a React-owned node would break the next mount. (React's
    // StrictMode double-invoke in development is exactly that case.) Owning the
    // element means every mount starts from a clean canvas.
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'national-three';
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      '3D relief map of Vietnam including the Hoang Sa and Truong Sa archipelagos'
    );
    this.stage.prepend(this.canvas);

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  private init(): void {
    // Reduced motion listener
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);

    // Touch device hint adjustment
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch && this.hintText) {
      this.hintText.textContent = 'Swipe sideways to rotate';
    }

    // Initialize Three.js Scene, Camera, Lights, and Radial Glow
    this.setupScene();

    // Setup User Controls (Pointer, Keyboard, Reset)
    this.setupControls();

    // Intersection Observers for Lazy Loading and Conditional Rendering
    this.setupObservers();

    // Scroll listener for render-on-demand
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private setupScene(): void {
    if (!this.canvas || !this.stage) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    // Cap pixel ratio at 1.5 for this scene
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();

    // Perspective camera, FOV 30 looking at (0, 0, 0)
    const initialAspect = (this.stage.clientWidth || 1) / (this.stage.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(30, initialAspect, 0.01, 30);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xcfe8ff, 0x0a1a3a, 0.9);
    this.scene.add(hemiLight);

    // White directional key light from upper north-west
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(-1.2, 2.0, -0.8);
    this.scene.add(sunLight);

    // Blue rim light from south-east
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(1.5, 0.4, 1.5);
    this.scene.add(rimLight);

    // Group hierarchy: pivot -> tiltGroup -> [glow, model, anchors]
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    this.tiltGroup = new THREE.Group();
    this.pivot.add(this.tiltGroup);

    // Soft radial blue glow plane under the map (1.0 x 1.0, 35% -> 0% opacity, depthWrite: false)
    this.glowTexture = this.createGlowTexture();
    const glowGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const glowMat = new THREE.MeshBasicMaterial({
      map: this.glowTexture,
      transparent: true,
      depthWrite: false
    });
    this.glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.glowMesh.rotation.x = -Math.PI / 2;
    this.glowMesh.position.y = -0.004;
    this.tiltGroup.add(this.glowMesh);

    this.updateSize();
  }

  private createGlowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  private loadModel(): void {
    if (this.isModelLoaded || this.isModelLoading || !this.tiltGroup) return;
    this.isModelLoading = true;

    const loader = new GLTFLoader();
    loader.load(
      '/landing/models/vietnam-relief-light.glb',
      (gltf) => {
        gltf.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.roughness = 0.8;
              mat.metalness = 0;
              if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
              }
            }
          }
        });

        // Center the model on its bounding box (X and Z)
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x, 0, -center.z);

        this.tiltGroup?.add(gltf.scene);
        this.modelScene = gltf.scene;

        // Model-space anchor positions from vietnam-map-anchors.json
        const anchorsMap: Record<string, [number, number, number]> = {
          ct: VIETNAM_MAP_ANCHORS.canTho as [number, number, number],
          hs: VIETNAM_MAP_ANCHORS.hoangSa as [number, number, number],
          ts: VIETNAM_MAP_ANCHORS.truongSa as [number, number, number]
        };

        for (const [key, pos] of Object.entries(anchorsMap)) {
          const anchorObj = new THREE.Object3D();
          // Apply exact same centering offset to the anchor positions
          anchorObj.position.set(pos[0] - center.x, pos[1], pos[2] - center.z);
          this.tiltGroup?.add(anchorObj);
          this.anchorObjects[key] = anchorObj;
        }

        this.isModelLoaded = true;
        this.isModelLoading = false;
        this.requestRender();
      },
      undefined,
      (error) => {
        console.error('Error loading Vietnam 3D relief model:', error);
        this.isModelLoading = false;
      }
    );
  }

  private onMotionPreferenceChange = (e: MediaQueryListEvent): void => {
    this.prefersReducedMotion = e.matches;
    if (this.prefersReducedMotion) {
      this.vy = 0;
      this.vt = 0;
    }
    this.requestRender();
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.vy = 0;
    this.vt = 0;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastTime = performance.now();
    this.canvas?.setPointerCapture(e.pointerId);
    this.canvas?.classList.add('dragging');
    this.requestRender();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.stage) return;
    const rect = this.stage.getBoundingClientRect();
    this.mx = (e.clientX - rect.left) / rect.width - 0.5;
    this.my = (e.clientY - rect.top) / rect.height - 0.5;

    if (!this.dragging) {
      this.requestRender();
      return;
    }

    const now = performance.now();
    const dt = Math.max(now - this.lastTime, 1);
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;

    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastTime = now;

    // Horizontal swipe rotates yaw freely (0.45 deg/px)
    // Touch devices: horizontal swipe rotates yaw only; vertical swipe scrolls page
    const dyaw = dx * 0.45;
    const dtilt = e.pointerType === 'touch' ? 0 : dy * 0.3;

    this.yaw += dyaw;
    this.userTiltDelta = Math.min(Math.max(this.userTiltDelta + dtilt, -30), 50);

    if (!this.prefersReducedMotion) {
      this.vy = (dyaw / dt) * 16;
      this.vt = (dtilt / dt) * 16;
    }
    this.requestRender();
  };

  private onEndDrag = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.canvas?.classList.remove('dragging');
    this.requestRender();
  };

  private onStagePointerLeave = (): void => {
    if (!this.dragging) {
      this.mx = 0;
      this.my = 0;
      this.requestRender();
    }
  };

  private onDoubleClick = (): void => {
    this.resetView();
  };

  private onResetClick = (): void => {
    this.resetView();
  };

  private onCanvasKeyDown = (e: KeyboardEvent): void => {
    const keyMap: Record<string, [number, number]> = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -5],
      ArrowDown: [0, 5]
    };

    const delta = keyMap[e.key];
    if (delta) {
      e.preventDefault();
      this.yaw += delta[0];
      this.userTiltDelta = Math.min(Math.max(this.userTiltDelta + delta[1], -30), 50);
      this.vy = 0;
      this.vt = 0;
      this.requestRender();
    }

    if (e.key === 'r' || e.key === 'R') {
      this.resetView();
    }
  };

  private setupControls(): void {
    if (!this.canvas || !this.stage) return;

    // Pointer Drag
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onEndDrag);
    this.canvas.addEventListener('pointercancel', this.onEndDrag);
    this.stage.addEventListener('pointerleave', this.onStagePointerLeave);

    // Double click to reset
    this.canvas.addEventListener('dblclick', this.onDoubleClick);

    // Reset button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', this.onResetClick);
    }

    // Keyboard navigation
    this.canvas.addEventListener('keydown', this.onCanvasKeyDown);
  }

  private clampTilt(v: number): number {
    return Math.min(Math.max(v, 0), 80);
  }

  public resetView(): void {
    this.yaw = this.DEF_YAW;
    this.userTiltDelta = 0;
    this.vy = 0;
    this.vt = 0;
    this.requestRender();
  }

  private setupObservers(): void {
    if (!this.stage || !this.nationalSection) return;

    // Run loop only while National section is within 200px of viewport
    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        const isNear = entries[0].isIntersecting;
        this.isSectionNear = isNear;
        if (isNear) {
          this.requestRender();
        } else {
          this.stopLoop();
        }
      },
      { rootMargin: '200px' }
    );
    this.visibilityObserver.observe(this.nationalSection);

    // Load GLB lazily when section is about 1 viewport away
    this.loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.loadModel();
          if (this.loadObserver && this.nationalSection) {
            this.loadObserver.unobserve(this.nationalSection);
            this.loadObserver.disconnect();
            this.loadObserver = null;
          }
        }
      },
      { rootMargin: '100% 0px' }
    );
    this.loadObserver.observe(this.nationalSection);

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSize();
    });
    this.resizeObserver.observe(this.stage);
  }

  private updateSize(): void {
    if (!this.stage || !this.renderer || !this.camera) return;
    const w = this.stage.clientWidth;
    const h = this.stage.clientHeight;
    if (w === 0 || h === 0) return;

    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  private startLoop = (): void => {
    if (this.rafId === null && this.isSectionNear) {
      this.rafId = requestAnimationFrame(this.render);
    }
  };

  private stopLoop = (): void => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  private requestRender = (): void => {
    this.needsRender = true;
    this.startLoop();
  };

  private onScroll = (): void => {
    if (this.isSectionNear) {
      this.requestRender();
    }
  };

  private render = (): void => {
    this.rafId = null;

    if (!this.isSectionNear || !this.renderer || !this.scene || !this.camera || !this.pivot || !this.nationalSection) {
      return;
    }

    const rect = this.nationalSection.getBoundingClientRect();
    const ih = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const skipMorph = isMobile || this.prefersReducedMotion;

    let t = 0;
    if (skipMorph) {
      // Below 768px or prefers-reduced-motion: skip the morph.
      // Directly show 3D map at default view once National section is reached (0.95 * ih)
      t = rect.top <= ih * 0.95 ? 1 : 0;
      this.shown = t;
    } else {
      // Progress: with nationalTop = the National section's top relative to the viewport,
      // t = clamp((0.95*innerHeight - nationalTop) / (0.95*innerHeight - 0.35*innerHeight), 0, 1)
      t = Math.min(Math.max((0.95 * ih - rect.top) / (0.60 * ih), 0), 1);
      this.shown += (t - this.shown) * 0.12;
    }

    // Smoothstep: e = shown*shown*(3 - 2*shown)
    const e = skipMorph ? t : this.shown * this.shown * (3 - 2 * this.shown);

    // Inertia decay after release
    let hasInertia = false;
    if (!this.dragging && !this.prefersReducedMotion && (Math.abs(this.vy) > 0.01 || Math.abs(this.vt) > 0.01)) {
      this.yaw += this.vy;
      this.userTiltDelta = Math.min(Math.max(this.userTiltDelta + this.vt, -30), 50);
      this.vy *= 0.93;
      this.vt *= 0.93;
      hasInertia = Math.abs(this.vy) > 0.01 || Math.abs(this.vt) > 0.01;
    }

    // Camera tilt: 0° + 30° * e (measured from straight top-down; at t=0 seen face-on, at t=1 default view)
    const baseTilt = skipMorph ? this.DEF_TILT : (30 * e);
    this.tilt = this.clampTilt(baseTilt + this.userTiltDelta);

    // Smooth displayed values (lerp 0.35 dragging, 0.12 otherwise)
    const lerpFactor = this.prefersReducedMotion ? 1 : (this.dragging ? 0.35 : 0.12);
    const prevYawShown = this.yawShown;
    const prevTiltShown = this.tiltShown;
    this.yawShown += (this.yaw - this.yawShown) * lerpFactor;
    this.tiltShown += (this.tilt - this.tiltShown) * lerpFactor;

    const isAngleMoving = Math.abs(this.yawShown - prevYawShown) > 0.005 || Math.abs(this.tiltShown - prevTiltShown) > 0.005;
    const isMorphMoving = !skipMorph && Math.abs(t - this.shown) > 0.0005;

    // 3D map terrain relief height: scale.y = max(e, 0.001)
    // At t=0 completely flat to match 2D outline silhouette; terrain grows out as user scrolls
    if (this.modelScene) {
      this.modelScene.scale.set(1, Math.max(e, 0.001), 1);
    }

    // Camera distance formula with tilt from straight top-down
    const polar = THREE.MathUtils.degToRad(Math.max(this.tiltShown, 0.001));
    const dist = 2.3 * Math.max(1, 0.85 / this.camera.aspect);
    this.camera.position.set(0, Math.cos(polar) * dist, Math.sin(polar) * dist);
    this.camera.lookAt(0, 0, 0);

    // Canvas opacity = min(shown * 2.4, 1)
    if (this.canvas) {
      const canvasOpacity = skipMorph ? (t > 0 ? 1 : 0) : Math.min(this.shown * 2.4, 1);
      this.canvas.style.opacity = canvasOpacity.toFixed(3);
    }

    // Pins: stay hidden until shown > 0.55
    const showPins = this.isModelLoaded && (skipMorph ? t > 0 : this.shown > 0.55);
    Object.values(this.pins).forEach((pin) => {
      if (pin) pin.classList.toggle('is-visible', showPins);
    });

    const parallax = (this.dragging || this.prefersReducedMotion) ? 0 : 1;
    this.pivot.rotation.y = THREE.MathUtils.degToRad(this.yawShown) + this.mx * 0.15 * parallax;
    this.pivot.rotation.x = this.my * 0.05 * parallax;
    this.pivot.position.y = 0;
    this.pivot.scale.setScalar(1.25);

    this.renderer.render(this.scene, this.camera);

    // Project 3D anchors to 2D HTML pins
    if (this.stage && this.isModelLoaded) {
      const stageW = this.stage.clientWidth;
      const stageH = this.stage.clientHeight;

      for (const [key, obj] of Object.entries(this.anchorObjects)) {
        const pinEl = this.pins[key as keyof typeof this.pins];
        if (pinEl && obj) {
          obj.getWorldPosition(this.tempVec);
          this.tempVec.project(this.camera);

          const px = (this.tempVec.x * 0.5 + 0.5) * stageW;
          const py = (-this.tempVec.y * 0.5 + 0.5) * stageH;
          pinEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
        }
      }
    }

    // Render-on-demand: continue animation loop only while values are still updating
    if (isMorphMoving || isAngleMoving || hasInertia || this.dragging || this.needsRender) {
      this.needsRender = false;
      this.startLoop();
    }
  };

  private static disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!material) return;
        const record = material as unknown as Record<string, unknown>;
        Object.keys(record).forEach((key) => {
          const value = record[key];
          if (value && (value as THREE.Texture).isTexture) {
            (value as THREE.Texture).dispose();
          }
        });
        material.dispose();
      });
    });
  }

  public destroy(): void {
    this.stopLoop();
    window.removeEventListener('scroll', this.onScroll);

    if (this.motionQuery) {
      this.motionQuery.removeEventListener('change', this.onMotionPreferenceChange);
      this.motionQuery = null;
    }

    this.canvas?.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas?.removeEventListener('pointermove', this.onPointerMove);
    this.canvas?.removeEventListener('pointerup', this.onEndDrag);
    this.canvas?.removeEventListener('pointercancel', this.onEndDrag);
    this.canvas?.removeEventListener('dblclick', this.onDoubleClick);
    this.canvas?.removeEventListener('keydown', this.onCanvasKeyDown);
    this.stage?.removeEventListener('pointerleave', this.onStagePointerLeave);
    this.resetBtn?.removeEventListener('click', this.onResetClick);

    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
      this.visibilityObserver = null;
    }

    if (this.loadObserver) {
      this.loadObserver.disconnect();
      this.loadObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.glowMesh) {
      this.glowMesh.geometry.dispose();
      (this.glowMesh.material as THREE.Material).dispose();
      this.glowMesh = null;
    }

    if (this.glowTexture) {
      this.glowTexture.dispose();
      this.glowTexture = null;
    }

    // The relief model is the bulk of the GPU memory here and the standalone
    // version never released it.
    if (this.modelScene) {
      this.modelScene.removeFromParent();
      VietnamMap3DController.disposeObject(this.modelScene);
      this.modelScene = null;
    }
    this.anchorObjects = {};

    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    this.pivot = null;
    this.tiltGroup = null;

    if (this.renderer) {
      this.renderer.dispose();
      // dispose() alone leaves the context alive; browsers only allow ~16, so
      // revisiting this route would eventually start evicting them.
      this.renderer.forceContextLoss();
      this.renderer = null;
    }

    // Owned by this controller, and unusable once the context was force-lost.
    this.canvas?.remove();

    // Written every frame while the map is visible.
    Object.values(this.pins).forEach((pin) => {
      if (!pin) return;
      pin.style.transform = '';
      pin.classList.remove('is-visible');
    });

    this.isModelLoaded = false;
    this.isModelLoading = false;
    this.stage = null;
    this.canvas = null;
    this.nationalSection = null;
    this.resetBtn = null;
    this.hintText = null;
    this.pins = { ct: null, hs: null, ts: null };
  }
}
