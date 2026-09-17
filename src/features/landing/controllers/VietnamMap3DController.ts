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
  private tiltShown = this.DEF_TILT;

  private vy = 0;
  private vt = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private mx = 0;
  private my = 0;

  private isVisible = false;
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
    this.canvas = root.querySelector<HTMLCanvasElement>('#national-three');
    this.nationalSection = root.querySelector<HTMLElement>('#national');
    this.resetBtn = root.querySelector<HTMLElement>('#national-reset-btn');
    this.hintText = root.querySelector<HTMLElement>('#national-hint-text');

    this.pins.ct = root.querySelector<HTMLElement>('#pinCT');
    this.pins.hs = root.querySelector<HTMLElement>('#pinHS');
    this.pins.ts = root.querySelector<HTMLElement>('#pinTS');

    if (!this.stage || !this.canvas || !this.nationalSection) {
      return;
    }

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

    // Start render loop
    this.render = this.render.bind(this);
    this.rafId = requestAnimationFrame(this.render);
  }

  private setupScene(): void {
    if (!this.canvas || !this.stage) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

        // Fade in HTML pins after model loads
        Object.values(this.pins).forEach((pin) => {
          if (pin) pin.classList.add('is-visible');
        });
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
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.stage) return;
    const rect = this.stage.getBoundingClientRect();
    this.mx = (e.clientX - rect.left) / rect.width - 0.5;
    this.my = (e.clientY - rect.top) / rect.height - 0.5;

    if (!this.dragging) return;

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
    this.tilt = this.clampTilt(this.tilt + dtilt);

    if (!this.prefersReducedMotion) {
      this.vy = (dyaw / dt) * 16;
      this.vt = (dtilt / dt) * 16;
    }
  };

  private onEndDrag = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.canvas?.classList.remove('dragging');
  };

  private onStagePointerLeave = (): void => {
    if (!this.dragging) {
      this.mx = 0;
      this.my = 0;
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
      this.tilt = this.clampTilt(this.tilt + delta[1]);
      this.vy = 0;
      this.vt = 0;
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
    this.tilt = this.DEF_TILT;
    this.vy = 0;
    this.vt = 0;
  }

  private setupObservers(): void {
    if (!this.stage || !this.nationalSection) return;

    // Render only while section is within 200px of viewport
    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
      },
      { rootMargin: '200px' }
    );
    this.visibilityObserver.observe(this.stage);

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
  }

  private render(t: number): void {
    this.rafId = requestAnimationFrame(this.render);

    if (!this.isVisible || !this.renderer || !this.scene || !this.camera || !this.pivot) {
      return;
    }

    // Inertia decay after release
    if (!this.dragging && !this.prefersReducedMotion && (Math.abs(this.vy) > 0.01 || Math.abs(this.vt) > 0.01)) {
      this.yaw += this.vy;
      this.tilt = this.clampTilt(this.tilt + this.vt);
      this.vy *= 0.93;
      this.vt *= 0.93;
    }

    // Smooth displayed values (lerp 0.35 dragging, 0.12 otherwise)
    const lerpFactor = this.prefersReducedMotion ? 1 : (this.dragging ? 0.35 : 0.12);
    this.yawShown += (this.yaw - this.yawShown) * lerpFactor;
    this.tiltShown += (this.tilt - this.tiltShown) * lerpFactor;

    // Camera distance formula: 2.3 * max(1, 0.85 / aspect) so whole country including both archipelagos fits
    const polar = THREE.MathUtils.degToRad(this.tiltShown);
    const dist = 2.3 * Math.max(1, 0.85 / this.camera.aspect);
    this.camera.position.set(0, Math.cos(polar) * dist, Math.sin(polar) * dist);
    this.camera.lookAt(0, 0, 0);

    // Entrance animation progress based on section scroll
    let enter = 1;
    if (this.nationalSection) {
      const rect = this.nationalSection.getBoundingClientRect();
      enter = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1);
    }

    const parallax = (this.dragging || this.prefersReducedMotion) ? 0 : 1;

    // Idle motion & entrance ease
    const extraYaw = this.prefersReducedMotion ? 0 : (1 - enter) * 0.6;
    this.pivot.rotation.y = THREE.MathUtils.degToRad(this.yawShown) + extraYaw + this.mx * 0.15 * parallax;
    this.pivot.rotation.x = this.my * 0.05 * parallax;
    this.pivot.position.y = this.prefersReducedMotion ? 0 : Math.sin(t / 1400) * 0.012;

    const scaleVal = (this.prefersReducedMotion ? 1.0 : (0.85 + 0.15 * enter)) * 1.25;
    this.pivot.scale.setScalar(scaleVal);

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
  }

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
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

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
