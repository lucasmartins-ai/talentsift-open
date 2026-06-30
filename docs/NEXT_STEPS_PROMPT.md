# Next Steps Prompt

Use the prompt below to start the next implementation session for TalentSift
Open.

```text
You are working on TalentSift Open in /Users/Master/Downloads/Talentsift.

Objective:
Keep the project portfolio-ready, public, and demonstrable: Next.js, local
SQLite, mock adapters, synthetic data only, no cloud database, no real LLM, and
no external service keys.

Context:
- TalentSift Open is an assistive CV review demo.
- It may help summarize, compare, and score job-related evidence, but it must
  not decide employment, interview, or eligibility outcomes.
- The current demo stores analyses and file metadata in local SQLite.
- TXT CVs can be processed through an in-memory mock extraction and
  deterministic ranking flow.
- PDF files are registered as metadata only until a real PDF parser is added.
- Raw CV text is not persisted.

Rules:
- Inspect the project before editing.
- Prefer the smallest safe change.
- Use strict TypeScript.
- Validate input at every API boundary.
- Never hardcode secrets.
- Never use real candidate data in fixtures, screenshots, or docs.
- Never log full CV text.
- Never render model or mock output as trusted HTML.
- Preserve assistive language and avoid copy that implies automated
  employment decisions.

Stack:
- Next.js App Router
- React
- TypeScript
- SQLite via better-sqlite3
- Zod
- Vitest
- ESLint
- Prettier

Recommended next improvements:
1. Add side-by-side comparison using synthetic structured results.
2. Add a local reset control for demo data.
3. Add CSV export for structured shortlist fields only.
4. Add focused E2E coverage for the main workflow.
5. Validate the UI on desktop and mobile.
6. Add screenshots only if they contain synthetic data.
7. Choose a license before presenting the repository as open source.

Checks before finishing:
- npm run typecheck
- npm run lint
- npm run format
- npm test
- npm run build
- npm audit

Acceptance criteria:
- The project runs locally without external credentials.
- README explains the SQLite and mock setup clearly.
- No secrets, local databases, logs, or generated artifacts are committed.
- Copy remains assistive and privacy-first.
- Tests and build pass.
```
