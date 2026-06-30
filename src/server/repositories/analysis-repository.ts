import type { Analysis, ScoringConfig, PrivacyMode } from "@/types/domain";
import { createEntityId } from "./ids";
import { SqliteAnalysisRepository } from "./sqlite-analysis-repository";
import { getAppSqliteDatabase } from "./sqlite-db";

export type CreateAnalysisRecord = {
  jobDescription: string;
  scoringConfig: ScoringConfig;
  privacyMode: PrivacyMode;
};

export interface AnalysisRepository {
  create(input: CreateAnalysisRecord): Promise<Analysis>;
  findById(id: string): Promise<Analysis | null>;
}

export class InMemoryAnalysisRepository implements AnalysisRepository {
  private records = new Map<string, Analysis>();

  async create(input: CreateAnalysisRecord): Promise<Analysis> {
    const now = new Date().toISOString();
    const analysis: Analysis = {
      id: createEntityId("anlz"),
      userId: null,
      jobDescription: input.jobDescription,
      scoringConfig: input.scoringConfig,
      privacyMode: input.privacyMode,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    const records = new Map(this.records);
    records.set(analysis.id, analysis);
    this.records = records;
    return analysis;
  }

  async findById(id: string): Promise<Analysis | null> {
    return this.records.get(id) ?? null;
  }
}

let configuredRepository: AnalysisRepository | null = null;

export const analysisRepository: AnalysisRepository = {
  create(input) {
    return getAnalysisRepository().create(input);
  },
  findById(id) {
    return getAnalysisRepository().findById(id);
  },
};

function getAnalysisRepository(): AnalysisRepository {
  configuredRepository ??=
    process.env.DATA_BACKEND === "memory"
      ? new InMemoryAnalysisRepository()
      : new SqliteAnalysisRepository(getAppSqliteDatabase());

  return configuredRepository;
}
