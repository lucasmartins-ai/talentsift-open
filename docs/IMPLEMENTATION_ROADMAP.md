# Implementation Roadmap

This roadmap keeps TalentSift Open scoped as a public portfolio demo: local SQLite, mock adapters, no cloud credentials, and no real candidate data.

## Phase 0: Public Demo Foundation

Outcome: repository is easy to inspect, install, and run.

- Next.js, React, TypeScript, linting, formatting, and tests.
- Local SQLite repository for analysis and upload metadata.
- Mock storage and AI adapter boundaries.
- Typed environment validation.
- Shared API response helpers.
- Base UI shell for the review workflow.
- CI for typecheck, lint, unit tests, and build.

Exit criteria:

- App runs locally.
- CI passes.
- Environment variables are documented.
- No secrets or generated SQLite files are committed.

## Phase 1: Mock Analysis Flow

Outcome: the demo shows a complete reviewer-facing loop using synthetic data.

- Add mock extracted profiles for selected synthetic CVs.
- Connect deterministic ranking to the UI.
- Show score, evidence, gaps, confidence, and review flags.
- Keep all generated results local.
- Keep all copy assistive and human-review oriented.

Exit criteria:

- User can create an analysis.
- User can register supported CV metadata.
- User can see mock shortlist results.
- No raw CV text is stored.

## Phase 2: Comparison And Export

Outcome: portfolio reviewers can see the intended product workflow without real providers.

- Add side-by-side comparison from structured mock results.
- Add CSV export of structured shortlist fields.
- Add delete/reset controls for local demo data.
- Add focused UI tests for the main workflow.

Exit criteria:

- CSV contains structured results only.
- Comparison view is readable on desktop and mobile.
- Local reset clears demo data.

## Phase 3: Portfolio Polish

Outcome: ready to publish as a GitHub portfolio repository.

- Review security and privacy docs.
- Confirm audit, lint, tests, typecheck, format, and build.
- Remove generated artifacts.
- Add screenshots only if they contain synthetic data.
- Add license if the repository is presented as open source.

Exit criteria:

- README setup works from a fresh clone.
- No secrets, local DB files, logs, or generated artifacts are tracked.
- The product boundary is clear: assistive demo, not automated employment decisions.

## Deferred Ideas

These are intentionally outside the public demo baseline:

- Real LLM extraction.
- Cloud storage.
- Authentication.
- Multi-user workspaces.
- OCR for scanned PDFs.
- Managed database adapters.
- Applicant tracking integrations.

## Definition of Done

For any feature:

- User input is validated.
- Errors are visible and specific enough to act on.
- Sensitive data is not logged.
- Unit tests cover core logic.
- Documentation is updated when setup or behavior changes.
- UI copy keeps the product assistive, not decisive.
