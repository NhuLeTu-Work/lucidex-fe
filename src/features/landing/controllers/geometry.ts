// Spline helpers for the flight path, ported verbatim from the standalone
// landing page's main.ts.

export interface Point {
  x: number;
  y: number;
}

export interface PathSample {
  s: number;
  x: number;
  y: number;
}

function dist(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Centripetal Catmull-Rom (alpha = 0.5) to Cubic Bézier conversion
 * Strictly clamped to guarantee monotonic downward Y (no loops, no backtracking).
 */
export function monotonicCatmullRomToBezier(points: Point[], alpha = 0.5): string {
  if (points.length < 2) return '';

  // Extrapolate endpoints
  const pStart: Point = {
    x: 2 * points[0].x - points[1].x,
    y: 2 * points[0].y - points[1].y
  };
  const pEnd: Point = {
    x: 2 * points[points.length - 1].x - points[points.length - 2].x,
    y: 2 * points[points.length - 1].y - points[points.length - 2].y
  };

  const pts = [pStart, ...points, pEnd];
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const p3 = pts[i + 3];

    const d01 = Math.max(1e-4, Math.pow(dist(p0, p1), alpha));
    const d12 = Math.max(1e-4, Math.pow(dist(p1, p2), alpha));
    const d23 = Math.max(1e-4, Math.pow(dist(p2, p3), alpha));

    const t0 = 0;
    const t1 = t0 + d01;
    const t2 = t1 + d12;
    const t3 = t2 + d23;

    const dt1 = t1 - t0;
    const dt2 = t2 - t1;
    const dt3 = t3 - t2;
    const dt20 = t2 - t0;
    const dt31 = t3 - t1;

    const D1x = (p1.x - p0.x) / dt1 - (p2.x - p0.x) / dt20 + (p2.x - p1.x) / dt2;
    const D1y = (p1.y - p0.y) / dt1 - (p2.y - p0.y) / dt20 + (p2.y - p1.y) / dt2;

    const D2x = (p2.x - p1.x) / dt2 - (p3.x - p1.x) / dt31 + (p3.x - p2.x) / dt3;
    const D2y = (p2.y - p1.y) / dt2 - (p3.y - p1.y) / dt31 + (p3.y - p2.y) / dt3;

    const c1x = p1.x + (dt2 / 3) * D1x;
    let c1y = p1.y + (dt2 / 3) * D1y;
    const c2x = p2.x - (dt2 / 3) * D2x;
    let c2y = p2.y - (dt2 / 3) * D2y;

    // Clamp control point Ys to guarantee strict monotonicity (y always increases along segment)
    const yMin = p1.y + 0.5;
    const yMax = p2.y - 0.5;
    c1y = Math.max(yMin, Math.min(yMax, c1y));
    c2y = Math.max(c1y, Math.min(yMax, c2y));

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}
