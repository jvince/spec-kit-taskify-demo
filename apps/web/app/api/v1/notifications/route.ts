import { proxyServiceRequest } from "../_lib/service-proxy";
/** Lists only notifications owned by the validated active actor. */
export function GET(request: Request) {
  return proxyServiceRequest(request, ["notifications"]);
}
