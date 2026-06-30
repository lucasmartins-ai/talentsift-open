# TalentSift Open

TalentSift Open is a local-first portfolio demo for AI-assisted CV review. It
shows how an employment-review workflow can collect a role brief, register
synthetic CV files, run deterministic mock scoring, and present evidence,
gaps, confidence, and review flags for a person to inspect.

> TalentSift Open supports human review. It does not make employment,
> interview, or eligibility decisions.

## Why This Exists

This repository is designed to be easy to inspect on GitHub and easy to run
locally without private infrastructure. It demonstrates product thinking,
frontend polish, validation boundaries, local persistence, deterministic
ranking, and privacy-aware AI workflow design without requiring real candidate
data, cloud services, or external AI keys.

## What The Demo Shows

- A focused review workspace, not a marketing landing page.
- Job description input with optional scoring hints.
- Synthetic PDF or TXT CV selection.
- Local analysis and upload metadata persisted in SQLite.
- In-memory mock extraction for TXT CVs using a deterministic vocabulary scan.
- Reviewer-facing scores, evidence, gaps, confidence, and review flags.
- Clear privacy-first copy and assistive language throughout the UI.

PDF files are currently registered as metadata only. TXT files can be scored by
the mock local pipeline. Raw CV text is not stored in SQLite.

## Portfolio Highlights

- **Frontend**: refined responsive workspace with accessible focus states,
  tactile neumorphic surfaces, intentional empty/loading/disabled states, and
  a visible primary CTA.
- **Backend boundaries**: route handlers validate requests with Zod before
  service logic runs.
- **Local persistence**: SQLite stores analysis records and upload metadata
  without a cloud database.
- **Mock AI boundary**: a typed adapter keeps the extraction seam clear while
  avoiding real LLM calls in the public demo.
- **Deterministic ranking**: scoring logic is pure TypeScript and covered by
  tests.
- **Responsible use**: the app is framed as an assistant for human review, not
  an automated employment decision system.

## Stack

- Next.js App Router
- React
- TypeScript
- SQLite through `better-sqlite3`
- Zod
- Vitest
- ESLint
- Prettier

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default `.env.example` keeps the project local and mock-driven:

```bash
DATA_BACKEND=sqlite
SQLITE_DATABASE_PATH=data/talentsift-open.sqlite
LLM_PROVIDER=mock
```

The SQLite file is created locally on first use and ignored by Git.

## Demo Workflow

1. Paste a synthetic role brief into the job description field.
2. Add optional required skills, nice-to-have skills, and seniority hints.
3. Select synthetic `.txt` CV files to see mock scoring, or `.pdf` files to
   register metadata only.
4. Keep privacy-first mode enabled for the intended public-demo posture.
5. Create an analysis and review the local shortlist output.

Use only synthetic CVs. Real CVs can contain sensitive personal data and should
not be uploaded to this public portfolio demo.

## Verification

```bash
npm run typecheck
npm run lint
npm run format
npm test
npm run build
```

Additional useful check:

```bash
npm run test:coverage
```

## Security And Privacy Boundaries

- No Supabase, managed database, real LLM provider, auth provider, or external
  service key is required.
- Do not commit `.env`, `.env.local`, local SQLite files, logs, coverage, or
  Playwright artifacts.
- Treat CV content and file names as untrusted input.
- Do not render mock/model output as trusted HTML.
- Do not log raw CV text.
- Keep ranking explainable and assistive; final judgment stays with a person.

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API and Data Model](docs/API_AND_DATA_MODEL.md)
- [Privacy and AI Safety](docs/PRIVACY_AND_AI_SAFETY.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Project Structure

```text
src/
  app/          Next.js routes, API handlers, and global UI styles
  components/   Workspace, upload, results, comparison, and UI primitives
  lib/          Validation, parsing, mock AI boundary, ranking, storage
  server/       Services and repository adapters
  types/        Domain model
sqlite/         Local schema reference
docs/           Product, architecture, privacy, and roadmap notes
test/           Vitest coverage for core behavior
```

## License

A license has not been selected yet. Do not reuse this code as open source
until a license is added.
