type CandidateUploadPanelProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export function CandidateUploadPanel({
  files,
  onFilesChange,
}: CandidateUploadPanelProps) {
  return (
    <section className="workflow-section" aria-labelledby="upload-heading">
      <div className="section-heading-row">
        <div>
          <h2 id="upload-heading">Candidate CVs</h2>
          <p>Select synthetic TXT CVs to rank, or PDFs for metadata only.</p>
        </div>
        <span className="count-badge">{files.length} selected</span>
      </div>

      <label className="upload-zone">
        <input
          className="sr-only"
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          multiple
          onChange={(event) =>
            onFilesChange(Array.from(event.currentTarget.files ?? []))
          }
        />
        <span className="upload-marker" aria-hidden="true" />
        <span className="upload-title">Choose CV files</span>
        <span className="upload-copy">
          PDF or TXT, up to 10 MB each. TXT text is ranked in-memory and never
          stored.
        </span>
      </label>

      {files.length > 0 ? (
        <ul className="file-list" aria-label="Selected CV files">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              <span>{file.name}</span>
              <strong className="file-meta">{formatFileSize(file.size)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">No CV metadata selected yet.</p>
      )}
    </section>
  );
}

function formatFileSize(sizeBytes: number) {
  const mb = sizeBytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 1 ? 1 : 2)} MB`;
}
