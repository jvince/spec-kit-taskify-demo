import { proxyServiceRequest } from "../_lib/service-proxy";
/** Fails closed outside local demo mode before proxying versioned API requests. */
async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyServiceRequest(request, path);
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
