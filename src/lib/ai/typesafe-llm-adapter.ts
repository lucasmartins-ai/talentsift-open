import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  ConfidenceLevel,
  ExtractedProfile,
  SeniorityLevel,
} from "@/types/domain";
import type {
  LlmAdapter,
  LlmExtractionRequest,
  LlmExtractionResponse,
} from "./llm-adapter";
import { mockLlmAdapter } from "./mock-llm-adapter";

let cachedApiKey: string | null = null;

function resolveTypeSafeKey(): string | null {
  if (cachedApiKey) return cachedApiKey;
  if (process.env.TYPESAFE_API_KEY && process.env.TYPESAFE_API_KEY.trim().length > 0) {
    cachedApiKey = process.env.TYPESAFE_API_KEY.trim();
    return cachedApiKey;
  }
  try {
    const key = execSync("security find-generic-password -s \"typesafe\" -w", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 1500,
    }).trim();
    if (key.length > 0) {
      cachedApiKey = key;
      return cachedApiKey;
    }
  } catch {}
  return null;
}

/** Canonical fleet ledger (shared LOOKAORCHESTRATOR file); never throws, no-op off-Mac. */
const LEDGER_FILE =
  process.env.TYPESAFE_LEDGER_PATH ??
  path.join(os.homedir(), "Downloads", "LOOKAORCHESTRATOR", "logs", "typesafe", "jev.jsonl");

function ledger(entry: Record<string, unknown>): void {
  try {
    fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
    fs.appendFileSync(LEDGER_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // ledger must never break extraction
  }
}

export class TypeSafeLlmAdapter implements LlmAdapter {
  constructor(private readonly apiKeyResolver: () => string | null = resolveTypeSafeKey) {}

  async extractProfile(
    request: LlmExtractionRequest,
  ): Promise<LlmExtractionResponse> {
    const text = request.candidateText.trim();
    if (text.length === 0) {
      return mockLlmAdapter.extractProfile(request);
    }

    const apiKey = this.apiKeyResolver();
    if (!apiKey) {
      return mockLlmAdapter.extractProfile(request);
    }

    // API contract (probed 22/09): `type` must be lowercase ("Choice" → HTTP 400,
    // which silently forced the mock adapter on every keyed call); answers live
    // in `data.answers`, never `data.predictions`.
    const startedAt = Date.now();
    const statePayload = {
      jobDescription: request.jobDescription.slice(0, 1500),
      candidateResumeText: text.slice(0, 2500),
    };
    try {
      const response = await fetch("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: "jev-latest",
          state: statePayload,
          questions: {
            seniority: {
              type: "choice",
              instructions:
                "Determine the candidate's professional seniority level based on their experience and technical scope.",
              criteria: {
                intern: "Currently in school or seeking initial student internship/co-op placement.",
                junior: "1-2 years of software development experience or early-career contributor.",
                mid: "3-5 years of autonomous production feature delivery and core system work.",
                senior: "5+ years of extensive system design, mentoring, cross-functional delivery, or architectural ownership.",
                lead: "Staff, principal, or tech lead directing teams, complex architectures, or strategic roadmaps.",
                manager: "Engineering manager or head of engineering focused on people, process, and delivery execution.",
              },
            },
            yearsExperienceRange: {
              type: "choice",
              instructions:
                "How many years of relevant software engineering or professional industry experience does the candidate demonstrate?",
              criteria: {
                "0": "Less than 1 year or student",
                "2": "1 to 2 years",
                "4": "3 to 4 years",
                "6": "5 to 7 years",
                "9": "8 to 10 years",
                "12": "11+ years",
              },
            },
            evidenceConfidence: {
              type: "choice",
              instructions:
                "Assess the quality, detail, and concrete evidence provided in the candidate resume/text.",
              criteria: {
                high: "Contains detailed project bullets, technologies, metrics, and clear chronology.",
                medium: "Contains moderate descriptions or summaries with adequate context.",
                low: "Very sparse text, missing details, or vague claims.",
              },
            },
            matchScore: {
              type: "score",
              instructions:
                "Rate how closely the candidate's background matches the requirements of the job description.",
              criteria: ["1", "2", "3", "4", "5"],
            },
            meetsRequirements: {
              type: "noul",
              instructions:
                "Does this candidate satisfy the core technical qualifications specified in the job description?",
            },
          },
        }),
      });

      if (!response.ok) {
        ledger({
          ts: new Date().toISOString(),
          feature: "talentsift_extraction",
          model: "jev-latest",
          status: "error",
          http_status: response.status,
          latency_ms: Date.now() - startedAt,
          state_chars: JSON.stringify(statePayload).length,
          error: (await response.text().catch(() => "")).slice(0, 300),
        });
        return mockLlmAdapter.extractProfile(request);
      }

      const result = await response.json();
      const answers = result.answers ?? {};
      ledger({
        ts: new Date().toISOString(),
        feature: "talentsift_extraction",
        model: result.model ?? "jev-latest",
        status: "ok",
        latency_ms: Date.now() - startedAt,
        input_tokens: result.usage?.input_tokens ?? 0,
        output_tokens: result.usage?.output_tokens ?? 0,
        state_chars: JSON.stringify(statePayload).length,
        answers,
      });

      // Fallback base extraction for skills & contact info
      const baseResult = await mockLlmAdapter.extractProfile(request);
      const baseProfile = baseResult.profile;

      // Extract calibrated seniority
      let seniority: SeniorityLevel | null = baseProfile.seniority;
      if (answers.seniority?.choice) {
        seniority = answers.seniority.choice as SeniorityLevel;
      }

      // Extract calibrated years
      let yearsExperience: number | null = baseProfile.yearsExperience;
      if (answers.yearsExperienceRange?.choice) {
        const parsedYears = parseInt(answers.yearsExperienceRange.choice, 10);
        if (!isNaN(parsedYears)) {
          yearsExperience = Math.max(yearsExperience ?? 0, parsedYears);
        }
      }

      // Extract calibrated confidence
      let confidence: ConfidenceLevel = baseProfile.confidence;
      if (answers.evidenceConfidence?.choice) {
        confidence = answers.evidenceConfidence.choice as ConfidenceLevel;
      }

      const warnings: string[] = [...baseResult.warnings];
      if ((answers.meetsRequirements?.noul ?? 1) < 0.5) {
        warnings.push("Candidate may not meet all core qualifications specified in the job description.");
      }

      const profile: ExtractedProfile = {
        ...baseProfile,
        seniority,
        yearsExperience,
        confidence,
        modelMetadata: {
          provider: "typesafe",
          model: "jev-latest",
        },
      };

      return {
        profile,
        warnings,
      };
    } catch (err) {
      ledger({
        ts: new Date().toISOString(),
        feature: "talentsift_extraction",
        model: "jev-latest",
        status: "error",
        latency_ms: Date.now() - startedAt,
        state_chars: JSON.stringify(statePayload).length,
        error: String((err as Error)?.message ?? err).slice(0, 300),
      });
      return mockLlmAdapter.extractProfile(request);
    }
  }
}

export const typesafeLlmAdapter = new TypeSafeLlmAdapter();
