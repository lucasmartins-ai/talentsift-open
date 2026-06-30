import type {
  ConfidenceLevel,
  ExtractedProfile,
  RankingInput,
  RankingResult,
  ScoreBreakdown,
  ScoreBreakdownItem,
  ScoringConfig,
  SeniorityLevel,
  SkillEvidence,
} from "@/types/domain";

const WEIGHTS = {
  requiredSkills: 35,
  relevantExperience: 20,
  seniorityFit: 10,
  niceToHaveSkills: 10,
  domainContext: 10,
  locationAvailability: 10,
  evidenceQuality: 5,
} as const;

const SENIORITY_RANK: Record<SeniorityLevel, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  manager: 5,
};

const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = {
  low: 0.25,
  medium: 0.65,
  high: 1,
};

export function rankCandidate(input: RankingInput): RankingResult {
  const reviewFlags: string[] = [];
  const requiredSkills = scoreSkills(
    input.scoringConfig.requiredSkills,
    input.profile.skills,
    WEIGHTS.requiredSkills,
    "Required skill",
  );
  const niceToHaveSkills = scoreSkills(
    input.scoringConfig.niceToHaveSkills,
    input.profile.skills,
    WEIGHTS.niceToHaveSkills,
    "Nice-to-have skill",
  );
  const relevantExperience = scoreExperience(
    input.scoringConfig,
    input.profile,
    reviewFlags,
  );
  const seniorityFit = scoreSeniority(input.scoringConfig, input.profile);
  const domainContext = scoreDomainContext(input.scoringConfig, input.profile);
  const locationAvailability = scoreLocationAvailability(
    input.scoringConfig,
    input.profile,
    reviewFlags,
  );
  const evidenceQuality = scoreEvidenceQuality(input.profile, reviewFlags);

  const scoreBreakdown: ScoreBreakdown = {
    requiredSkills,
    relevantExperience,
    seniorityFit,
    niceToHaveSkills,
    domainContext,
    locationAvailability,
    evidenceQuality,
  };

  const missingRequirements = [
    ...requiredSkills.missing,
    ...locationAvailability.missing,
    ...domainContext.missing,
  ];
  if (seniorityFit.missing.length > 0) {
    missingRequirements.push(...seniorityFit.missing);
  }

  if (requiredSkills.missing.length > 0) {
    reviewFlags.push("Review missing required skill evidence.");
  }

  const score = clampScore(
    Object.values(scoreBreakdown).reduce(
      (total, item) => total + item.score,
      0,
    ),
  );
  const matchedSkills = [
    ...requiredSkills.matched,
    ...niceToHaveSkills.matched,
  ];

  return {
    score,
    scoreBreakdown,
    matchedSkills,
    missingRequirements,
    justification: buildJustification(
      score,
      matchedSkills,
      missingRequirements,
    ),
    confidence: deriveConfidence(
      score,
      input.profile.confidence,
      evidenceQuality.score,
    ),
    reviewFlags: [...new Set(reviewFlags)],
  };
}

type InternalBreakdown = ScoreBreakdownItem & {
  matched: string[];
  missing: string[];
};

function scoreSkills(
  expectedSkills: string[],
  candidateSkills: SkillEvidence[],
  maxScore: number,
  label: string,
): InternalBreakdown {
  if (expectedSkills.length === 0) {
    return {
      score: maxScore,
      maxScore,
      rationale: `${label} criteria were not configured.`,
      evidence: [],
      matched: [],
      missing: [],
    };
  }

  const matches = expectedSkills.map((expectedSkill) => {
    const skill = findSkill(candidateSkills, expectedSkill);
    return {
      expectedSkill,
      skill,
      strength: skill ? skillMatchStrength(skill) : 0,
    };
  });
  const score = roundToOneDecimal(
    (matches.reduce((total, match) => total + match.strength, 0) /
      expectedSkills.length) *
      maxScore,
  );
  const matched = matches
    .filter((match) => match.skill)
    .map((match) => match.expectedSkill);
  const missing = matches
    .filter((match) => !match.skill)
    .map((match) => `No clear evidence for ${match.expectedSkill}.`);
  const evidence = matches.flatMap((match) => match.skill?.evidence ?? []);

  return {
    score,
    maxScore,
    rationale: `${matched.length} of ${expectedSkills.length} ${label.toLowerCase()} criteria had evidence.`,
    evidence,
    matched,
    missing,
  };
}

