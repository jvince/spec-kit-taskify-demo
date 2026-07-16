import { safeError } from "@taskify/contracts/src/errors";
import { createCorrelationId } from "@taskify/contracts/src/tracing";
/** Returns a safe JSON error response with an opaque correlation id. */
export function errorResponse(
  code: "validation_error" | "forbidden" | "not_found" | "conflict",
  status: number
) {
  return Response.json(safeError(code, createCorrelationId()), { status });
}
