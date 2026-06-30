import type { Candidate, CandidateDocument } from "@/types/domain";
import { createEntityId } from "./ids";
import { getAppSqliteDatabase } from "./sqlite-db";
import { SqliteCandidateRepository } from "./sqlite-candidate-repository";

export type CreateCandidateUploadRecord = {
  analysisId: string;
  displayName: string;
  originalFilename: string;
  contentType: "application/pdf" | "text/plain";
  sizeBytes: number;
};

export interface CandidateRepository {
  createUpload(
    input: CreateCandidateUploadRecord,
  ): Promise<{ candidate: Candidate; document: CandidateDocument }>;
}

export class InMemoryCandidateRepository implements CandidateRepository {
  private candidates = new Map<string, Candidate>();
  private documents = new Map<string, CandidateDocument>();

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

    const candidates = new Map(this.candidates);
    const documents = new Map(this.documents);
    candidates.set(candidate.id, candidate);
    documents.set(document.id, document);
    this.candidates = candidates;
    this.documents = documents;

    return { candidate, document };
  }
}

let configuredRepository: CandidateRepository | null = null;

export const candidateRepository: CandidateRepository = {
  createUpload(input) {
    return getCandidateRepository().createUpload(input);
  },
};

function getCandidateRepository(): CandidateRepository {
  configuredRepository ??=
    process.env.DATA_BACKEND === "memory"
      ? new InMemoryCandidateRepository()
      : new SqliteCandidateRepository(getAppSqliteDatabase());

  return configuredRepository;
}
