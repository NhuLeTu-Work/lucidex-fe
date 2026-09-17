import { VIETNAM_OUTLINE_PATH } from '../constants/vietnamOutlinePath';

/**
 * Feature 1: fixed "liquid" Vietnam outline background layer.
 *
 * The standalone page inlined the same ~10 KB path three times; here it comes
 * from one constant. VietnamLiquidMapController drives #waveFront / #waveBack.
 */
export function VietnamMapLayer() {
  return (
    <div id="mapLayer" aria-hidden="true">
      <svg id="vnsvg" viewBox="0 0 1257 1503" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="vnclip">
            <path d={VIETNAM_OUTLINE_PATH} />
          </clipPath>
          <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38BDF8" stopOpacity=".55" />
            <stop offset="1" stopColor="#6366F1" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <path className="map-empty" d={VIETNAM_OUTLINE_PATH} />
        <g clipPath="url(#vnclip)">
          <g id="liquid">
            <path id="waveBack" fill="#38BDF8" fillOpacity=".18" />
            <path id="waveFront" fill="url(#liq)" />
          </g>
        </g>
        <path className="map-outline" d={VIETNAM_OUTLINE_PATH} />
      </svg>
    </div>
  );
}
