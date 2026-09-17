/**
 * FEATURE 2 - the interactive 3D relief map.
 * VietnamMap3DController renders into #national-three and projects the pins.
 */
export function NationalSection() {
  return (
    <section className="national-section" id="national">
      <div className="national-container">
        <div className="national-copy">
          <h2 className="national-title">
            <span className="national-title-line1">From Can Tho</span>
            <span className="national-title-line2">to all of Vietnam.</span>
          </h2>
          <p className="national-body">
            Lucidex starts in Can Tho. The aim is every institution in Vietnam that issues credentials, so any employer can verify any Vietnamese degree at the source.
          </p>
          <div className="national-stats">
            <div className="national-stat-item">
              <b className="national-stat-num">1</b>
              <small className="national-stat-label">city today</small>
            </div>
            <div className="national-stat-item">
              <b className="national-stat-num">34</b>
              <small className="national-stat-label">provinces and cities in reach</small>
            </div>
          </div>
        </div>

        <div id="stage" className="national-stage">
          <canvas id="national-three" tabIndex={0} role="img" aria-label="3D relief map of Vietnam including the Hoang Sa and Truong Sa archipelagos"></canvas>
          <div className="pin home" id="pinCT">Can Tho, starting point</div>
          <div className="pin" id="pinHS">Hoang Sa Archipelago (Vietnam)</div>
          <div className="pin" id="pinTS">Truong Sa Archipelago (Vietnam)</div>
          <div className="hint">
            <button id="national-reset-btn" type="button">Reset view</button>
          </div>
        </div>
      </div>
    </section>
  );
}
