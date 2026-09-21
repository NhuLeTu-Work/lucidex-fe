/** SECTION 2 - The problem */
export function ProblemSection() {
  return (
    <section className="problem-section" id="problem">
      <div className="container">
        <div className="section-head-center">
          <h2 className="section-title">A document can look real and still be fake</h2>
        </div>

        <div className="problem-grid">
          <div className="problem-card">
            <p className="problem-card-title">Employers often check degrees by eye alone</p>
          </div>

          <div className="problem-card">
            <p className="problem-card-title">Forged documents are only discovered after the hire</p>
          </div>

          <div className="problem-card">
            <p className="problem-card-title">Fixing a bad hire costs far more time than verifying first</p>
          </div>
        </div>
      </div>
    </section>
  );
}
