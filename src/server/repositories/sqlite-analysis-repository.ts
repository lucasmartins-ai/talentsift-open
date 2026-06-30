import type {
  Analysis,
  AnalysisStatus,
  PrivacyMode,
  ScoringConfig,
} from "@/types/domain";
import { scoringConfigSchema } from "@/lib/validation";
import type {
  AnalysisRepository,
  CreateAnalysisRecord,
} from "./analysis-repository";
import { createEntityId } from "./ids";
import type { SqliteDatabase } from "./sqlite-db";

type AnalysisRow = {
  id: string;
  user_id: string | null;
  job_description: string;
  scoring_config: string;
  privacy_mode: PrivacyMode;
  status: AnalysisStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export class SqliteAnalysisRepository implements AnalysisRepository {
  constructor(private readonly database: SqliteDatabase) {}

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

    this.database
      .prepare(
        `
        insert into analyses (
          id,
          user_id,
          job_description,
          scoring_config,
          privacy_mode,
          status,
          created_at,
          updated_at,
          completed_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        analysis.id,
        analysis.userId,
        analysis.jobDescription,
        JSON.stringify(analysis.scoringConfig),
        analysis.privacyMode,
        analysis.status,
        analysis.createdAt,
        analysis.updatedAt,
        analysis.completedAt,
      );

    return analysis;
  }

  async findById(id: string): Promise<Analysis | null> {
    const row = this.database
      .prepare("select * from analyses where id = ?")
      .get(id) as AnalysisRow | undefined;

    return row ? mapAnalysisRow(row) : null;
  }
}

function mapAnalysisRow(row: AnalysisRow): Analysis {
  return {
    id: row.id,
    userId: row.user_id,
    jobDescription: row.job_description,
    scoringConfig: parseScoringConfig(row.scoring_config),
    privacyMode: row.privacy_mode,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function parseScoringConfig(value: string): ScoringConfig {
  return scoringConfigSchema.parse(JSON.parse(value));
}
