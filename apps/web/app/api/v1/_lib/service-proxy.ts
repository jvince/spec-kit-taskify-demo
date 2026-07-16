import { resolveActor } from "@taskify/validation/src/actor";
import { errorResponse } from "./response";
import { isLocalDemo } from "./deployment-mode";

const ORIGIN_PATTERN = /^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i;
const CREDENTIAL_PATTERN = /^[A-Za-z0-9_-]{24,128}$/;

/** Resolves the private upstream for one versioned resource without exposing it to browsers. */
function serviceOrigin(path: readonly string[]): string | undefined {
  if (path[0] === "projects") return process.env.TASKIFY_PROJECT_SERVICE_ORIGIN;
  if (path[0] === "tasks")
    return path[2] === "comments"
      ? process.env.TASKIFY_COLLABORATION_SERVICE_ORIGIN
      : process.env.TASKIFY_TASK_BOARD_SERVICE_ORIGIN;
  if (path[0] === "notifications") return process.env.TASKIFY_NOTIFICATION_SERVICE_ORIGIN;
  return undefined;
}

/** Forwards an authorized v1 request to its owning service while preserving opaque response bodies. */
export async function proxyServiceRequest(
  request: Request,
  path: readonly string[]
): Promise<Response> {
  if (!isLocalDemo() || !resolveActor(request.headers.get("X-Actor-Id")))
    return errorResponse("forbidden", 403);
  const origin = serviceOrigin(path);
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !ORIGIN_PATTERN.test(origin)) return errorResponse("not_found", 404);
  if (!credential || !CREDENTIAL_PATTERN.test(credential)) return errorResponse("forbidden", 403);

  const headers = new Headers({
    "X-Actor-Id": request.headers.get("X-Actor-Id") ?? "",
    "X-Service-Credential": credential
  });
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  const lastEventId = request.headers.get("Last-Event-ID");
  if (lastEventId) headers.set("Last-Event-ID", lastEventId);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const response = await fetch(new URL(`/v1/${path.map(encodeURIComponent).join("/")}`, origin), {
    method: request.method,
    headers,
    body,
    cache: "no-store"
  });
  return new Response(response.body, { status: response.status, headers: response.headers });
}
