import type { NextRequest } from "next/server";
import {
  createRequestId,
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { createAnalysisSchema } from "@/lib/validation";
import { analysisService } from "@/server/services/analysis-service";

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      {
        code: "invalid_json",
        message: "Request body must be valid JSON.",
      },
      { status: 400, requestId },
    );
  }

  const parsed = createAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error, requestId);
  }

  const analysis = await analysisService.createAnalysis(parsed.data);

  return successResponse(
    {
      analysisId: analysis.id,
      status: analysis.status,
    },
    {
      status: 201,
      requestId,
      headers: {
        Location: `/api/analyses/${analysis.id}`,
      },
    },
  );
}
