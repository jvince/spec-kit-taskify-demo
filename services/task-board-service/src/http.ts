import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
import { createTask, getTask, listTasks, patchTask } from "./tasks";
import { publishTaskNotification } from "./notification-client";

/** Attempts post-commit delivery without rolling back the task service's committed state. */
async function publishAssignment(
  actorId: string,
  task: { id: string; assigneeUserId: string },
  eventType: "task_assigned" | "task_reassigned"
): Promise<void> {
  const origin = process.env.TASKIFY_NOTIFICATION_SERVICE_ORIGIN;
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !credential) return;
  try {
    await publishTaskNotification(origin, credential, {
      eventType,
      actorUserId: actorId,
      assigneeUserId: task.assigneeUserId,
      productManagerUserId: "usr-ada-pm",
      taskId: task.id
    });
  } catch {
    // The task is already committed; callers can safely retry the idempotent event publication.
  }
}

/** Publishes a post-commit status event without coupling task persistence to delivery. */
async function publishStatusChange(
  actorId: string,
  task: { id: string; assigneeUserId: string }
): Promise<void> {
  const origin = process.env.TASKIFY_NOTIFICATION_SERVICE_ORIGIN;
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !credential) return;
  try {
    await publishTaskNotification(origin, credential, {
      eventType: "task_status_changed",
      actorUserId: actorId,
      assigneeUserId: task.assigneeUserId,
      productManagerUserId: "usr-ada-pm",
      taskId: task.id
    });
  } catch {
    // State is committed independently; the stable idempotency contract makes retry safe.
  }
}

/** Checks project existence through its owning service rather than accessing its SQLite data. */
async function projectExists(projectId: string): Promise<boolean> {
  const origin = process.env.TASKIFY_PROJECT_SERVICE_ORIGIN;
  const credential = process.env.TASKIFY_SERVICE_CREDENTIAL;
  if (!origin || !credential) return true;
  try {
    const response = await fetch(new URL(`/v1/projects/${encodeURIComponent(projectId)}`, origin), {
      headers: { "X-Service-Credential": credential, "X-Actor-Id": "usr-ada-pm" }
    });
    return response.ok;
  } catch {
    return false;
  }
}
/** Handles authenticated task-board reads without exposing the private database. */
export async function handleTaskBoardRequest(
  request: Request,
  db: Database.Database,
  credential?: string
): Promise<Response> {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const url = new URL(request.url);
  const actorId = request.headers.get("X-Actor-Id") ?? "";
  const projectMatch = /^\/v1\/projects\/(prj-[a-z0-9-]{1,60})\/tasks$/.exec(url.pathname);
  if (projectMatch && request.method === "GET")
    return Response.json(listTasks(db, projectMatch[1]));
  if (projectMatch && request.method === "POST") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(null, { status: 400 });
    }
    if (!(await projectExists(projectMatch[1]))) return new Response(null, { status: 404 });
    const result = createTask(db, actorId, projectMatch[1], payload);
    if (result.task) {
      await publishAssignment(actorId, result.task, "task_assigned");
      return Response.json(result.task, { status: 201 });
    }
    return new Response(null, {
      status:
        result.code === "forbidden"
          ? 403
          : result.code === "not_found"
            ? 404
            : result.code === "conflict"
              ? 409
              : 400
    });
  }
  const taskMatch = /^\/v1\/tasks\/(tsk-[a-z0-9-]{1,60})$/.exec(url.pathname);
  if (taskMatch && request.method === "GET") {
    const task = getTask(db, taskMatch[1]);
    return task ? Response.json(task) : new Response(null, { status: 404 });
  }
  if (taskMatch && request.method === "PATCH") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(null, { status: 400 });
    }
    const result = patchTask(db, actorId, taskMatch[1], payload);
    if (result.task) {
      const isReassignment =
        typeof payload === "object" && payload !== null && "assigneeUserId" in payload;
      if (isReassignment) await publishAssignment(actorId, result.task, "task_reassigned");
      else await publishStatusChange(actorId, result.task);
      return Response.json(result.task);
    }
    return new Response(null, {
      status:
        result.code === "forbidden"
          ? 403
          : result.code === "not_found"
            ? 404
            : result.code === "conflict"
              ? 409
              : 400
    });
  }
  return new Response(null, { status: 404 });
}
