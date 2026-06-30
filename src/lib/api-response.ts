import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiErrorBody;
  meta: {
    requestId: string;
  };
};

export function createRequestId() {
  return `req_${randomUUID()}`;
}

export function createSuccessEnvelope<T>(
  data: T,
  requestId = createRequestId(),
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId,
    },
  };
}

export function createErrorEnvelope(
  error: ApiErrorBody,
  requestId = createRequestId(),
): ApiResponse<never> {
  return {
    success: false,
    error,
    meta: {
      requestId,
    },
  };
}

export function successResponse<T>(
  data: T,
  options: {
    status?: number;
    requestId?: string;
    headers?: HeadersInit;
  } = {},
) {
  return NextResponse.json(createSuccessEnvelope(data, options.requestId), {
    status: options.status ?? 200,
    headers: options.headers,
  });
}

export function errorResponse(
  error: ApiErrorBody,
  options: {
    status?: number;
    requestId?: string;
    headers?: HeadersInit;
  } = {},
) {
  return NextResponse.json(createErrorEnvelope(error, options.requestId), {
    status: options.status ?? 400,
    headers: options.headers,
  });
}

export function validationErrorResponse(error: ZodError, requestId: string) {
  return errorResponse(
    {
      code: "validation_error",
      message: "Request validation failed.",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    },
    { status: 400, requestId },
  );
}
