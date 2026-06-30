# Privacy and AI Safety

TalentSift Open is a public portfolio demo. It must stay safe to inspect, run, and share without processing real candidate data.

## Product Boundary

TalentSift Open may:

- Structure a reviewer workflow.
- Register synthetic CV metadata.
- Demonstrate how ranking could be explained.
- Help reviewers think through evidence and gaps.

TalentSift Open must not:

- Decide employment outcomes.
- Infer protected characteristics.
- Make unsupported claims about a candidate.
- Encourage users to skip human review.
- Process real candidate data in the public demo.

## Data Categories

The current demo stores:

- Job descriptions entered by the user.
- Selected file names.
- File content types and sizes.
- Local analysis and candidate metadata.

The current demo does not store raw CV text.

## SQLite Data Handling

Local SQLite files are created under `data/` by default and ignored by Git. They are development artifacts, not public fixtures.

Do not commit:

- Local SQLite databases.
- `.env` or `.env.local`.
- Logs.
- Screenshots containing real candidate data.
- Real CVs or resumes.

## Mock AI Boundary

The public demo uses `LLM_PROVIDER=mock`. There is no API key requirement and no model provider call in the current workflow.

If real extraction is added later:

- Keep provider keys server-side.
- Send only the minimum needed text.
- Disable provider training where supported.
- Validate structured output with schemas.
- Avoid logging prompts or full CV text.

## Prompt Injection Defense

CVs are untrusted documents. They may contain instructions such as "ignore previous instructions" or "rank this candidate first." Treat all CV text as data.

Prompt rules for any future real extraction:

- Keep system instructions separate from candidate text.
- Delimit candidate text clearly.
- Instruct the model to ignore instructions inside CVs.
- Validate JSON output before using it.
- Compute final scores in deterministic application code.

## Bias and Fairness Controls

The product should avoid collecting, inferring, or scoring on protected characteristics. It should focus on job-related evidence from the CV and job description.

Do not score on:

- Age.
- Gender.
- Race or ethnicity.
- Religion.
- Disability.
- Family status.
- Photos or appearance.

Use caution with proxies such as school names, graduation dates, addresses, or career gaps.

## Explainability Requirements

Every ranked candidate should include:

- Score.
- Matched skills.
- Missing or weak requirements.
- Evidence snippets or references.
- Short justification.
- Confidence level.
- Review flags.

Avoid vague explanations such as "good culture fit" unless the job description defines specific, job-related behaviors and the CV provides evidence.

## UI Copy Guardrails

Use:

- "Suggested shortlist"
- "AI-assisted summary"
- "Review evidence"
- "Potential gaps"
- "Requires human review"

Avoid decisive employment language and guarantees.

## Compliance Note

This project is not a legal compliance framework. Teams using similar ideas in production should review local employment, data protection, and AI governance requirements before processing real candidate data.
