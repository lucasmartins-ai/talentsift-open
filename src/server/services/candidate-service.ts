import type { Candidate, CandidateDocument } from "@/types/domain";
import type { UploadMetadataInput } from "@/lib/validation";
import {
  analysisRepository,
  type AnalysisRepository,
} from "@/server/repositories/analysis-repository";
import {
  candidateRepository,
  type CandidateRepository,
} from "@/server/repositories/candidate-repository";
import { ServiceError } from "./errors";

export class CandidateService {
  constructor(
    private readonly analyses: AnalysisRepository,
    private readonly candidates: CandidateRepository,
  ) {}

  async createUploadMetadata(
    analysisId: string,
    input: UploadMetadataInput,
  ): Promise<{ candidate: Candidate; document: CandidateDocument }> {
    const analysis = await this.analyses.findById(analysisId);
    if (!analysis) {
      throw new ServiceError(
        "analysis_not_found",
        "Analysis was not found.",
        404,
      );
    }

    return this.candidates.createUpload({
      analysisId,
      displayName: input.candidateLabel ?? "Candidate",
      originalFilename: input.originalFilename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
    });
  }
}

export const candidateService = new CandidateService(
  analysisRepository,
  candidateRepository,
);
