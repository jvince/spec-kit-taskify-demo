import { proxyServiceRequest } from "../../_lib/service-proxy";

/** Applies an assignment or status patch through the task-board-service boundary. */
export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  return proxyServiceRequest(request, ["tasks", taskId]);
}
