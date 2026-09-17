// Ported from the standalone project's vietnam-map-anchors.json. It is a .ts
// module here because this repo's tsconfig does not enable resolveJsonModule.
//
// model space of vietnam-relief-light.glb (before any centering); +Y up, north = -Z
export const VIETNAM_MAP_ANCHORS = {
  canTho: [-0.1971785063752274, 0.022, 0.3492865812542146],
  hoangSa: [0.1722723099936558, 0.022, -0.07011904591995215],
  truongSa: [0.3059778300968851, 0.022, 0.4015501278212497],
} as const;
