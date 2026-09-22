import type {
  Candidate,
  CandidateDocument,
  RankingResult,
} from "@/types/domain";
import type { UploadMetadataInput } from "@/lib/validation";
import { mockLlmAdapter } from "@/lib/ai/mock-llm-adapter";
import { typesafeLlmAdapter } from "@/lib/ai/typesafe-llm-adapter";
import type { LlmAdapter } from "@/lib/ai/llm-adapter";
import { textCandidateParser } from "@/lib/parsing/text-parser";
import type { CandidateDocumentParser } from "@/lib/parsing/parser";
import { rankCandidate } from "@/lib/ranking";
import {
  analysisRepository,
  type AnalysisRepository,
} from "@/server/repositories/analysis-repository";
import {
  candidateRepository,
  type CandidateRepository,
} from "@/server/repositories/candidate-repository";
import { ServiceError } from "./errors";

export type UploadResult = {
  candidate: Candidate;
  document: CandidateDocument;
  ranking: RankingResult | null;
  warnings: string[];
};

export class CandidateService {
  constructor(
    private readonly analyses: AnalysisRepository,
    private readonly candidates: CandidateRepository,
    private readonly parser: CandidateDocumentParser,
    private readonly llm: LlmAdapter,
  ) {}

  async createUploadMetadata(
    analysisId: string,
    input: UploadMetadataInput,
  ): Promise<UploadResult> {
    const analysis = await this.analyses.findById(analysisId);
    if (!analysis) {
      throw new ServiceError(
        "analysis_not_found",
        "Analysis was not found.",
        404,
      );
    }

    const { candidate, document } = await this.candidates.createUpload({
      analysisId,
      displayName: input.candidateLabel ?? "Candidate",
      originalFilename: input.originalFilename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
    });

    if (input.candidateText === undefined) {
      return { candidate, document, ranking: null, warnings: [] };
    }

    // Text is parsed, extracted, and ranked in memory, then returned inline.
    // The derived ranking is not persisted yet; add a rankings table and GET
    // route when results need to survive a page refresh.
    const parsed = await this.parser.parse({
      contentType: input.contentType,
      bytes: new TextEncoder().encode(input.candidateText),
    });
    const extraction = await this.llm.extractProfile({
      jobDescription: analysis.jobDescription,
      candidateText: parsed.text,
    });
    const ranking = rankCandidate({
      scoringConfig: analysis.scoringConfig,
      profile: extraction.profile,
    });

    return {
      candidate,
      document,
      ranking,
      warnings: [
        ...parsed.warnings.map((warning) => warning.message),
        ...extraction.warnings,
      ],
    };
  }
}

export const candidateService = new CandidateService(
  analysisRepository,
  candidateRepository,
  textCandidateParser,
  typesafeLlmAdapter,
);
