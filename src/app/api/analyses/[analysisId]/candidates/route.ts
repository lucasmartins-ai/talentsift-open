import type { NextRequest } from "next/server";
import {
  createRequestId,
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { analysisIdSchema, uploadMetadataSchema } from "@/lib/validation";
import { candidateService } from "@/server/services/candidate-service";
import { ServiceError } from "@/server/services/errors";

type CandidateRouteContext = {
  params: Promise<{
    analysisId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: CandidateRouteContext,
) {
  const requestId = createRequestId();
  const { analysisId } = await params;
  const parsedAnalysisId = analysisIdSchema.safeParse(analysisId);

  if (!parsedAnalysisId.success) {
    return validationErrorResponse(parsedAnalysisId.error, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      {
        code: "invalid_json",
        message: "Request body must be valid JSON metadata.",
      },
      { status: 400, requestId },
    );
  }

  const parsedBody = uploadMetadataSchema.safeParse(body);
  if (!parsedBody.success) {
    return validationErrorResponse(parsedBody.error, requestId);
  }

  try {
    const { candidate, document, ranking, warnings } =
      await candidateService.createUploadMetadata(
        parsedAnalysisId.data,
        parsedBody.data,
      );

    return successResponse(
      {
        candidateId: candidate.id,
        documentId: document.id,
        status: candidate.status,
        ranking,
        warnings,
      },
      { status: 201, requestId },
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return errorResponse(
        {
          code: error.code,
          message: error.publicMessage,
        },
        { status: error.statusCode, requestId },
      );
    }

    return errorResponse(
      {
        code: "internal_error",
        message: "An unexpected error occurred.",
      },
      { status: 500, requestId },
    );
  }
}
