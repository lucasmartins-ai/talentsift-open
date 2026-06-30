# Contributing

TalentSift Open should stay clean, practical, and easy to review. This guide defines the expected quality bar for public contributions.

## Project Standards

- Prefer small, focused changes.
- Keep business logic out of React components.
- Validate all inputs at API boundaries.
- Keep local persistence behind repository interfaces.
- Keep real provider integrations out of the default public demo.
- Avoid hardcoded secrets and environment-specific values.
- Do not render model output as trusted HTML.
- Use clear, specific copy instead of generic AI marketing language.
- Preserve the product boundary: assistive screening, not automated employment decisions.

## Expected Workflow

1. Open or pick an issue with clear scope.
2. Add or update tests for behavior changes.
3. Implement the smallest safe change.
4. Run the relevant checks.
5. Update documentation when behavior, setup, API, or architecture changes.
6. Submit a PR with a concise summary and test plan.

## Code Organization

Recommended boundaries:

- `src/app`: routing, pages, and API entrypoints.
- `src/components`: UI components.
- `src/lib`: framework-independent utilities and adapters.
- `src/server/services`: application services.
- `src/server/repositories`: data access.
- `src/types`: shared TypeScript types.
- `sqlite/schema.sql`: local demo database schema.

## Testing Expectations

Core logic should be testable without a browser or live provider:

- Ranking calculations.
- Schema validation.
- CSV export formatting.
- Parser fallback behavior.
- Mock extraction response validation.
- Retention and deletion decisions.

E2E tests should cover:

- Creating an analysis.
- Uploading CVs.
- Viewing ranked results.
- Filtering candidates.
- Exporting CSV.
- Deleting source documents.

## Pull Request Checklist

- [ ] The change is scoped and easy to review.
- [ ] Tests were added or updated where needed.
- [ ] Lint, typecheck, tests, and build pass locally.
- [ ] No secrets or real candidate data are committed.
- [ ] Documentation is updated when behavior changes.
- [ ] UI copy does not imply automated employment decisions.
- [ ] Sensitive data is not logged.

## Security and Privacy

Candidate CVs are sensitive documents. Do not add fixtures containing real personal data. Use synthetic CVs in tests and examples.

Report security issues using the guidance in [SECURITY.md](SECURITY.md).
