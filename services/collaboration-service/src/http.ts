import type Database from "better-sqlite3";
import type { Task } from "../../../packages/contracts/src/index";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
import { isTaskId } from "../../../packages/validation/src/index";
import { createComment, listComments } from "./comments";
import { publishCommentNotification } from "./notification-client";

type TaskReference = Pick<Task, "id" | "assigneeUserId">;
type TaskResolver = (taskId: string, actorId: string) => Promise<TaskReference | undefined>;

/** Resolves task ownership through the authenticated task-board boundary. */
async function resolveTask(taskId: string, actorId: string): Promise<TaskReference | undefined> {
  const origin = process.env.TASKIFY_TASK_BOARD_SERVICE_ORIGIN;
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !credential) return undefined;
  try {
    const response = await fetch(new URL(`/v1/tasks/${encodeURIComponent(taskId)}`, origin), {
      headers: { "X-Service-Credential": credential, "X-Actor-Id": actorId }
    });
    return response.ok ? ((await response.json()) as TaskReference) : undefined;
  } catch {
    return undefined;
  }
}

/** Publishes a post-commit comment event without rolling back owned comment state. */
async function notifyComment(actorId: string, task: TaskReference): Promise<void> {
  const origin = process.env.TASKIFY_NOTIFICATION_SERVICE_ORIGIN;
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !credential) return;
  try {
    await publishCommentNotification(origin, credential, {
      eventType: "comment_added",
      actorUserId: actorId,
      assigneeUserId: task.assigneeUserId,
      productManagerUserId: "usr-ada-pm",
      taskId: task.id
    });
  } catch {
    // The comment is already committed; the event contract supports safe retry.
  }
}

/** Handles authenticated append-only comment reads and creates. */
export async function handleCollaborationRequest(
  request: Request,
  db: Database.Database,
  credential?: string,
  taskResolver: TaskResolver = resolveTask
): Promise<Response> {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const url = new URL(request.url);
  const match = /^\/v1\/tasks\/(tsk-[a-z0-9-]{1,60})\/comments$/.exec(url.pathname);
  if (!match || !isTaskId(match[1])) return new Response(null, { status: 404 });
  if (!["GET", "POST"].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
  const actorId = request.headers.get("X-Actor-Id") ?? "";
  const task = await taskResolver(match[1], actorId);
  if (!task) return new Response(null, { status: 404 });
  if (request.method === "GET") return Response.json(listComments(db, task.id));
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const result = createComment(db, actorId, task.id, payload);
  if (!result.comment)
    return new Response(null, { status: result.code === "forbidden" ? 403 : 400 });
  await notifyComment(actorId, task);
  return Response.json(result.comment, { status: 201 });
}
