import type Database from "better-sqlite3";
import type { Task, TaskStatus } from "../../../packages/contracts/src/index";
import { TASK_STATUSES } from "../../../packages/contracts/src/index";
import { SEEDED_USERS } from "../../../packages/test-support/src/seed";
import {
  isAllowedText,
  isProjectId,
  isVersion,
  PATTERNS
} from "../../../packages/validation/src/index";
import { isProductManager } from "../../../packages/validation/src/authorization";
import { resolveActor } from "../../../packages/validation/src/actor";

type TaskResult = {
  task?: Task;
  code?: "validation_error" | "forbidden" | "not_found" | "conflict";
};

/** Lists task-board records belonging to one validated project identifier. */
export function listTasks(db: Database.Database, projectId: string): Task[] {
  return db
    .prepare(
      "SELECT id, project_id AS projectId, title, assignee_user_id AS assigneeUserId, status, version FROM tasks WHERE project_id = ? ORDER BY id"
    )
    .all(projectId) as Task[];
}

/** Creates a To Do task for an allow-listed engineer under product-manager authority. */
export function createTask(
  db: Database.Database,
  actorId: string,
  projectId: string,
  payload: unknown
): TaskResult {
  const actor = resolveActor(actorId);
  if (!actor || !isProductManager(actor)) return { code: "forbidden" };
  if (
    !isProjectId(projectId) ||
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    Object.keys(payload).length !== 2 ||
    !("title" in payload) ||
    !("assigneeUserId" in payload) ||
    !isAllowedText(payload.title, PATTERNS.taskTitle, 1, 200) ||
    typeof payload.assigneeUserId !== "string" ||
    !SEEDED_USERS.some((user) => user.id === payload.assigneeUserId && user.role === "engineer")
  )
    return { code: "validation_error" };
  const task: Task = {
    id: `tsk-${crypto.randomUUID()}`,
    projectId,
    title: payload.title.trim(),
    assigneeUserId: payload.assigneeUserId,
    status: "todo",
    version: 1
  };
  if (!task.title) return { code: "validation_error" };
  db.prepare(
    "INSERT INTO tasks (id, project_id, title, assignee_user_id, status, version) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(task.id, task.projectId, task.title, task.assigneeUserId, task.status, task.version);
  return { task };
}

/** Applies exactly one authorized, optimistic-concurrency-controlled task mutation. */
export function patchTask(
  db: Database.Database,
  actorId: string,
  taskId: string,
  payload: unknown
): TaskResult {
  const actor = resolveActor(actorId);
  const current = db
    .prepare(
      "SELECT id, project_id AS projectId, title, assignee_user_id AS assigneeUserId, status, version FROM tasks WHERE id = ?"
    )
    .get(taskId) as Task | undefined;
  if (!actor) return { code: "forbidden" };
  if (!current) return { code: "not_found" };
  if (typeof payload !== "object" || payload === null || Array.isArray(payload))
    return { code: "validation_error" };
  const input = payload as Record<string, unknown>;
  const keys = Object.keys(input);
  const isAssignment =
    keys.length === 2 &&
    keys.includes("assigneeUserId") &&
    keys.includes("version") &&
    typeof input.assigneeUserId === "string" &&
    isVersion(input.version);
  const isStatus =
    keys.length === 2 &&
    keys.includes("status") &&
    keys.includes("version") &&
    typeof input.status === "string" &&
    isVersion(input.version);
  if (!isAssignment && !isStatus) return { code: "validation_error" };
  if (input.version !== current.version) return { code: "conflict" };
  if (isAssignment) {
    if (!isProductManager(actor)) return { code: "forbidden" };
    if (!SEEDED_USERS.some((user) => user.id === input.assigneeUserId && user.role === "engineer"))
      return { code: "validation_error" };
    const result = db
      .prepare(
        "UPDATE tasks SET assignee_user_id = ?, version = version + 1 WHERE id = ? AND version = ?"
      )
      .run(input.assigneeUserId, taskId, input.version);
    if (result.changes !== 1) return { code: "conflict" };
  } else {
    const status = input.status as TaskStatus;
    if (!(TASK_STATUSES as readonly string[]).includes(status)) return { code: "validation_error" };
    if (!isProductManager(actor) && actor.id !== current.assigneeUserId)
      return { code: "forbidden" };
    const result = db
      .prepare("UPDATE tasks SET status = ?, version = version + 1 WHERE id = ? AND version = ?")
      .run(status, taskId, input.version);
    if (result.changes !== 1) return { code: "conflict" };
  }
  return {
    task: db
      .prepare(
        "SELECT id, project_id AS projectId, title, assignee_user_id AS assigneeUserId, status, version FROM tasks WHERE id = ?"
      )
      .get(taskId) as Task
  };
}
