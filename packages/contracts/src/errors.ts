import type { SafeError, SafeErrorCode } from "./index";
/** Creates privacy-safe versioned errors without internal diagnostics. */
export function safeError(code: SafeErrorCode, correlationId: string): SafeError {
  const messages: Record<SafeErrorCode, string> = {
    validation_error: "The request is invalid.",
    forbidden: "You do not have permission.",
    not_found: "The resource was not found.",
    conflict: "The resource changed; refresh and retry.",
    service_unavailable: "The service is temporarily unavailable; retry later."
  };
  return { code, message: messages[code], correlationId };
}
