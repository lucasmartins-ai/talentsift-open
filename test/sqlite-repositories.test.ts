import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SqliteAnalysisRepository } from "@/server/repositories/sqlite-analysis-repository";
import { SqliteCandidateRepository } from "@/server/repositories/sqlite-candidate-repository";
import { createSqliteDatabase } from "@/server/repositories/sqlite-db";

const tempDirs: string[] = [];

function createTestDatabase() {
  const dir = mkdtempSync(join(tmpdir(), "talentsift-open-"));
  tempDirs.push(dir);
  return createSqliteDatabase(join(dir, "test.sqlite"));
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("SQLite repositories", () => {
  it("persists an analysis with scoring config", async () => {
    const db = createTestDatabase();
    const repository = new SqliteAnalysisRepository(db);

    const analysis = await repository.create({
      jobDescription: "Synthetic role requiring TypeScript and React.",
      privacyMode: "delete_source_after_analysis",
      scoringConfig: {
        requiredSkills: ["TypeScript"],
        niceToHaveSkills: ["React"],
        domainContext: ["SaaS"],
      },
    });

    const found = await repository.findById(analysis.id);

    expect(found).toEqual(analysis);
    db.close();
  });

  it("persists upload metadata without storing CV text", async () => {
    const db = createTestDatabase();
    const analyses = new SqliteAnalysisRepository(db);
    const candidates = new SqliteCandidateRepository(db);
    const analysis = await analyses.create({
      jobDescription: "Synthetic role for local testing.",
      privacyMode: "standard",
      scoringConfig: {
        requiredSkills: [],
        niceToHaveSkills: [],
        domainContext: [],
      },
    });

    const upload = await candidates.createUpload({
      analysisId: analysis.id,
      displayName: "Synthetic Candidate",
      originalFilename: "synthetic-cv.txt",
      contentType: "text/plain",
      sizeBytes: 512,
    });

    expect(upload.candidate.analysisId).toBe(analysis.id);
    expect(upload.document.originalFilename).toBe("synthetic-cv.txt");
    expect(upload.document.storagePath).toBeNull();
    expect(JSON.stringify(upload)).not.toContain(
      "Synthetic role for local testing.",
    );
    db.close();
  });
});
