"use client";

import { useMemo, useState } from "react";
import type { ApiResponse } from "@/lib/api-response";
import type { PrivacyMode, SeniorityLevel } from "@/types/domain";
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
              candidateLabel: removeExtension(file.name),
            }),
          },
        );
        const envelope = (await response.json()) as ApiResponse<{
          candidateId: string;
          documentId: string;
          status: string;
        }>;

        registeredUploads.push({
          fileName: file.name,
          status: envelope.success ? "registered" : "failed",
          message: envelope.success
            ? "Metadata registered"
            : (envelope.error?.message ?? "Registration failed"),
        });
      }

      setUploadStatuses(registeredUploads);
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
        <div>
          <p className="eyebrow">TalentSift Open</p>
          <h1>AI-assisted CV review workspace</h1>
        </div>
        <p className="human-review-note">
          Supports human review. It does not decide employment or interview
          outcomes.
        </p>
      </section>

      <div className="workspace-grid">
        <form className="workflow-panel" onSubmit={handleSubmit}>
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

          <div className="action-row">
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating analysis..." : "Create analysis"}
            </Button>
            <p>
              Validation and ranking run server-side as the pipeline expands.
            </p>
          </div>
        </form>

        <aside className="review-panel" aria-label="Analysis output">
          <ResultsPlaceholder
            analysisId={analysisId}
            status={analysisStatus}
            uploads={uploadStatuses}
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
