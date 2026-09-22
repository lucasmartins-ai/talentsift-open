import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TypeSafeLlmAdapter, typesafeLlmAdapter } from "@/lib/ai/typesafe-llm-adapter";
import { rankCandidate } from "@/lib/ranking";
import type { ScoringConfig } from "@/types/domain";

const syntheticCv = readFileSync(
  fileURLToPath(new URL("./fixtures/synthetic-cv.txt", import.meta.url)),
  "utf-8",
);

const scoringConfig: ScoringConfig = {
  requiredSkills: ["TypeScript", "React", "PostgreSQL"],
  niceToHaveSkills: ["SQLite"],
  domainContext: ["SaaS"],
  location: "Remote",
  availability: "Immediate",
  seniority: "senior",
};

describe("TypeSafeLlmAdapter", () => {
  it("falls back gracefully when resolver returns null", async () => {
    const fallbackAdapter = new TypeSafeLlmAdapter(() => null);
    const { profile, warnings } = await fallbackAdapter.extractProfile({
      jobDescription: "Senior TypeScript Engineer with React and PostgreSQL experience.",
      candidateText: syntheticCv,
    });

    expect(profile.skills.length).toBeGreaterThan(0);
    expect(warnings).toBeDefined();
    expect(profile.modelMetadata?.provider).toBe("mock");
  });

  it("handles empty candidate text safely", async () => {
    const { profile, warnings } = await typesafeLlmAdapter.extractProfile({
      jobDescription: "Senior Engineer",
      candidateText: "   ",
    });

    expect(profile.skills).toHaveLength(0);
    expect(profile.confidence).toBe("low");
    expect(warnings).toContain("No candidate text was available for extraction.");
  });

  it("extracts and ranks candidate with real or mock adapter", async () => {
    const { profile, warnings } = await typesafeLlmAdapter.extractProfile({
      jobDescription: "Senior TypeScript Engineer with React and PostgreSQL experience.",
      candidateText: syntheticCv,
    });

    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.confidence).toMatch(/low|medium|high/);
    expect(warnings).toBeDefined();

    const ranking = rankCandidate({ scoringConfig, profile });
    expect(ranking.score).toBeGreaterThan(30);
    expect(ranking.scoreBreakdown).toBeDefined();
  });
});
