/** The only valid persisted task states, as defined by the v1 REST contract. */
export const TASK_STATUSES = ["todo", "in_progress", "in_review", "done"] as const;

/** A task's allowed Kanban state. */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** A fixed participant role in the seeded Taskify workspace. */
export type UserRole = "product_manager" | "engineer";

/** A predefined user available in the local demonstration environment. */
export interface User {
  id: string;
  displayName: string;
  role: UserRole;
}

/** A project returned by the project service. */
export interface Project {
  id: string;
  name: string;
  createdByUserId: string;
  createdAt: string;
}

/** A task returned by the task-board service. */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeUserId: string;
  status: TaskStatus;
  version: number;
}

/** Exactly one optimistic-concurrency-controlled task mutation. */
export type TaskPatch =
  | { assigneeUserId: string; version: number; status?: never }
  | { status: TaskStatus; version: number; assigneeUserId?: never };

/** A permanent comment returned by the collaboration service. */
export interface Comment {
  id: string;
  taskId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
}

/** A task event type visible to a recipient. */
export type NotificationEventType =
  "task_assigned" | "task_reassigned" | "task_status_changed" | "comment_added";

/** An in-app notification owned by the notification service. */
export interface Notification {
  id: string;
  recipientUserId: string;
  eventType: NotificationEventType;
  taskId: string;
  createdAt: string;
}

/** The finite, privacy-safe categories the v1 API exposes to callers. */
export type SafeErrorCode = "validation_error" | "forbidden" | "not_found" | "conflict";

/** A versioned API error that excludes diagnostic and sensitive implementation details. */
export interface SafeError {
  code: SafeErrorCode;
  message: string;
  correlationId: string;
}
