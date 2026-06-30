import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }

  return value;
}, z.boolean());

const integerFromEnv = (defaultValue: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") {
      return defaultValue;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    return value;
  }, z.number().int().positive());

export const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .preprocess(
      (value) =>
        value === undefined || value === "" ? "http://localhost:3000" : value,
      z.string().url(),
    )
    .default("http://localhost:3000"),
  DATA_BACKEND: z
    .preprocess(
      (value) => (value === undefined || value === "" ? "sqlite" : value),
      z.enum(["sqlite", "memory"]),
    )
    .default("sqlite"),
  SQLITE_DATABASE_PATH: z
    .preprocess(
      (value) =>
        value === undefined || value === ""
          ? "data/talentsift-open.sqlite"
          : value,
      z.string().min(1),
    )
    .default("data/talentsift-open.sqlite"),
  MAX_CV_UPLOAD_MB: integerFromEnv(10).default(10),
  MAX_CVS_PER_ANALYSIS: integerFromEnv(50).default(50),
  LLM_PROVIDER: z
    .preprocess(
      (value) => (value === undefined || value === "" ? "mock" : value),
      z.enum(["mock"]),
    )
    .default("mock"),
  LLM_MODEL: optionalString,
  PRIVACY_DELETE_SOURCE_DOCUMENTS: booleanFromEnv.default(true),
  ANALYSIS_RETENTION_HOURS: integerFromEnv(168).default(168),
  CSV_EXPORT_ENABLED: booleanFromEnv.default(true),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getServerEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(env);
}