function scoreExperience(
  config: ScoringConfig,
  profile: ExtractedProfile,
  reviewFlags: string[],
): ScoreBreakdownItem {
  if (config.minimumYearsExperience === undefined) {
    return {
      score: WEIGHTS.relevantExperience,
      maxScore: WEIGHTS.relevantExperience,
      rationale: "Experience threshold was not configured.",
      evidence: evidenceFromText(profile.currentRole),
    };
  }

  if (profile.yearsExperience === null) {
    reviewFlags.push(
      "Review experience manually because years were not clear.",
    );
    return {
      score: 8,
      maxScore: WEIGHTS.relevantExperience,
      rationale: "Years of experience were not clear enough for a full match.",
      evidence: evidenceFromText(profile.currentRole),
    };
  }

  const ratio = Math.min(
    profile.yearsExperience / config.minimumYearsExperience,
    1,
  );
  return {
    score: roundToOneDecimal(ratio * WEIGHTS.relevantExperience),
    maxScore: WEIGHTS.relevantExperience,
    rationale: `${profile.yearsExperience} years compared with ${config.minimumYearsExperience} requested years.`,
    evidence: evidenceFromText(profile.currentRole),
  };
}

function scoreSeniority(
  config: ScoringConfig,
  profile: ExtractedProfile,
): InternalBreakdown {
  if (!config.seniority) {
    return {
      score: WEIGHTS.seniorityFit,
      maxScore: WEIGHTS.seniorityFit,
      rationale: "Seniority criterion was not configured.",
      evidence: evidenceFromText(profile.currentRole),
      matched: [],
      missing: [],
    };
  }

  if (!profile.seniority) {
    return {
      score: 5,
      maxScore: WEIGHTS.seniorityFit,
      rationale: "Seniority was not clearly extracted.",
      evidence: evidenceFromText(profile.currentRole),
      matched: [],
      missing: [`No clear ${config.seniority} seniority evidence.`],
    };
  }

  const distance = Math.abs(
    SENIORITY_RANK[config.seniority] - SENIORITY_RANK[profile.seniority],
  );
  const score =
    distance === 0 ? 10 : distance === 1 ? 7 : distance === 2 ? 4 : 1;

  return {
    score,
    maxScore: WEIGHTS.seniorityFit,
    rationale:
      distance === 0
        ? `Extracted seniority matches ${config.seniority}.`
        : `Extracted seniority is ${profile.seniority}; requested ${config.seniority}.`,
    evidence: evidenceFromText(profile.currentRole),
    matched: distance === 0 ? [config.seniority] : [],
    missing:
      distance === 0
        ? []
        : [`Seniority evidence differs from ${config.seniority}.`],
  };
}

function scoreDomainContext(
  config: ScoringConfig,
  profile: ExtractedProfile,
): InternalBreakdown {
  if (config.domainContext.length === 0) {
    return {
      score: WEIGHTS.domainContext,
      maxScore: WEIGHTS.domainContext,
      rationale: "Domain context was not configured.",
      evidence: [],
      matched: [],
      missing: [],
    };
  }

  const text = searchableProfileText(profile);
  const matched = config.domainContext.filter((term) =>
    text.includes(normalizeTerm(term)),
  );
  const missing = config.domainContext
    .filter((term) => !matched.includes(term))
    .map((term) => `No clear ${term} context evidence.`);

  return {
    score: roundToOneDecimal(
      (matched.length / config.domainContext.length) * WEIGHTS.domainContext,
    ),
    maxScore: WEIGHTS.domainContext,
    rationale: `${matched.length} of ${config.domainContext.length} domain/context criteria matched.`,
    evidence: [...profile.strengths, ...evidenceFromText(profile.currentRole)],
    matched,
    missing,
  };
}

