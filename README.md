# TalentSift Open

TalentSift Open is a public portfolio demo for AI-assisted CV review. It helps a reviewer paste a job description, register synthetic CV files, and see the foundation for explainable candidate triage without connecting real AI or cloud services.

> TalentSift Open supports human review. It does not make employment or interview outcome decisions.

## Status

This is a portfolio/demo project, not a production employment platform. The current app is intentionally local-first:

- Next.js App Router UI for the main review workflow.
- Server-side validation with Zod.
- SQLite persistence for local analysis and upload metadata.
- Mock storage and mock AI adapter boundaries.
- Deterministic ranking logic with unit tests.
- No cloud database, LLM provider, or privileged cloud key required.

## What It Shows

The demo currently lets a user:

- Paste a job description.
- Select PDF or text CV files.
- Register upload metadata locally.
- Choose privacy-first mode.
- Keep analysis state in a local SQLite database.
- Review placeholder panels for future shortlist and comparison views.

The project also includes the domain model, API envelope, validation schemas, ranking service, and docs needed to explain how the fuller workflow would be built.

## Responsible Use

Use only synthetic CVs in this demo. Real candidate documents can contain sensitive personal data and should not be uploaded to a public portfolio app.

TalentSift Open should be described as a screening assistant, not an automated employment decision system. Avoid copy that implies the app chooses employment outcomes or interview outcomes.

## Stack

- Next.js
- React
- TypeScript
- SQLite through `better-sqlite3`
- Zod
- Vitest
- ESLint
- Prettier

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default `.env.example` uses:

```bash
DATA_BACKEND=sqlite
SQLITE_DATABASE_PATH=data/talentsift-open.sqlite
LLM_PROVIDER=mock
```

The SQLite file is created locally on first use and ignored by Git.

## SQLite Setup

No external database setup is required. The app creates the local SQLite schema automatically at runtime.

For inspection, the schema is also available in:

```text
sqlite/schema.sql
```

To run without a local SQLite file, set:

```bash
DATA_BACKEND=memory
```

The memory backend is useful for quick smoke tests, but the SQLite backend is the default public demo path.

## Scripts

```bash
npm run typecheck
npm run lint
npm run format
npm test
npm run build
npm audit
```

Additional script:

```bash
npm run test:coverage
```

## Security And Privacy

- Do not use real CVs in the demo.
- Do not commit `.env`, `.env.local`, local SQLite files, logs, coverage, or Playwright artifacts.
- Do not add LLM API keys or cloud service credentials to the client.
- The current project does not need privileged cloud keys.
- Treat all CV text as untrusted data.
- Render model or mock output as plain text, never trusted HTML.
- Keep ranking assistive and explainable; final judgment stays with a person.

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
  app/
  components/
  lib/
  server/
  types/
sqlite/
  schema.sql
docs/
test/
```

## License

A license has not been selected yet. Add one before presenting the repository as open source.
