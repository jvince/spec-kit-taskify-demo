import { proxyServiceRequest } from "../../_lib/service-proxy";
/** Opens a recipient-specific SSE connection through the backend-for-frontend. */
export function GET(request: Request) {
  return proxyServiceRequest(request, ["notifications", "stream"]);
}
