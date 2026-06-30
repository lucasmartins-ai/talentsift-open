import { describe, expect, it } from "vitest";
import { createErrorEnvelope, createSuccessEnvelope } from "@/lib/api-response";

describe("API response helper", () => {
  it("creates a success envelope", () => {
    const envelope = createSuccessEnvelope(
      { analysisId: "anlz_synthetic", status: "draft" },
      "req_test",
    );

    expect(envelope).toEqual({
      success: true,
      data: { analysisId: "anlz_synthetic", status: "draft" },
      meta: { requestId: "req_test" },
    });
  });

  it("creates an error envelope", () => {
    const envelope = createErrorEnvelope(
      {
        code: "validation_error",
        message: "Request validation failed.",
      },
      "req_test",
    );

    expect(envelope).toEqual({
      success: false,
      error: {
        code: "validation_error",
        message: "Request validation failed.",
      },
      meta: { requestId: "req_test" },
    });
  });
});
