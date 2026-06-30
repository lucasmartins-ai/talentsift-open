import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mockLlmAdapter } from "@/lib/ai/mock-llm-adapter";
import { textCandidateParser } from "@/lib/parsing/text-parser";
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
};

describe("mock extraction -> ranking", () => {
  it("extracts known skills from text and ranks them", async () => {
    const { profile, warnings } = await mockLlmAdapter.extractProfile({
      jobDescription: "Senior engineer",
      candidateText: syntheticCv,
    });

    const skillNames = profile.skills.map((skill) => skill.name);
    expect(skillNames).toEqual(
      expect.arrayContaining(["TypeScript", "React", "PostgreSQL"]),
    );
    expect(profile.location).toBe("Remote");
    expect(profile.availability).toBe("Immediate");
    expect(warnings).toHaveLength(0);

    const ranking = rankCandidate({ scoringConfig, profile });
    expect(ranking.score).toBeGreaterThan(40);
    expect(ranking.matchedSkills).toEqual(
      expect.arrayContaining(["TypeScript", "React"]),
    );
  });

  it("flags PDF as unsupported and yields an empty extraction", async () => {
    const parsed = await textCandidateParser.parse({
      contentType: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7 ..."),
    });
    expect(parsed.text).toBe("");
    expect(parsed.warnings[0]?.code).toBe("pdf_not_supported");

    const { profile } = await mockLlmAdapter.extractProfile({
      jobDescription: "Senior engineer",
      candidateText: parsed.text,
    });
    expect(profile.skills).toHaveLength(0);
    expect(profile.confidence).toBe("low");
  });
});