function scoreLocationAvailability(
  config: ScoringConfig,
  profile: ExtractedProfile,
  reviewFlags: string[],
): InternalBreakdown {
  const requested = [
    config.location
      ? {
          label: "location",
          expected: config.location,
          actual: profile.location,
        }
      : null,
    config.availability
      ? {
          label: "availability",
          expected: config.availability,
          actual: profile.availability,
        }
      : null,
  ].filter(
    (
      item,
    ): item is { label: string; expected: string; actual: string | null } =>
      Boolean(item),
  );

  if (requested.length === 0) {
    return {
      score: WEIGHTS.locationAvailability,
      maxScore: WEIGHTS.locationAvailability,
      rationale: "Location and availability were not configured.",
      evidence: [],
      matched: [],
      missing: [],
    };
  }

  const maxPerCriterion = WEIGHTS.locationAvailability / requested.length;
  const matched = requested.filter(
    (item) =>
      item.actual !== null &&
      normalizeTerm(item.actual).includes(normalizeTerm(item.expected)),
  );
  const missing = requested
    .filter((item) => !matched.includes(item))
    .map((item) => `No clear ${item.label} match for ${item.expected}.`);

  if (missing.length > 0) {
    reviewFlags.push("Review location or availability constraints manually.");
  }

  return {
    score: roundToOneDecimal(matched.length * maxPerCriterion),
    maxScore: WEIGHTS.locationAvailability,
    rationale: `${matched.length} of ${requested.length} location/availability criteria matched.`,
    evidence: [profile.location, profile.availability].filter(
      (value): value is string => Boolean(value),
    ),
    matched: matched.map((item) => item.expected),
    missing,
  };
}

function scoreEvidenceQuality(
  profile: ExtractedProfile,
  reviewFlags: string[],
): ScoreBreakdownItem {
  const skillsWithEvidence = profile.skills.filter(
    (skill) => skill.evidence.length > 0,
  ).length;
  const evidenceRatio =
    profile.skills.length === 0
      ? 0.4
      : skillsWithEvidence / profile.skills.length;
  const confidence = CONFIDENCE_SCORE[profile.confidence];
  const score = roundToOneDecimal(
    Math.max(0.2, evidenceRatio * confidence) * WEIGHTS.evidenceQuality,
  );

  if (profile.confidence === "low" || evidenceRatio < 0.5) {
    reviewFlags.push("Review extraction confidence and evidence quality.");
  }

  return {
    score,
    maxScore: WEIGHTS.evidenceQuality,
    rationale: `${skillsWithEvidence} of ${profile.skills.length} skills include evidence snippets.`,
    evidence: profile.skills.flatMap((skill) => skill.evidence),
  };
}

function findSkill(skills: SkillEvidence[], expectedSkill: string) {
  const expected = normalizeTerm(expectedSkill);
  return skills.find((skill) => normalizeTerm(skill.name) === expected);
}

function skillMatchStrength(skill: SkillEvidence) {
  const confidenceStrength = CONFIDENCE_SCORE[skill.confidence];
  const evidenceStrength = skill.evidence.length > 0 ? 1 : 0.45;
  return Math.max(0.2, confidenceStrength * evidenceStrength);
}

function searchableProfileText(profile: ExtractedProfile) {
  return [
    ...profile.skills.map((skill) => skill.name),
    ...profile.strengths,
    profile.currentRole,
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeTerm)
    .join(" ");
}

function evidenceFromText(value: string | null) {
  return value ? [value] : [];
}

function buildJustification(
  score: number,
  matchedSkills: string[],
  missingRequirements: string[],
) {
  const matchText =
    matchedSkills.length > 0
      ? `Evidence found for ${matchedSkills.slice(0, 4).join(", ")}.`
      : "Limited direct skill evidence was found.";
  const gapText =
    missingRequirements.length > 0
      ? `Review gaps: ${missingRequirements.slice(0, 3).join(" ")}`
      : "No major configured gaps were detected in the structured evidence.";

  return `Score ${score}/100 for reviewer triage. ${matchText} ${gapText}`;
}

function deriveConfidence(
  score: number,
  extractionConfidence: ConfidenceLevel,
  evidenceScore: number,
): ConfidenceLevel {
  if (extractionConfidence === "high" && score >= 70 && evidenceScore >= 4) {
    return "high";
  }

  if (extractionConfidence === "low" || evidenceScore < 2 || score < 40) {
    return "low";
  }

  return "medium";
}

function normalizeTerm(value: string) {
  return value.trim().toLowerCase();
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
