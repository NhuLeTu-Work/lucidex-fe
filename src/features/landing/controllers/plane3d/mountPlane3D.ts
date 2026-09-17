// Paper plane that rides the flight path.
//
// The standalone project drew this with @react-three/fiber + drei. That stack
// cannot be installed here: @react-three/fiber@9 pins `react >=19 <19.3` while
// this app's `react: ^19.2.0` resolves to 19.3.0. Rather than constrain the
// app's React version, the same scene is built directly on three.js - the
// approach VietnamMap3DController already uses.
//
// Everything that affects the picture is matched to what R3F was configuring on
// our behalf: an alpha + antialiased renderer at dpr <= 2, sRGB output,
// ACES Filmic tone mapping (R3F's default - plain three.js defaults to none),
// a 24deg perspective camera at z 6.2 with three's default 0.1/1000 clipping,
// the same three lights, the same material override, the same group hierarchy
// and the same orientation maths. Rendering stays on demand.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL = '/landing/paper-plane.glb';
const FALLBACK_IMAGE_URL = '/landing/paper-plane.png';

const DEG2RAD = Math.PI / 180;
const BASE_TILT_X = -35 * DEG2RAD;
const BASE_TILT_Y = 15 * DEG2RAD;

export interface Plane3DController {
  updateOrientation(angleDeg: number, bankDeg: number, transformProgress: number, visible: boolean): void;
  setInViewport(visible: boolean): void;
  destroy(): void;
  readonly isFallback: boolean;
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/**
 * The .glb bytes, fetched once per page load.
 *
 * The file is cached rather than the parsed scene on purpose: parsing per mount
 * gives each mount geometries and materials it solely owns, so destroy() can
 * dispose all of them without leaving a later mount pointing at disposed GPU
 * buffers - the failure mode that drei's shared cache produced here.
 */
let modelBufferPromise: Promise<ArrayBuffer> | null = null;

function loadModelBuffer(): Promise<ArrayBuffer> {
  if (!modelBufferPromise) {
    modelBufferPromise = fetch(MODEL_URL).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${MODEL_URL}: ${res.status}`);
      return res.arrayBuffer();
    });
    // A failed fetch should not poison every later mount.
    modelBufferPromise.catch(() => {
      modelBufferPromise = null;
    });
  }
  return modelBufferPromise;
}

function disposeObject(obj: THREE.Object3D): void {
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

export function mountPlane3D(container: HTMLElement): Plane3DController {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let isFallback = !isWebGLAvailable();
  let isDestroyed = false;
  let rafId: number | null = null;
  let fallbackImg: HTMLImageElement | null = null;

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let flightGroup: THREE.Group | null = null;
  let bodyGroup: THREE.Group | null = null;
  let baseTiltGroup: THREE.Group | null = null;
  let planeModel: THREE.Group | null = null;
  let material: THREE.MeshPhysicalMaterial | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const clock = new THREE.Clock();
  let currentBank = 0;
  let currentRollBase = 0;

  const state = {
    angleDeg: 0,
    bankDeg: 0,
    transformProgress: 0,
  };

  function showFallback(): void {
    if (isDestroyed || fallbackImg) return;
    isFallback = true;
    const img = document.createElement('img');
    img.src = FALLBACK_IMAGE_URL;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'flight-plane-fallback';
    container.appendChild(img);
    fallbackImg = img;
  }

  function resize(): void {
    if (!renderer || !camera) return;
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }

  function setupScene(): void {
    // gl={{ alpha: true, antialias: true }}, dpr={[1, 2]}
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    scene = new THREE.Scene();

    // camera={{ position: [0, 0, 6.2], fov: 24 }} - 0.1/1000 are three's defaults
    camera = new THREE.PerspectiveCamera(24, 1, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    // Lighting: ambientLight 0.6, directionalLight 1.5 from top-left, soft blue pointLight #38BDF8 behind
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(-4, 6, 4);
    scene.add(directional);

    const point = new THREE.PointLight(0x38bdf8, 2.0, 8);
    point.position.set(0, 0, -2);
    scene.add(point);

    flightGroup = new THREE.Group();
    bodyGroup = new THREE.Group();
    baseTiltGroup = new THREE.Group();
    // Fixed 3/4 base tilt: rotation.x = -35 deg, rotation.y = 15 deg, applied before path heading
    baseTiltGroup.rotation.set(BASE_TILT_X, BASE_TILT_Y, 0);
    bodyGroup.add(baseTiltGroup);
    flightGroup.add(bodyGroup);
    scene.add(flightGroup);

    // Material override with MeshPhysicalMaterial as specified:
    // vertexColors: true, transmission: 0.6, thickness: 0.2, roughness: 0.08,
    // metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, side: DoubleSide, transparent: true.
    material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transmission: 0.6,
      thickness: 0.2,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
    });

    resize();
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(container);
    }

    loadModelBuffer()
      .then((buffer) => new Promise<THREE.Group>((resolve, reject) => {
        if (isDestroyed) {
          reject(new Error('destroyed'));
          return;
        }
        new GLTFLoader().parse(buffer.slice(0), '', (gltf) => resolve(gltf.scene), reject);
      }))
      .then((loadedScene) => {
        if (isDestroyed || !baseTiltGroup || !material) return;
        loadedScene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.material = material as THREE.Material;
          }
        });
        planeModel = loadedScene;
        baseTiltGroup.add(loadedScene);
        requestRender();
      })
      .catch((error) => {
        if (isDestroyed) return;
        console.warn('3D paper plane failed to load, using fallback image:', error);
        teardownScene();
        showFallback();
      });
  }

  function applyFrame(): void {
    if (!flightGroup || !bodyGroup || !baseTiltGroup) return;

    const { angleDeg, bankDeg, transformProgress } = state;

    if (prefersReducedMotion) {
      const angleRad = (angleDeg * Math.PI) / 180;
      flightGroup.rotation.z = -angleRad;
      bodyGroup.rotation.set(0, 0, 0);
      bodyGroup.position.set(0, 0, 0);
      baseTiltGroup.rotation.set(BASE_TILT_X, BASE_TILT_Y, 0);
      return;
    }

    // When transforming to digital credential, ease rotation/tilt to 0 so plane faces the camera
    const easeT = Math.min(1, transformProgress / 0.40);
    const activeMultiplier = 1 - easeT;

    // 1. Heading rotation: SVG screen y points down, Three.js y points up => rotation.z = -angle
    const angleRad = (angleDeg * Math.PI) / 180;
    flightGroup.rotation.z = -angleRad * activeMultiplier;

    // 2. Banking roll proportional to heading change, clamped to +/-20 deg
    const targetBank = (Math.max(-20, Math.min(20, bankDeg)) * DEG2RAD) * activeMultiplier;
    currentBank += (targetBank - currentBank) * 0.2;

    // 3. When plane heads left (angle between 90 and 270 deg), smoothly roll 180 deg around X axis
    const normalizedAngle = ((angleDeg % 360) + 360) % 360;
    const isHeadingLeft = normalizedAngle > 90 && normalizedAngle < 270;
    const targetRollBase = (isHeadingLeft ? Math.PI : 0) * activeMultiplier;
    currentRollBase += (targetRollBase - currentRollBase) * 0.15;

    const totalRollX = currentRollBase + currentBank;

    // 4. Subtle idle float
    const time = clock.getElapsedTime();
    const floatPhase = (time % 3) * (2 * Math.PI / 3);
    const floatY = Math.sin(floatPhase) * 0.05 * activeMultiplier;
    const pitchWobble = Math.sin(floatPhase * 1.2) * (3 * DEG2RAD) * activeMultiplier;

    bodyGroup.position.y = floatY;
    bodyGroup.rotation.x = totalRollX;
    bodyGroup.rotation.y = pitchWobble;

    baseTiltGroup.rotation.x = BASE_TILT_X * activeMultiplier;
    baseTiltGroup.rotation.y = BASE_TILT_Y * activeMultiplier;
  }

  // frameloop="demand": one frame per request, never a free-running loop.
  function requestRender(): void {
    if (isDestroyed || isFallback || rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (isDestroyed || !renderer || !scene || !camera) return;
      applyFrame();
      renderer.render(scene, camera);
    });
  }

  function teardownScene(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    resizeObserver?.disconnect();
    resizeObserver = null;

    if (planeModel) {
      planeModel.removeFromParent();
      disposeObject(planeModel);
      planeModel = null;
    }

    material?.dispose();
    material = null;

    scene?.clear();
    scene = null;
    flightGroup = null;
    bodyGroup = null;
    baseTiltGroup = null;
    camera = null;

    if (renderer) {
      renderer.domElement.remove();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }
  }

  if (isFallback) {
    showFallback();
  } else {
    setupScene();
  }

  return {
    get isFallback() {
      return isFallback;
    },
    updateOrientation(angleDeg: number, bankDeg: number, transformProgress: number) {
      if (isDestroyed || isFallback) return;
      state.angleDeg = angleDeg;
      state.bankDeg = bankDeg;
      state.transformProgress = transformProgress;
      requestRender();
    },
    setInViewport() {
      if (isDestroyed || isFallback) return;
      requestRender();
    },
    destroy() {
      isDestroyed = true;
      teardownScene();
      fallbackImg?.remove();
      fallbackImg = null;
    },
  };
}
