export function ComparisonPlaceholder() {
  return (
    <section className="comparison-strip" aria-labelledby="comparison-heading">
      <div>
        <h2 id="comparison-heading">Comparison</h2>
        <p>
          Candidate comparison will appear here after parsing and ranking are
          connected.
        </p>
      </div>
      <div className="comparison-preview" aria-label="Comparison preview">
        <span>Evidence</span>
        <span>Gaps</span>
        <span>Reviewer notes</span>
      </div>
    </section>
  );
}
