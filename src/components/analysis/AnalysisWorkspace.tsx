"use client";

import { useMemo, useState } from "react";
import type { ApiResponse } from "@/lib/api-response";
import type {
  PrivacyMode,
  RankingResult,
  SeniorityLevel,
} from "@/types/domain";
import { CandidateUploadPanel } from "@/components/candidates/CandidateUploadPanel";
import { ComparisonPlaceholder } from "@/components/comparison/ComparisonPlaceholder";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ResultsPlaceholder } from "./ResultsPlaceholder";

type CreateAnalysisData = {
  analysisId: string;
  status: string;
};

type UploadStatus = {
  fileName: string;
  status: "registered" | "skipped" | "failed";
  message: string;
};

type CandidateResult = {
  candidateLabel: string;
  ranking: RankingResult;
};

const MAX_CV_TEXT_CHARS = 200_000;

const seniorityOptions: Array<
  { value: ""; label: string } | { value: SeniorityLevel; label: string }
> = [
  { value: "", label: "Any seniority" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
];

export function AnalysisWorkspace() {
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [niceToHaveSkills, setNiceToHaveSkills] = useState("");
  const [seniority, setSeniority] = useState<"" | SeniorityLevel>("");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(
    "delete_source_after_analysis",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => jobDescription.trim().length > 0 && !isSubmitting,
    [isSubmitting, jobDescription],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadStatuses([]);
    setResults([]);

    try {
      const createResponse = await fetch("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          privacyMode,
          scoringConfig: {
            requiredSkills: parseCommaList(requiredSkills),
            niceToHaveSkills: parseCommaList(niceToHaveSkills),
            seniority: seniority || undefined,
            domainContext: [],
          },
        }),
      });
      const createEnvelope =
        (await createResponse.json()) as ApiResponse<CreateAnalysisData>;

      if (!createEnvelope.success || !createEnvelope.data) {
        throw new Error(
          createEnvelope.error?.message ?? "Could not create analysis.",
        );
      }

      setAnalysisId(createEnvelope.data.analysisId);
      setAnalysisStatus(createEnvelope.data.status);

      const registeredUploads: UploadStatus[] = [];
      const rankedResults: CandidateResult[] = [];
      for (const file of files) {
        const contentType = normalizeContentType(file);
        if (!contentType) {
          registeredUploads.push({
            fileName: file.name,
            status: "skipped",
            message: "Unsupported type",
          });
          continue;
        }

        const candidateLabel = removeExtension(file.name);
        const candidateText =
          contentType === "text/plain"
            ? (await file.text()).slice(0, MAX_CV_TEXT_CHARS)
            : undefined;

        const response = await fetch(
          `/api/analyses/${createEnvelope.data.analysisId}/candidates`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              originalFilename: file.name,
              contentType,
              sizeBytes: file.size,
              candidateLabel,
              candidateText,
            }),
          },
        );
        const envelope = (await response.json()) as ApiResponse<{
          candidateId: string;
          documentId: string;
          status: string;
          ranking: RankingResult | null;
          warnings: string[];
        }>;

        if (envelope.success && envelope.data?.ranking) {
          rankedResults.push({
            candidateLabel,
            ranking: envelope.data.ranking,
          });
        }

        registeredUploads.push({
          fileName: file.name,
          status: envelope.success ? "registered" : "failed",
          message: envelope.success
            ? envelope.data?.ranking
              ? `Score ${envelope.data.ranking.score}/100`
              : "Metadata registered"
            : (envelope.error?.message ?? "Registration failed"),
        });
      }

      rankedResults.sort((a, b) => b.ranking.score - a.ranking.score);
      setUploadStatuses(registeredUploads);
      setResults(rankedResults);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="workspace-shell">
      <section className="topbar" aria-label="Product context">
        <div className="topbar-copy">
          <p className="eyebrow">TalentSift Open</p>
          <h1>AI-assisted CV review workspace</h1>
          <div className="context-pills" aria-label="Demo boundaries">
            <span>Local SQLite demo</span>
            <span>Mock AI boundary</span>
            <span>Human review required</span>
          </div>
        </div>
        <div className="human-review-note">
          <strong>Assistive review only</strong>
          <p>
            Supports human review. It does not decide employment or interview
            outcomes.
          </p>
        </div>
      </section>

      <div className="workspace-grid">
        <form className="workflow-panel" onSubmit={handleSubmit}>
          <div className="command-bar">
            <div>
              <h2>Review setup</h2>
              <p>
                Create a local analysis record, then register selected CV
                metadata.
              </p>
            </div>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating workspace..." : "Create analysis"}
            </Button>
          </div>

          <section className="workflow-section" aria-labelledby="job-heading">
            <div className="section-heading-row">
              <div>
                <h2 id="job-heading">Job description</h2>
                <p>Paste the role brief and add optional scoring hints.</p>
              </div>
            </div>
            <Textarea
              aria-label="Job description"
              minLength={1}
              rows={10}
              placeholder="Paste the role description, must-have skills, location constraints, and availability expectations."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.currentTarget.value)}
              required
            />
          </section>

          <CandidateUploadPanel files={files} onFilesChange={setFiles} />

          <section className="workflow-section compact-section">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={privacyMode === "delete_source_after_analysis"}
                onChange={(event) =>
                  setPrivacyMode(
                    event.currentTarget.checked
                      ? "delete_source_after_analysis"
                      : "standard",
                  )
                }
              />
              <span>
                Privacy-first mode
                <small>
                  Delete source documents after analysis when enabled.
                </small>
              </span>
            </label>
          </section>

          <section className="workflow-section" aria-labelledby="hints-heading">
            <div className="section-heading-row">
              <div>
                <h2 id="hints-heading">Scoring hints</h2>
                <p>Optional criteria for the deterministic ranking service.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Required skills</span>
                <input
                  type="text"
                  placeholder="TypeScript, React, SQLite"
                  value={requiredSkills}
                  onChange={(event) =>
                    setRequiredSkills(event.currentTarget.value)
                  }
                />
              </label>
              <label className="field">
                <span>Nice-to-have skills</span>
                <input
                  type="text"
                  placeholder="Next.js, AI workflow design"
                  value={niceToHaveSkills}
                  onChange={(event) =>
                    setNiceToHaveSkills(event.currentTarget.value)
                  }
                />
              </label>
              <label className="field">
                <span>Seniority</span>
                <select
                  value={seniority}
                  onChange={(event) =>
                    setSeniority(
                      event.currentTarget.value as "" | SeniorityLevel,
                    )
                  }
                >
                  {seniorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {errorMessage ? (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>

        <aside className="review-panel" aria-label="Analysis output">
          <ResultsPlaceholder
            analysisId={analysisId}
            status={analysisStatus}
            uploads={uploadStatuses}
            results={results}
          />
          <ComparisonPlaceholder />
        </aside>
      </div>
    </main>
  );
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeContentType(file: File) {
  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return "text/plain";
  }

  return null;
}

function removeExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}
