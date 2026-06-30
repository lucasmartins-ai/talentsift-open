# Security Policy

TalentSift Open processes sensitive candidate documents. Security and privacy issues should be treated as high priority.

## Reporting a Vulnerability

If this repository is public, report vulnerabilities privately through the repository owner's preferred security contact or GitHub private vulnerability reporting when enabled.

Do not open a public issue with exploit details, secrets, or real candidate data.

## Sensitive Areas

High-risk areas include:

- CV upload handling.
- Local SQLite persistence.
- Any future real provider integration.
- Any future LLM prompt construction.
- CSV export.
- Raw CV text logging.
- Retention and deletion workflows.

## Required Controls Before Production

- No committed secrets.
- No committed local SQLite files.
- No real candidate data in fixtures, screenshots, tests, or docs.
- Mock providers by default.
- Input validation on all endpoints.
- File size, type, and count limits.
- No raw CV text in logs or analytics.
- Full analysis deletion path.
- Local demo reset or cleanup path.

## Secret Handling

Use environment variables for all secrets. Never commit:

- LLM provider keys.
- Cloud storage credentials.
- Database connection strings with passwords.
- Production JWT secrets.
- Real candidate documents.
- Local SQLite database files.

If a secret is exposed, rotate it immediately and review logs for misuse.

## Test Data

Use synthetic candidate profiles and synthetic CVs. Do not use real candidate data in tests, screenshots, demos, or fixtures.

## Responsible AI Boundary

Security review should include the product boundary. The system must remain an assistive screening tool and should not claim to automate employment decisions.
