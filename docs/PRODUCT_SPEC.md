# Product Spec

## Summary

TalentSift Open is a public portfolio demo for AI-assisted CV review. It shows how a reviewer could structure a job description, register CVs, and prepare an explainable shortlist workflow while keeping the current implementation local, mock-driven, and safe to inspect.

The product reduces the shape of a recruiting workflow into a demo that is visible on GitHub without requiring real candidate data, LLM keys, or cloud infrastructure.

## Audience

- Recruiters and founders evaluating a portfolio project.
- Hiring managers reviewing an example of assistive AI workflow design.
- Engineers looking at validation, repository boundaries, and ranking logic.

## Positioning

Use this positioning:

> AI-assisted CV review demo for summarizing, comparing, and shortlisting candidates with human oversight.

Avoid positioning that implies automated employment decisions.

## Goals

- Demonstrate a clean local-first Next.js application.
- Show a practical assistive workflow for CV review.
- Keep data handling simple with SQLite and mock adapters.
- Keep ranking explainable and deterministic.
- Make the repository easy to run, inspect, and discuss as portfolio work.

## Non-Goals

- Do not process real candidate documents in the public demo.
- Do not call a real LLM provider.
- Do not require cloud storage or managed database setup.
- Do not reject candidates automatically.
- Do not make employment-outcome recommendations.
- Do not infer protected characteristics.
- Do not become a full applicant tracking system.

## Current Demo Scope

### Job Description Input

The user can paste a role description and optional scoring hints:

- Required skills.
- Nice-to-have skills.
- Seniority.
- Privacy-first mode.

### CV Metadata Registration

The user can select PDF or text CV files. The current demo registers file metadata only. It does not upload, parse, or store raw CV text.

MVP constraints:

- Allow PDF and text extensions/MIME types.
- Limit file size through validation.
- Return clear validation errors.
- Use synthetic/demo documents only.

### Local Persistence

The app stores analysis and upload metadata in local SQLite by default.

The SQLite database is created under `data/` and ignored by Git.

### Ranking Foundation

The deterministic ranking service is implemented and tested independently. It is ready to receive structured mock profiles in future UI phases.

The score returns:

- Score.
- Score breakdown.
- Matched skills.
- Missing requirements.
- Justification.
- Confidence.
- Review flags.

## UX Requirements

- The first screen should be the actual workflow, not a marketing landing page.
- The job description field and CV picker should be visible immediately.
- Copy must remind users that outputs require human review.
- Empty, loading, and error states should be clear.
- The UI should remain useful as a portfolio demo even before real parsing exists.

## Quality Requirements

- Validate all user input at API boundaries.
- Keep provider credentials out of the project.
- Do not log raw CV text.
- Do not render model output as trusted HTML.
- Keep business logic out of React components.
- Keep ranking pure and unit-testable.
- Use synthetic test fixtures only.

## Risks

| Risk | Mitigation |
| --- | --- |
| Viewers assume the demo makes employment decisions | Use assistive language and human-review warnings |
| Real CVs are accidentally used | Document synthetic-only usage and ignore local generated data |
| Scope grows beyond portfolio needs | Keep SQLite/mock as the default and defer real providers |
| Ranking is over-trusted | Return evidence, confidence, and review flags |
| Sensitive data leaks into Git | Ignore `.env*`, SQLite files, logs, coverage, and artifacts |

## Acceptance Criteria

- The app runs locally without cloud credentials.
- A user can create an analysis from a job description.
- A user can register supported CV metadata.
- Analysis and upload metadata persist in local SQLite.
- Ranking logic is covered by unit tests.
- README explains SQLite/mock setup clearly.
- Product copy remains assistive and privacy-first.
