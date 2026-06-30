import type { ExtractedProfile } from "@/types/domain";

export type LlmExtractionRequest = {
  jobDescription: string;
  candidateText: string;
};

export type LlmExtractionResponse = {
  profile: ExtractedProfile;
  warnings: string[];
};

export interface LlmAdapter {
  extractProfile(request: LlmExtractionRequest): Promise<LlmExtractionResponse>;
}

export class UnconfiguredLlmAdapter implements LlmAdapter {
  async extractProfile(): Promise<LlmExtractionResponse> {
    throw new Error("LLM adapter is not configured yet.");
  }
}
