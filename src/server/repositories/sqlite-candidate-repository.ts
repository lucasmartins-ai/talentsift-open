import type { Candidate, CandidateDocument } from "@/types/domain";
import type {
  CandidateRepository,
  CreateCandidateUploadRecord,
} from "./candidate-repository";
import { createEntityId } from "./ids";
import type { SqliteDatabase } from "./sqlite-db";

export class SqliteCandidateRepository implements CandidateRepository {
  constructor(private readonly database: SqliteDatabase) {}

  async createUpload(
    input: CreateCandidateUploadRecord,
  ): Promise<{ candidate: Candidate; document: CandidateDocument }> {
    const now = new Date().toISOString();
    const candidate: Candidate = {
      id: createEntityId("cand"),
      analysisId: input.analysisId,
      displayName: input.displayName,
      status: "uploaded",
      parserWarnings: [],
      createdAt: now,
    };
    const document: CandidateDocument = {
      id: createEntityId("doc"),
      candidateId: candidate.id,
      storagePath: null,
      originalFilename: input.originalFilename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      retentionStatus: "stored",
      deletedAt: null,
    };

    const transaction = this.database.transaction(() => {
      this.database
        .prepare(
          `
          insert into candidates (
            id,
            analysis_id,
            display_name,
            status,
            parser_warnings,
            created_at
          ) values (?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          candidate.id,
          candidate.analysisId,
          candidate.displayName,
          candidate.status,
          JSON.stringify(candidate.parserWarnings),
          candidate.createdAt,
        );

      this.database
        .prepare(
          `
          insert into candidate_documents (
            id,
            candidate_id,
            storage_path,
            original_filename,
            content_type,
            size_bytes,
            retention_status,
            deleted_at
          ) values (?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          document.id,
          document.candidateId,
          document.storagePath,
          document.originalFilename,
          document.contentType,
          document.sizeBytes,
          document.retentionStatus,
          document.deletedAt,
        );
    });

    transaction();

    return { candidate, document };
  }
}
