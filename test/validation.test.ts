import { describe, expect, it } from "vitest";
import { createAnalysisSchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("rejects an empty job description", () => {
    const result = createAnalysisSchema.safeParse({
      jobDescription: "   ",
      privacyMode: "standard",
      scoringConfig: {
        requiredSkills: [],
        niceToHaveSkills: [],
        domainContext: [],
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid privacy mode", () => {
    const result = createAnalysisSchema.safeParse({
      jobDescription: "Hiring a product-minded full-stack engineer.",
      privacyMode: "delete_everything_without_review",
      scoringConfig: {
        requiredSkills: ["TypeScript"],
        niceToHaveSkills: [],
        domainContext: [],
      },
    });

    expect(result.success).toBe(false);
  });
});
