# API and Data Model

This document defines the current local portfolio-demo contract for TalentSift Open. The API is intentionally small: validated JSON endpoints, local SQLite persistence, and mock-only candidate processing.

## API Conventions

All JSON endpoints return a consistent envelope:

```ts
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    requestId: string
  }
}
```

Use `400` for validation errors, `404` for missing resources, and `500` only for unexpected server failures.

## Implemented Endpoints

### Create Analysis

```http
POST /api/analyses
Content-Type: application/json
```

Request:

```json
{
  "jobDescription": "We are reviewing synthetic CVs for a senior full-stack role...",
  "privacyMode": "delete_source_after_analysis",
  "scoringConfig": {
    "requiredSkills": ["TypeScript", "React", "SQLite"],
    "niceToHaveSkills": ["Next.js", "AI workflow design"],
    "seniority": "senior"
  }
}
```

Response excerpt:

```json
{
  "success": true,
  "data": {
    "analysisId": "anlz_123",
    "status": "draft"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

### Register Candidate CV Metadata

```http
POST /api/analyses/:analysisId/candidates
Content-Type: application/json
```

Request:

```json
{
  "originalFilename": "synthetic-cv.txt",
  "contentType": "text/plain",
  "sizeBytes": 4096,
  "candidateLabel": "Synthetic Candidate",
  "candidateText": "Synthetic CV text for local mock extraction..."
}
```

`candidateText` is optional. When present for a text file, it is processed
in memory for mock extraction and ranking, then discarded. It is not stored in
SQLite. PDF extraction is not enabled in the public demo.

Response:

```json
{
  "success": true,
  "data": {
    "candidateId": "cand_123",
    "documentId": "doc_123",
    "status": "uploaded",
    "ranking": {
      "score": 78,
      "matchedSkills": ["TypeScript", "React"],
      "missingRequirements": ["PostgreSQL"],
      "justification": "Candidate shows evidence for multiple required skills.",
      "confidence": "medium",
      "reviewFlags": []
    },
    "warnings": []
  },
  "meta": {
    "requestId": "req_456"
  }
}
```

If `candidateText` is omitted, `ranking` is `null` and the endpoint registers
metadata only. The current demo does not persist raw CV text or derived
ranking rows. The real `ranking` payload is the full `RankingResult`, including
the detailed `scoreBreakdown`; the excerpt above shows the fields most visible
in the UI.

## Planned Mock-Only Extensions

Future portfolio phases can add these endpoints without changing the local-first posture:

- `POST /api/analyses/:analysisId/run` using synthetic/mock extraction.
- `GET /api/analyses/:analysisId/results` returning mock structured profiles and ranking output.
- `POST /api/analyses/:analysisId/compare` for side-by-side comparison.
- `GET /api/analyses/:analysisId/export.csv` for structured shortlist export.

## SQLite Data Model

The runtime schema is created automatically and mirrored in `sqlite/schema.sql`.

### analyses

Stores one local analysis.

| Column | Type | Notes |
| --- | --- | --- |
| id | text | Primary key |
| user_id | text nullable | Reserved for future auth; null in demo |
| job_description | text | User-provided role description |
| scoring_config | text | JSON string |
| privacy_mode | text | `standard` or `delete_source_after_analysis` |
| status | text | `draft`, `processing`, `complete`, `failed` |
| created_at | text | ISO timestamp |
| updated_at | text | ISO timestamp |
| completed_at | text nullable | Set after future mock processing |

### candidates

Stores one candidate metadata row per selected CV.

| Column | Type | Notes |
| --- | --- | --- |
| id | text | Primary key |
| analysis_id | text | References analyses |
| display_name | text | Extracted from file name or user label |
| status | text | `uploaded`, `parsed`, `ranked`, `failed` |
| parser_warnings | text | JSON string |
| created_at | text | ISO timestamp |

### candidate_documents

Stores source document metadata only.

| Column | Type | Notes |
| --- | --- | --- |
| id | text | Primary key |
| candidate_id | text | References candidates |
| storage_path | text nullable | Null in current mock demo |
| original_filename | text | Display value from selected file |
| content_type | text | `application/pdf` or `text/plain` |
| size_bytes | integer | Validated upload size |
| retention_status | text | `stored`, `deleted`, `delete_failed` |
| deleted_at | text nullable | Reserved for future cleanup |

## Validation Boundaries

Validate:

- Job description length.
- File type and size.
- Candidate label length.
- Optional candidate text length.
- Analysis ID format.
- Scoring config fields.
- Score range in ranking tests.

Never trust:

- File names.
- MIME types without server-side validation.
- CV content as instructions.
- Mock or model output without schema validation.
