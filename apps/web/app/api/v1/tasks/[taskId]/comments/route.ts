import { proxyServiceRequest } from "../../../_lib/service-proxy";

/** Lists immutable comments through the collaboration-service boundary. */
export async function GET(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  return proxyServiceRequest(request, ["tasks", taskId, "comments"]);
}

/** Adds one permanent attributed comment through the collaboration-service boundary. */
export async function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  return proxyServiceRequest(request, ["tasks", taskId, "comments"]);
}

/** Explicitly reports that comments cannot be changed after creation. */
export function PATCH() {
  return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
}

export const DELETE = PATCH;
