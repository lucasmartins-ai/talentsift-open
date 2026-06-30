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
          <p>Upload PDF or text CVs. Processing runs server-side.</p>
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
        <span className="upload-title">Choose CV files</span>
        <span className="upload-copy">
          Files are only registered as metadata in this foundation build.
        </span>
      </label>

      {files.length > 0 ? (
        <ul className="file-list" aria-label="Selected CV files">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              <span>{file.name}</span>
              <strong>{formatFileSize(file.size)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">No CVs selected yet.</p>
      )}
    </section>
  );
}

function formatFileSize(sizeBytes: number) {
  const mb = sizeBytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 1 ? 1 : 2)} MB`;
}
