import type { RankingResult } from "@/types/domain";

type RegisteredUpload = {
  fileName: string;
  status: "registered" | "skipped" | "failed";
  message: string;
};

type CandidateResult = {
  candidateLabel: string;
  ranking: RankingResult;
};

type ResultsPlaceholderProps = {
  analysisId: string | null;
  status: string | null;
  uploads: RegisteredUpload[];
  results: CandidateResult[];
};

const previewSignals = [
  {
    label: "Evidence",
    value: "Matched role requirements",
  },
  {
    label: "Gaps",
    value: "Missing or weak requirements",
  },
  {
    label: "Confidence",
    value: "Reviewer-facing certainty",
  },
];

export function ResultsPlaceholder({
  analysisId,
  status,
  uploads,
  results,
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
        <div className="result-state" aria-live="polite">
          <div className="analysis-ready-card">
            <span className="ready-indicator" aria-hidden="true" />
            <p>
              Analysis <strong>{analysisId}</strong> is ready for the next
              processing steps.
            </p>
          </div>
          {results.length > 0 ? (
            <ol className="ranking-list" aria-label="Scored candidates">
              {results.map((result, index) => (
                <li className="ranking-card" key={result.candidateLabel}>
                  <div className="ranking-head">
                    <span className="ranking-rank">#{index + 1}</span>
                    <strong className="ranking-name">
                      {result.candidateLabel}
                    </strong>
                    <span className="ranking-score">
                      {result.ranking.score}
                      <small>/100</small>
                    </span>
                    <span
                      className="confidence-pill"
                      data-confidence={result.ranking.confidence}
                    >
                      {result.ranking.confidence} confidence
                    </span>
                  </div>
                  <p className="ranking-justification">
                    {result.ranking.justification}
                  </p>
                  {result.ranking.matchedSkills.length > 0 ? (
                    <p className="ranking-line">
                      <span>Evidence for</span>{" "}
                      {result.ranking.matchedSkills.join(", ")}
                    </p>
                  ) : null}
                  {result.ranking.missingRequirements.length > 0 ? (
                    <p className="ranking-line ranking-gaps">
                      <span>Gaps</span>{" "}
                      {result.ranking.missingRequirements.join(" ")}
                    </p>
                  ) : null}
                  {result.ranking.reviewFlags.length > 0 ? (
                    <ul className="review-flags" aria-label="Review flags">
                      {result.ranking.reviewFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
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
          <div>
            <h3>No analysis yet</h3>
            <p>
              Paste a job description, select synthetic CVs, and create an
              analysis to prepare a reviewer-facing shortlist.
            </p>
          </div>
          <div className="preview-grid" aria-label="Planned review outputs">
            {previewSignals.map((signal) => (
              <div className="preview-card" key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
