import { z } from "zod";
import { privacyModes, seniorityLevels } from "@/types/domain";

export const privacyModeSchema = z.enum(privacyModes);
export const senioritySchema = z.enum(seniorityLevels);

const normalizedString = z.string().trim();

const skillListSchema = z
  .array(normalizedString.min(1).max(80))
  .max(80)
  .default([]);

export const scoringConfigSchema = z
  .object({
    requiredSkills: skillListSchema,
    niceToHaveSkills: skillListSchema,
    seniority: senioritySchema.optional(),
    location: normalizedString.min(1).max(120).optional(),
    availability: normalizedString.min(1).max(120).optional(),
    domainContext: z
      .array(normalizedString.min(1).max(120))
      .max(30)
      .default([]),
    minimumYearsExperience: z.number().int().min(0).max(60).optional(),
  })
  .default({
    requiredSkills: [],
    niceToHaveSkills: [],
    domainContext: [],
  });

export const createAnalysisSchema = z.object({
  jobDescription: normalizedString
    .min(1, "Job description is required.")
    .max(20000),
  privacyMode: privacyModeSchema.default("standard"),
  scoringConfig: scoringConfigSchema,
});

export const analysisIdSchema = z
  .string()
  .trim()
  .min(4)
  .max(80)
  .regex(/^[A-Za-z0-9_-]+$/);

export const uploadMetadataSchema = z.object({
  originalFilename: normalizedString.min(1).max(240),
  contentType: z.enum(["application/pdf", "text/plain"]),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
  candidateLabel: normalizedString.min(1).max(120).optional(),
});

export const resultFiltersSchema = z.object({
  skill: normalizedString.min(1).max(80).optional(),
  seniority: senioritySchema.optional(),
  location: normalizedString.min(1).max(120).optional(),
  availability: normalizedString.min(1).max(120).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
});

export const csvExportFields = [
  "candidateName",
  "score",
  "seniority",
  "location",
  "matchedSkills",
  "gaps",
  "justification",
  "confidence",
] as const;

export const exportCsvSchema = z.object({
  fields: z
    .array(z.enum(csvExportFields))
    .min(1)
    .default([...csvExportFields]),
  includeReviewFlags: z.boolean().default(true),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;
export type ResultFiltersInput = z.infer<typeof resultFiltersSchema>;
export type ExportCsvInput = z.infer<typeof exportCsvSchema>;
