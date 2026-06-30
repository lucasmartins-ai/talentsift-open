type RegisteredUpload = {
  fileName: string;
  status: "registered" | "skipped" | "failed";
  message: string;
};

type ResultsPlaceholderProps = {
  analysisId: string | null;
  status: string | null;
  uploads: RegisteredUpload[];
};

export function ResultsPlaceholder({
  analysisId,
  status,
  uploads,
}: ResultsPlaceholderProps) {
  return (
    <section className="results-panel" aria-labelledby="results-heading">
      <div className="section-heading-row">
        <div>
          <h2 id="results-heading">Review shortlist</h2>
          <p>Scores, gaps, evidence, and confidence will appear here.</p>
        </div>
        <span className="status-badge">{status ?? "Not started"}</span>
      </div>

      {analysisId ? (
        <div className="result-state">
          <p>
            Analysis <strong>{analysisId}</strong> is ready for the next
            processing steps.
          </p>
          {uploads.length > 0 ? (
            <ul className="upload-results" aria-label="Upload metadata status">
              {uploads.map((upload) => (
                <li key={upload.fileName}>
                  <span>{upload.fileName}</span>
                  <strong data-status={upload.status}>{upload.message}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">No candidate metadata registered yet.</p>
          )}
        </div>
      ) : (
        <div className="empty-results">
          <h3>No analysis yet</h3>
          <p>
            Paste a job description, select CVs, and create an analysis to start
            building a reviewer-facing shortlist.
          </p>
        </div>
      )}
    </section>
  );
}
