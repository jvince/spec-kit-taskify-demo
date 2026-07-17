import { proxyServiceRequest } from "../../_lib/service-proxy";

/** Returns one project through the validated project-service boundary. */
export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  return proxyServiceRequest(request, ["projects", projectId]);
}
