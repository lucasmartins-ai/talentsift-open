import { describe, expect, it } from "vitest";
import { rankCandidate } from "@/lib/ranking/ranking";
import type { ExtractedProfile, ScoringConfig } from "@/types/domain";

const scoringConfig: ScoringConfig = {
  requiredSkills: ["TypeScript", "React", "PostgreSQL"],
  niceToHaveSkills: ["SQLite", "AI workflow design"],
  seniority: "senior",
  location: "Remote",
  availability: "Immediate",
  domainContext: ["SaaS"],
  minimumYearsExperience: 5,
};

function profileWithSkills(skillNames: string[]): ExtractedProfile {
  return {
    candidateName: "Synthetic Candidate",
    skills: skillNames.map((name) => ({
      name,
      evidence: [`Used ${name} in a recent project.`],
      confidence: "high",
    })),
    yearsExperience: 7,
    seniority: "senior",
    location: "Remote",
    availability: "Immediate",
    currentRole: "Senior engineer in a SaaS product team",
    strengths: ["Built production TypeScript services"],
    gaps: [],
    confidence: "high",
  };
}

describe("rankCandidate", () => {
  it("returns a score between 0 and 100", () => {
    const result = rankCandidate({
      scoringConfig,
      profile: profileWithSkills(["TypeScript", "React"]),
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.justification.length).toBeGreaterThan(0);
    expect(result.confidence).toMatch(/low|medium|high/);
  });

  it("increases the score when required skills match", () => {
    const weakResult = rankCandidate({
      scoringConfig,
      profile: profileWithSkills(["Customer support"]),
    });
    const strongerResult = rankCandidate({
      scoringConfig,
      profile: profileWithSkills(["TypeScript", "React", "PostgreSQL"]),
    });

    expect(strongerResult.score).toBeGreaterThan(weakResult.score);
    expect(strongerResult.matchedSkills).toEqual(
      expect.arrayContaining(["TypeScript", "React", "PostgreSQL"]),
    );
  });

  it("penalizes weak evidence without automatically zeroing the score", () => {
    const highEvidenceResult = rankCandidate({
      scoringConfig,
      profile: profileWithSkills(["TypeScript", "React"]),
    });
    const weakEvidenceProfile = {
      ...profileWithSkills(["TypeScript", "React"]),
      confidence: "low" as const,
      skills: profileWithSkills(["TypeScript", "React"]).skills.map(
        (skill) => ({
          ...skill,
          evidence: [],
          confidence: "low" as const,
        }),
      ),
    };
    const weakEvidenceResult = rankCandidate({
      scoringConfig,
      profile: weakEvidenceProfile,
    });

    expect(weakEvidenceResult.score).toBeGreaterThan(0);
    expect(weakEvidenceResult.score).toBeLessThan(highEvidenceResult.score);
    expect(weakEvidenceResult.reviewFlags.length).toBeGreaterThan(0);
  });
});
