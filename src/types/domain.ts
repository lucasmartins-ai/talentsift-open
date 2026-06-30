export const privacyModes = [
  "standard",
  "delete_source_after_analysis",
] as const;
export type PrivacyMode = (typeof privacyModes)[number];

export const confidenceLevels = ["low", "medium", "high"] as const;
export type ConfidenceLevel = (typeof confidenceLevels)[number];

export const analysisStatuses = [
  "draft",
  "processing",
  "complete",
  "failed",
] as const;
export type AnalysisStatus = (typeof analysisStatuses)[number];

export const candidateStatuses = [
  "uploaded",
  "parsed",
  "ranked",
  "failed",
] as const;
export type CandidateStatus = (typeof candidateStatuses)[number];

export const seniorityLevels = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
  "manager",
] as const;
export type SeniorityLevel = (typeof seniorityLevels)[number];

export const scoreCriteria = [
  "requiredSkills",
  "relevantExperience",
  "seniorityFit",
  "niceToHaveSkills",
  "domainContext",
  "locationAvailability",
  "evidenceQuality",
] as const;
export type ScoreCriterion = (typeof scoreCriteria)[number];

export type ScoreBreakdownItem = {
  score: number;
  maxScore: number;
  rationale: string;
  evidence: string[];
};

export type ScoreBreakdown = Record<ScoreCriterion, ScoreBreakdownItem>;

export type SkillEvidence = {
  name: string;
  evidence: string[];
  confidence: ConfidenceLevel;
};

export type ScoringConfig = {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: SeniorityLevel;
  location?: string;
  availability?: string;
  domainContext: string[];
  minimumYearsExperience?: number;
};

export type Analysis = {
  id: string;
  userId: string | null;
  jobDescription: string;
  scoringConfig: ScoringConfig;
  privacyMode: PrivacyMode;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type Candidate = {
  id: string;
  analysisId: string;
  displayName: string;
  status: CandidateStatus;
  parserWarnings: string[];
  createdAt: string;
};

export type CandidateDocument = {
  id: string;
  candidateId: string;
  storagePath: string | null;
  originalFilename: string;
  contentType: "application/pdf" | "text/plain";
  sizeBytes: number;
  retentionStatus: "stored" | "deleted" | "delete_failed";
  deletedAt: string | null;
};

export type ExtractedProfile = {
  id?: string;
  candidateId?: string;
  candidateName: string | null;
  skills: SkillEvidence[];
  yearsExperience: number | null;
  seniority: SeniorityLevel | null;
  location: string | null;
  availability: string | null;
  currentRole: string | null;
  strengths: string[];
  gaps: string[];
  confidence: ConfidenceLevel;
  modelMetadata?: {
    provider?: string;
    model?: string;
    tokenUsage?: {
      inputTokens?: number;
      outputTokens?: number;
    };
  };
  createdAt?: string;
};

export type RankingResult = {
  id?: string;
  analysisId?: string;
  candidateId?: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingRequirements: string[];
  justification: string;
  confidence: ConfidenceLevel;
  reviewFlags: string[];
  createdAt?: string;
};

export type RankingInput = {
  scoringConfig: ScoringConfig;
  profile: ExtractedProfile;
};
