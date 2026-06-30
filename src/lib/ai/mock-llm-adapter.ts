import type {
  ConfidenceLevel,
  ExtractedProfile,
  SeniorityLevel,
  SkillEvidence,
} from "@/types/domain";
import type {
  LlmAdapter,
  LlmExtractionRequest,
  LlmExtractionResponse,
} from "./llm-adapter";

// Deterministic vocabulary scan, not real NLP. This keeps the portfolio demo
// runnable without external keys while preserving the LlmAdapter boundary.
// Upgrade path: replace this class with a real provider behind the same
// interface and validate structured output before ranking.
const SKILL_VOCAB = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "GraphQL",
  "REST",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CSS",
  "HTML",
  "Tailwind",
  "Vue",
  "Svelte",
  "Django",
  "FastAPI",
] as const;

const SENIORITY_KEYWORDS: Array<{ level: SeniorityLevel; terms: string[] }> = [
  { level: "manager", terms: ["engineering manager", "head of", "manager"] },
  { level: "lead", terms: ["lead", "principal", "staff"] },
  { level: "senior", terms: ["senior", "sr."] },
  { level: "junior", terms: ["junior", "jr."] },
  { level: "intern", terms: ["intern", "internship"] },
];

const ACTION_VERB =
  /^(built|led|used|designed|shipped|owned|created|developed)/i;

export class MockLlmAdapter implements LlmAdapter {
  async extractProfile(
    request: LlmExtractionRequest,
  ): Promise<LlmExtractionResponse> {
    const text = request.candidateText.trim();
    if (text.length === 0) {
      return {
        profile: emptyProfile(),
        warnings: ["No candidate text was available for extraction."],
      };
    }

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const haystack = text.toLowerCase();

    const skills = extractSkills(text, lines);
    const yearsExperience = extractYears(haystack);
    const seniority = extractSeniority(haystack);

    const confidence = deriveConfidence(skills.length, text.length);
    const warnings: string[] = [];
    if (skills.length === 0) {
      warnings.push("No known skills were recognized in the document.");
    }

    return {
      profile: {
        candidateName: null,
        skills,
        yearsExperience,
        seniority,
        location: extractLabeled(lines, ["location"]) ?? detectRemote(haystack),
        availability: extractLabeled(lines, ["availability", "notice"]),
        currentRole: extractRole(lines),
        strengths: skills.slice(0, 3).map((skill) => skill.name),
        gaps: [],
        confidence,
        modelMetadata: { provider: "mock", model: "vocab-scan" },
      },
      warnings,
    };
  }
}

export const mockLlmAdapter = new MockLlmAdapter();

function extractSkills(text: string, lines: string[]): SkillEvidence[] {
  return SKILL_VOCAB.flatMap((skill) => {
    const pattern = new RegExp(
      `(^|[^\\w.])${escapeRegExp(skill)}([^\\w]|$)`,
      "i",
    );
    if (!pattern.test(text)) {
      return [];
    }
    const evidence = lines.filter((line) => pattern.test(line)).slice(0, 2);
    const confidence: ConfidenceLevel = evidence.some((line) =>
      ACTION_VERB.test(line.replace(/^[-•*]\s*/, "")),
    )
      ? "high"
      : "medium";
    return [{ name: skill, evidence, confidence }];
  });
}

function extractYears(haystack: string): number | null {
  const matches = [...haystack.matchAll(/(\d{1,2})\s*\+?\s*years?/g)];
  if (matches.length === 0) {
    return null;
  }
  return Math.max(...matches.map((match) => Number(match[1])));
}

function extractSeniority(haystack: string): SeniorityLevel | null {
  for (const { level, terms } of SENIORITY_KEYWORDS) {
    if (terms.some((term) => haystack.includes(term))) {
      return level;
    }
  }
  return null;
}

function extractLabeled(lines: string[], labels: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (
      match &&
      labels.some((label) => match[1].toLowerCase().includes(label))
    ) {
      return match[2].trim().replace(/[.,;]+$/, "");
    }
  }
  return null;
}

function detectRemote(haystack: string): string | null {
  return haystack.includes("remote") ? "Remote" : null;
}

function extractRole(lines: string[]): string | null {
  const roleWords =
    /(engineer|developer|designer|manager|architect|analyst|scientist|lead)/i;
  return lines.find((line) => roleWords.test(line)) ?? lines[0] ?? null;
}

function deriveConfidence(
  skillCount: number,
  textLength: number,
): ConfidenceLevel {
  if (skillCount === 0 || textLength < 80) {
    return "low";
  }
  return skillCount >= 3 ? "high" : "medium";
}

function emptyProfile(): ExtractedProfile {
  return {
    candidateName: null,
    skills: [],
    yearsExperience: null,
    seniority: null,
    location: null,
    availability: null,
    currentRole: null,
    strengths: [],
    gaps: [],
    confidence: "low",
    modelMetadata: { provider: "mock", model: "vocab-scan" },
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
