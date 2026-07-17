import { proxyServiceRequest } from "../../_lib/service-proxy";
/** Opens a recipient-specific SSE connection through the backend-for-frontend. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set("X-Actor-Id", url.searchParams.get("actorId") ?? "");
  return proxyServiceRequest(new Request(request, { headers }), ["notifications", "stream"]);
}
