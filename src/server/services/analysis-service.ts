import type { Analysis } from "@/types/domain";
import type { CreateAnalysisInput } from "@/lib/validation";
import {
  analysisRepository,
  type AnalysisRepository,
} from "@/server/repositories/analysis-repository";

export class AnalysisService {
  constructor(private readonly repository: AnalysisRepository) {}

  async createAnalysis(input: CreateAnalysisInput): Promise<Analysis> {
    return this.repository.create({
      jobDescription: input.jobDescription,
      scoringConfig: input.scoringConfig,
      privacyMode: input.privacyMode,
    });
  }
}

export const analysisService = new AnalysisService(analysisRepository);
